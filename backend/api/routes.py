# backend/api/routes.py

from schemas import product as product_schema
from crud import crud_product
from database import get_db
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from schemas import user as user_schema
from crud import crud_user
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from security import verify_password, create_access_token, get_current_user, get_current_manager
from schemas import inventory as inventory_schema
from crud import crud_inventory
from schemas import analytics as analytics_schema
from crud import crud_analytics
from models import product as product_model
from sqlalchemy.exc import IntegrityError


router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: str

@router.post("/login/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud_user.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_data = {"sub": user.email}
    # Pass the user's role to the token creation function
    access_token = create_access_token(data=access_token_data, user_role=user.role) 
    
    # Return the role in the response body
    return {"access_token": access_token, "token_type": "bearer", "user_role": user.role}

@router.post("/products/", response_model=product_schema.Product)
def create_new_product(
    product: product_schema.ProductCreate,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_manager)
):
    return crud_product.create_product(db=db, product=product)

@router.get("/products/", response_model=list[product_schema.Product])
def read_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)
):
    products = crud_product.get_products(db, skip=skip, limit=limit)
    return products

@router.get("/products/{product_id}", response_model=product_schema.Product)
def read_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)
):
    db_product = crud_product.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.put("/products/{product_id}", response_model=product_schema.Product)
def update_existing_product(
    product_id: uuid.UUID,
    product_in: product_schema.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_manager)
):
    # First, get the existing product
    db_product = crud_product.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    # Then pass it to the update function
    updated_product = crud_product.update_product(
        db=db, db_product=db_product, product_in=product_in
    )
    return updated_product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_manager)
):
    try:
        db_product = crud_product.delete_product(db, product_id=product_id)
    except IntegrityError:
        # Product is referenced by other rows (e.g., inventory movements)
        raise HTTPException(status_code=400, detail="Cannot delete product with existing inventory movements. Remove or reassign those records first.")

    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    # No response body is sent on a 204 status code
    return None

@router.post("/users/", response_model=user_schema.User, status_code=status.HTTP_201_CREATED)
def register_new_user(
    user: user_schema.UserCreate,
    db: Session = Depends(get_db)
):
    # Check if user with this email already exists
    db_user = crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )
    return crud_user.create_user(db=db, user=user)

@router.post("/inventory/move", response_model=product_schema.Product)
def create_move(
    movement: inventory_schema.InventoryMovementCreate,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)
):
    updated_product = crud_inventory.create_inventory_movement(
        db=db, movement=movement, user_id=current_user.id
    )
    if updated_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated_product

@router.get("/analytics/kpis", response_model=analytics_schema.DashboardKPIs)
def read_dashboard_kpis(
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_manager)
):
    return crud_analytics.get_dashboard_kpis(db=db)

@router.get(
    "/analytics/historical/{product_id}",
    response_model=list[analytics_schema.HistoricalDataPoint]
)
def read_product_historical_data(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_manager)
):
    return crud_analytics.get_product_historical_data(db=db, product_id=product_id)
@router.get(
    "/analytics/forecast/{product_id}",
    response_model=list[analytics_schema.HistoricalDataPoint]
)
def read_product_demand_forecast(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_manager)
):
    forecast_data = crud_analytics.get_product_demand_forecast(db=db, product_id=product_id)
    return forecast_data

@router.get(
    "/analytics/scheduled/{product_id}",
    response_model=list[analytics_schema.HistoricalDataPoint]
)
def read_product_scheduled_data(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_manager)
):
    return crud_analytics.get_product_scheduled_data(db=db, product_id=product_id)

@router.get("/products/sku/{sku}", response_model=product_schema.Product)
def read_product_by_sku(
    sku: str,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)
):
    # Find the first product that matches the SKU
    db_product = db.query(product_model.Product).filter(
        product_model.Product.sku == sku,
        product_model.Product.is_deleted == False
    ).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.get(
    "/analytics/anomalies",
    response_model=list[analytics_schema.AnomalyDataPoint]
)
def read_anomalous_movements(
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_manager)
):
    return crud_analytics.get_anomalous_movements(db=db)

@router.get(
    "/analytics/anomalies/{product_id}",
    response_model=list[analytics_schema.AnomalyDataPoint]
)
def read_anomalies_for_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_manager)
):
    return crud_analytics.get_anomalies_for_product(db=db, product_id=product_id)
# backend/crud/crud_product.py

from sqlalchemy.orm import Session
import uuid
from models import product as product_model
from schemas import product as product_schema

def create_product(db: Session, product: product_schema.ProductCreate):
    """
    Create a new product in the database.
    """
    db_product = product_model.Product(
        sku=product.sku,
        name=product.name,
        description=product.description,
        reorder_point=product.reorder_point 
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# --- THIS IS THE MISSING FUNCTION ---
def get_product(db: Session, product_id: uuid.UUID):
    """
    Get a single product by its ID.
    """
    return db.query(product_model.Product).filter(
        product_model.Product.id == product_id,
        product_model.Product.is_deleted == False
    ).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    """
    Get a list of all products with pagination, sorted by name.
    """
    return db.query(product_model.Product).filter(
        product_model.Product.is_deleted == False
    ).order_by(
        product_model.Product.name.asc()
    ).offset(skip).limit(limit).all()

def update_product(
    db: Session,
    db_product: product_model.Product,
    product_in: product_schema.ProductUpdate
):
    """
    Update a product's details.
    """
    update_data = product_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: uuid.UUID):
    """
    Soft-delete a product by setting `is_deleted` flag.
    """
    db_product = db.query(product_model.Product).filter(product_model.Product.id == product_id).first()
    if db_product:
        db_product.is_deleted = True
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
    return db_product
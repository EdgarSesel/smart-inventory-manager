# backend/crud/crud_inventory.py
from sqlalchemy.orm import Session
from models import product as product_model, inventory as inventory_model
from schemas import inventory as inventory_schema
import uuid

def create_inventory_movement(db: Session, movement: inventory_schema.InventoryMovementCreate, user_id: uuid.UUID):
    # Get the product and lock the row for update
    db_product = db.query(product_model.Product).filter(
        product_model.Product.id == movement.product_id
    ).with_for_update().first()

    if not db_product:
        return None

    db_product.quantity_on_hand += movement.change_quantity

    # Create the movement log record
    db_movement = inventory_model.InventoryMovement(
        product_id=movement.product_id,
        user_id=user_id,
        change_quantity=movement.change_quantity,
        new_quantity_on_hand=db_product.quantity_on_hand,
        reason=movement.reason,
        status='COMPLETED'
    )

    db.add(db_movement)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product
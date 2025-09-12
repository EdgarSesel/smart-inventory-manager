# backend/schemas/inventory.py
import uuid
from pydantic import BaseModel

class InventoryMovementCreate(BaseModel):
    product_id: uuid.UUID
    change_quantity: int
    reason: str
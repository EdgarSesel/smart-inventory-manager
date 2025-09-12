# backend/schemas/product.py

import uuid
from pydantic import BaseModel, Field

# Shared properties
class ProductBase(BaseModel):
    sku: str = Field(..., description="Stock Keeping Unit")
    name: str
    description: str | None = None

# Properties to receive on item creation
class ProductCreate(ProductBase):
    pass

# Properties to return to client
class Product(ProductBase):
    id: uuid.UUID
    quantity_on_hand: int
    reorder_point: int

    class Config:
        from_attributes = True

class ProductUpdate(BaseModel):
    sku: str | None = None
    name: str | None = None
    description: str | None = None
    reorder_point: int | None = None
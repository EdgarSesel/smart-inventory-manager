# backend/schemas/product.py
import uuid
from pydantic import BaseModel, Field

# This is the base model with all common fields
class ProductBase(BaseModel):
    sku: str = Field(..., description="Stock Keeping Unit")
    name: str
    description: str | None = None
    reorder_point: int = 10 # <-- THE FIX IS TO HAVE IT HERE

# This model is used for creating a new product
class ProductCreate(ProductBase):
    pass # It inherits all the fields from ProductBase

# This model is used when updating a product, all fields are optional
class ProductUpdate(BaseModel):
    sku: str | None = None
    name: str | None = None
    description: str | None = None
    reorder_point: int | None = None

# This is the main model used for API responses
class Product(ProductBase):
    id: uuid.UUID
    quantity_on_hand: int

    class Config:
        from_attributes = True
# backend/models/product.py

import uuid
from sqlalchemy import Column, String, Text, Integer
from sqlalchemy import Boolean
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    reorder_point = Column(Integer, default=10, nullable=False)
    quantity_on_hand = Column(Integer, default=0, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

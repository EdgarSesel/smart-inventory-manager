# backend/models/inventory.py
import uuid
from sqlalchemy import Column, Integer, String, ForeignKey, func, DateTime
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    change_quantity = Column(Integer, nullable=False)
    new_quantity_on_hand = Column(Integer, nullable=False)
    reason = Column(String, nullable=True)
    status = Column(String, default='COMPLETED', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
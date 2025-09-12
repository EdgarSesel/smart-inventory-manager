# backend/schemas/analytics.py
from pydantic import BaseModel
from datetime import datetime
import uuid 

class DashboardKPIs(BaseModel):
    total_products: int
    low_stock_items: int

class HistoricalDataPoint(BaseModel):
    timestamp: datetime
    quantity: int

class AnomalyDataPoint(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    product_name: str
    change_quantity: int
    event_date: str
    reason: str | None

    class Config:
        from_attributes = True
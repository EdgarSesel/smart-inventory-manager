# In backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import product, user, inventory
from api import routes
from datetime import datetime

def custom_json_encoder(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    from pydantic.json import pydantic_encoder
    return pydantic_encoder(obj)

# Create the FastAPI app
app = FastAPI(title="Smart Inventory Manager API")

# This logic checks your FastAPI version and applies the correct setting.
try:
    from fastapi.utils import F_PYDANTIC_V2
    if F_PYDANTIC_V2:
        app.json_serializer = custom_json_encoder
    else:
        app.json_encoders = {datetime: lambda v: v.isoformat()}
except ImportError:
    app.json_encoders = {datetime: lambda v: v.isoformat()}



# Create all tables
product.Base.metadata.create_all(bind=engine)
user.Base.metadata.create_all(bind=engine)
inventory.Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(routes.router)
@app.get("/")
async def read_root():
    return {"message": "Welcome to the Smart Inventory Manager API"}
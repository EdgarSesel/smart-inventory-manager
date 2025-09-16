# backend/crud/crud_user.py

from sqlalchemy.orm import Session
from models import user as user_model
from schemas import user as user_schema
from security import get_password_hash

def get_user_by_email(db: Session, email: str):
    """Fetches a user by their email address."""
    return db.query(user_model.User).filter(user_model.User.email == email).first()

def create_user(db: Session, user: user_schema.UserCreate):
    """Creates a new user, hashing the password before storing."""
    hashed_password = get_password_hash(user.password)
    user_count = db.query(user_model.User).count()
    user_role = "manager" if user_count == 0 else "operator"

    db_user = user_model.User(
        email=user.email,
        hashed_password=hashed_password,
        role=user_role # Assign the determined role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
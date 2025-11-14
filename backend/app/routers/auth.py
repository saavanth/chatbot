from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models import User
from datetime import datetime
import uuid
import jwt

SECRET_KEY = "super-secret-key"  # ⚠️ put in .env in production
ALGORITHM = "HS256"

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------
# Register new user
# -----------------------
@router.post("/register")
def register(username: str, email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        id=uuid.uuid4(),
        username=username,
        email=email,
        created_at=datetime.utcnow(),
        last_login=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"id": str(new_user.id), "username": new_user.username, "email": new_user.email}

# -----------------------
# Login (simple: by email)
# -----------------------
@router.post("/login")
def login(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    payload = {"sub": str(user.id), "username": user.username}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {"access_token": token, "token_type": "bearer"}
# app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt, JWTError
from pydantic import BaseModel
import uuid

from app.db import SessionLocal
from app.models import User

SECRET_KEY = "a107a49a91d213ce75c301e677f10f9d019d157882cfb3c8e51f2a74d50c8910"  # put in env variable in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------
# Schemas
# -----------------------
class AuthRequest(BaseModel):
    username: str
    email: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# -----------------------
# JWT helpers
# -----------------------
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# -----------------------
# Register
# -----------------------
@router.post("/register", response_model=TokenResponse)
def register(auth: AuthRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == auth.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(id=uuid.uuid4(), username=auth.username, email=auth.email)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

# -----------------------
# Login
# -----------------------
@router.post("/login", response_model=TokenResponse)
def login(auth: AuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == auth.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email")

    token = create_access_token({"sub": str(user.id)})
    user.last_login = datetime.utcnow()
    db.commit()
    return {"access_token": token, "token_type": "bearer"}

# -----------------------
# Current User dependency
# -----------------------
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
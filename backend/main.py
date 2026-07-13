from datetime import datetime
from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from sqlmodel import Session, select

from . import database, models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(
    title="Random Picker Auth API",
    description="Provides login, signup, and user CRUD functionality for the React random picker frontend",
)

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    database.init_db()


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_user_by_email(session: Session, email: str) -> models.User | None:
    return session.exec(select(models.User).where(models.User.email == email)).first()


@app.post("/signup", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def signup(
    payload: schemas.SignUpRequest,
    session: Session = Depends(database.get_session),
) -> models.User:
    if get_user_by_email(session, payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    user = models.User(
        name=payload.name,
        email=payload.email,
        role=payload.role,
        password_hash=get_password_hash(payload.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@app.post("/login", response_model=schemas.AuthResponse)
def login(
    payload: schemas.LoginRequest,
    session: Session = Depends(database.get_session),
) -> schemas.AuthResponse:
    user = get_user_by_email(session, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return schemas.AuthResponse(message=f"Logged in as {user.name}", user=user)


@app.get("/users", response_model=List[schemas.UserRead])
def list_users(session: Session = Depends(database.get_session)) -> List[models.User]:
    return session.exec(select(models.User).order_by(models.User.created_at.desc())).all()


@app.put("/users/{user_id}", response_model=schemas.UserRead)
def update_user(
    user_id: int,
    payload: schemas.UserUpdate,
    session: Session = Depends(database.get_session),
) -> models.User:
    user = session.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.email and payload.email != user.email:
        if get_user_by_email(session, payload.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use",
            )
        user.email = payload.email

    if payload.name:
        user.name = payload.name

    if payload.role:
        user.role = payload.role

    if payload.password:
        if len(payload.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long",
            )
        user.password_hash = get_password_hash(payload.password)

    user.updated_at = datetime.utcnow()
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@app.delete("/users/{user_id}", response_model=schemas.DeleteResponse)
def delete_user(user_id: int, session: Session = Depends(database.get_session)) -> schemas.DeleteResponse:
    user = session.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    session.delete(user)
    session.commit()
    return schemas.DeleteResponse(message=f"User {user.name} removed")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}

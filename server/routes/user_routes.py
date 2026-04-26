from fastapi import APIRouter, HTTPException, Request, Depends
from typing import Optional
from pydantic import BaseModel, EmailStr

from models.user import User
from user.main import UserStore
from util.hash_helper import HashHelper
from util.jwt_helper import JWTHelper
from util.auth import get_current_user


user_router = APIRouter(prefix="/user", tags=["user"])


def get_user_store(request: Request) -> UserStore:
    client = request.app.state.supabase_client
    return UserStore(client)


class UserRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


@user_router.post("/register", response_model=User)
def register_user(
    payload: UserRegisterRequest,
    store: UserStore = Depends(get_user_store)
):
    existing = store.load_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    return store.create(
        name=payload.name,
        email=payload.email,
        password=payload.password
    )


@user_router.post("/login")
def login_user(
    payload: UserLoginRequest,
    store: UserStore = Depends(get_user_store)
):
    user = store.load_by_email(payload.email)

    if not user or not HashHelper.verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = JWTHelper.get_token(user)
    return {"access_token": token}


@user_router.get("/me", response_model=User)
def get_me(
    current_user=Depends(get_current_user),
    store: UserStore = Depends(get_user_store)
):
    user = store.load_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@user_router.put("/me", response_model=User)
def update_me(
    payload: UserUpdateRequest,
    current_user=Depends(get_current_user),
    store: UserStore = Depends(get_user_store)
):
    user = store.load_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return store.update(**payload.model_dump(exclude_none=True))


@user_router.delete("/me")
def delete_me(
    current_user=Depends(get_current_user),
    store: UserStore = Depends(get_user_store)
):
    user = store.load_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    store.delete()
    return {"detail": "User deleted successfully"}
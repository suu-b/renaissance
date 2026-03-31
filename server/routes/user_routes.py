from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from models.user import User
from controllers.user_controller import list_users, find_user, find_user_by_id, create_user, update_user, delete_user
from supabase_client import get_supabase_client
from util.hash_helper import HashHelper

user_router = APIRouter(prefix="/user", tags=["user"])

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

@user_router.get("/", response_model=List[User])
async def get_all_users(client=Depends(get_supabase_client)):
    return await list_users(client)

@user_router.get("/{user_id}", response_model=User)
async def get_user_by_id(user_id: str, client=Depends(get_supabase_client)):
    user = await find_user_by_id(client, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@user_router.get("/email/{email}", response_model=User)
async def get_user_by_email(email: str, client=Depends(get_supabase_client)):
    user = await find_user(client, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@user_router.post("/register", response_model=User)
async def register_user(request: UserRegisterRequest, client=Depends(get_supabase_client)):
    existing = await find_user(client, request.email)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    return await create_user(client, request.name, request.email, request.password)

@user_router.post("/login", response_model=User)
async def login_user(request: UserLoginRequest, client=Depends(get_supabase_client)):
    user = await find_user(client, request.email)
    if not user or not HashHelper.verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

@user_router.put("/{email}", response_model=User)
async def update_existing_user(email: str, request: UserUpdateRequest, client=Depends(get_supabase_client)):
    updated = await update_user(client, email, **request.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@user_router.delete("/{email}")
async def delete_existing_user(email: str, client=Depends(get_supabase_client)):
    success = await delete_user(client, email)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted successfully"}
from typing import Optional, List
from util.hash_helper import HashHelper
from models.user import User
import logging

logger = logging.getLogger(__name__)

TABLE_NAME = "users"

async def list_users(client) -> List[User]:
    logger.info("Fetching all users")
    resp = client.table(TABLE_NAME).select("*").execute()
    return [User(**u) for u in resp.data]

async def find_user(client, email: str) -> Optional[User]:
    logger.info(f"Finding user by email: {email}")
    resp = client.table(TABLE_NAME).select("*").eq("email", email).limit(1).execute()
    if resp.data:
        return User(**resp.data[0])
    return None

async def find_user_by_id(client, user_id: str) -> Optional[User]:
    logger.info(f"Finding user by ID: {user_id}")
    resp = client.table(TABLE_NAME).select("*").eq("id", user_id).limit(1).execute()
    if resp.data:
        return User(**resp.data[0])
    return None

async def create_user(client, name: str, email: str, password: str) -> User:
    logger.info(f"Creating new user: {email}")
    hashed_password = HashHelper.hash_password(password)
    resp = client.table(TABLE_NAME).insert({
        "name": name,
        "email": email,
        "password": hashed_password
    }).execute()
    logger.info(f"User created successfully: {email}")
    return User(**resp.data[0])

async def update_user(client, email: str, **kwargs) -> Optional[User]:
    logger.info(f"Updating user: {email}")
    update_data = {k: v for k, v in kwargs.items() if k in ["name", "email"]}
    resp = client.table(TABLE_NAME).update(update_data).eq("email", email).execute()
    if resp.data:
        logger.info(f"User updated successfully: {email}")
        return User(**resp.data[0])
    logger.warning(f"User not found for update: {email}")
    return None

async def delete_user(client, email: str) -> bool:
    logger.info(f"Deleting user: {email}")
    resp = client.table(TABLE_NAME).delete().eq("email", email).execute()
    if resp.data:
        logger.info(f"User deleted successfully: {email}")
        return True
    logger.warning(f"User not found for deletion: {email}")
    return False

# curl -X POST http://localhost:8000/user/ -H "Content-Type: application/json" -d '{"name":"suub","email":"suub@gmail.com","password":"password"}'
from typing import Optional
import logging

from util.hash_helper import HashHelper
from models.user import User

logger = logging.getLogger(__name__)

class UserStore:
    TABLE_NAME = "users"

    def __init__(self, client):
        self._client = client
        self._user: Optional[User] = None
        self._logger = logging.getLogger(__name__)

    def get(self) -> Optional[User]:
        return self._user

    def load_by_email(self, email: str) -> Optional[User]:
        self._logger.info(f"Loading user by email: {email}")

        resp = (
            self._client
            .table(self.TABLE_NAME)
            .select("*")
            .eq("email", email)
            .limit(1)
            .execute()
        )

        if resp.data:
            self._user = User(**resp.data[0])
            return self._user

        return None

    def load_by_id(self, user_id: str) -> Optional[User]:
        self._logger.info(f"Loading user by ID: {user_id}")

        resp = (
            self._client
            .table(self.TABLE_NAME)
            .select("*")
            .eq("id", user_id)
            .limit(1)
            .execute()
        )

        if resp.data:
            self._user = User(**resp.data[0])
            return self._user

        return None

    def create(self, name: str, email: str, password: str) -> User:
        self._logger.info(f"Creating user: {email}")

        hashed_password = HashHelper.hash_password(password)

        resp = (
            self._client
            .table(self.TABLE_NAME)
            .insert({
                "name": name,
                "email": email,
                "password": hashed_password
            })
            .execute()
        )

        self._user = User(**resp.data[0])
        return self._user

    def update(self, **kwargs) -> Optional[User]:
        if not self._user:
            raise RuntimeError("No user loaded")

        update_data = {k: v for k, v in kwargs.items() if k in ["name", "email"]}

        self._logger.info(f"Updating user: {self._user.email}")

        resp = (
            self._client
            .table(self.TABLE_NAME)
            .update(update_data)
            .eq("id", self._user.id)
            .execute()
        )

        if resp.data:
            self._user = User(**resp.data[0])
            return self._user

        return None

    def delete(self) -> bool:
        if not self._user:
            raise RuntimeError("No user loaded")

        self._logger.info(f"Deleting user: {self._user.email}")

        resp = (
            self._client
            .table(self.TABLE_NAME)
            .delete()
            .eq("id", self._user.id)
            .execute()
        )

        if resp.data:
            self._user = None
            return True

        return False
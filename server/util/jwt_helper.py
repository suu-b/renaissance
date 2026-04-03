import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

from models.user import User

load_dotenv()

SECRET = os.getenv("SECRET", "")
if not SECRET:
    raise Exception("No secret found")


class JWTHelper:
    @staticmethod
    def get_token(user: User) -> str:
        payload = {
            "user_id": str(user.id),
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        return jwt.encode(payload, SECRET, algorithm="HS256")

    @staticmethod
    def decode_token(token: str) -> dict:
        try:
            decoded = jwt.decode(token, SECRET, algorithms=["HS256"])
            return decoded
        except jwt.ExpiredSignatureError:
            raise Exception("Token expired")
        except jwt.InvalidTokenError:
            raise Exception("Invalid token")
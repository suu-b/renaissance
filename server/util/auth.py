import jwt
import os

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET = os.getenv("SECRET", "")

security = HTTPBearer()


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    token = creds.credentials

    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return {"user_id": payload["user_id"], "email": payload.get("email")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
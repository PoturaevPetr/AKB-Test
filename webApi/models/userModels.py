from fastapi_users import schemas
import uuid
from typing import Optional

class UserRead(schemas.BaseUser[uuid.UUID]):
    email: Optional[str] = None
    pass


class UserCreate(schemas.BaseUserCreate):
    email: Optional[str] = None
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass
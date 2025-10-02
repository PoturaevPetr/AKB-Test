from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin, models
from fastapi_users.authentication import (
    AuthenticationBackend,
    CookieTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from webApi.database import User, get_user_db
import uuid
from typing import Optional
from fastapi import Depends, Request
from webApi import AppConfig

# Ваша реализация UserManager
class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = AppConfig.SECRET_KEY
    verification_token_secret = AppConfig.SECRET_KEY

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")

# Объявление функции get_user_manager
async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)

# Создаете транспорт для cookie
cookie_transport = CookieTransport(cookie_name="access_token", cookie_secure=False, cookie_httponly=True)

# Стратегия JWT
def get_jwt_strategy() -> JWTStrategy[models.UP, models.ID]:
    return JWTStrategy(
        secret=AppConfig.SECRET_KEY,
        lifetime_seconds=AppConfig.ACCESS_TOKEN_EXPIRE_SECONDS
    )

# Создаете бекенд
auth_backend = AuthenticationBackend(
    name="jwt",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

# Теперь создайте FastAPIUsers, передав функцию get_user_manager
fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])

# Текущий активный пользователь
current_active_user = fastapi_users.current_user(active=True)
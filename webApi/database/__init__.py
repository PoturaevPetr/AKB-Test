from webApi import AppConfig
from sqlalchemy import (
    Column, 
    Integer, 
    String, 
    Boolean, 
    UUID, 
    ForeignKey, 
    DateTime, 
    Text, 
    JSON, 
    Date, 
    Enum,
    func
)
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from collections.abc import AsyncGenerator
from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.orm.attributes import flag_modified
import uuid
from passlib.context import CryptContext
from sqlalchemy.future import select

engine = create_async_engine(AppConfig.SQLALCHEMY_DATABASE_URL)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

from webApi.database.User import User
from webApi.database.Battery import Battery
from webApi.database.Device import Device


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

async def create_admin_user():
    async with SessionLocal() as session:
        user_db = SQLAlchemyUserDatabase(session, User)
        # Проверяем, есть ли уже админ
        admin_email = "Admin"
        existing_admin = await user_db.get_by_email(admin_email)
        if existing_admin:
            return  # Админ уже есть

        # Создаем нового администратора
        admin_user = {
            "email": admin_email,
            "hashed_password": get_password_hash("qwerty123"),
            "is_active": True,
            "is_superuser": True,
        }
        await user_db.create(admin_user)



async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            session.close()



async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
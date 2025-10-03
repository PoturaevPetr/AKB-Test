from config import config
import os
from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from starlette.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Not needed if you setup a migration system like Alembic
    await create_db_and_tables()
    await create_admin_user()
    yield

webApi = FastAPI(lifespan=lifespan)

webApi.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory=os.path.join(os.getcwd(), config['APPLICATION']['template_folder'], 'pages'))
static_js =  StaticFiles(directory=os.path.join(os.getcwd(), config['APPLICATION']['template_folder'], 'static', 'js'))

class AppConfig:
    SECRET_KEY = "2qwtq2"  # Замените на свой секретный ключ
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_SECONDS = 3600
    SQLALCHEMY_DATABASE_URL = config['DATABASE']['URI']

from webApi.helper.auth import *
from webApi.models import *
from webApi.database import *
from webApi.interfaces import *
from webApi.helper.exceptions import *




from webApi import *
from config import config
from fastapi import Depends, HTTPException, status, Path
from sqlalchemy.exc import IntegrityError
from typing import List
from sqlalchemy.orm import selectinload
import json

class SignalAPI(BaseModel):
    id: int
    name: str
    value: str    

class DevicesAPI(BaseModel):
    id: int
    name: str
    signals: List[SignalAPI]

@webApi.get("/devices/list")
async def devices_api_list(user: User = Depends(current_active_user)):
    with open('devices.json', 'r') as f:
        data = json.load(f)
        return data
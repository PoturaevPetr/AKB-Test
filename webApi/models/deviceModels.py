import datetime
import uuid 
from typing import Optional, List
from pydantic import BaseModel, Field
from webApi.models.batteryModels import BatteryShema

class DeviceSchema(BaseModel):
    id: uuid.UUID
    name: str
    version: str
    state: bool
    max_batteries: int
    device_api_id: str
    props: Optional[dict] = {}
    class Config:
        orm_mode = True

class DeviceWithBatterySchema(BaseModel):
    id: uuid.UUID
    name: str
    version: str
    state: bool
    max_batteries: int
    device_api_id: str
    props: Optional[dict] = {}
    batteries: List[BatteryShema]

    class Config:
        orm_mode = True
    
    
class PostDevice(BaseModel):
    name: str
    version: str
    state: bool
    max_batteries: int
    device_api_id: str
    props: Optional[dict] = None

class PutDevice(BaseModel):
    id: uuid.UUID = Field(..., description="ID устройства для обновления")
    name: Optional[str] = None
    version: Optional[str] = None
    state: Optional[bool] = None
    max_batteries: Optional[int] = None
    device_api_id: Optional[str] = None
    props: Optional[dict] = None
import datetime
import uuid 
from typing import Optional
from pydantic import BaseModel, Field

class BatteryShema(BaseModel):
    id: uuid.UUID
    name: str
    voltage: str
    capacity: str
    device_id: uuid.UUID
    service_life: int

    class Config:
        orm_mode = True

class PostBattery(BaseModel):
    name: str
    voltage: str
    capacity: str
    device_id: uuid.UUID = Field(..., description="ID устройства для связи")
    service_life: Optional[int]


class PutBattery(BaseModel):
    id: str
    name: Optional[str] = None
    voltage: Optional[str] = None
    capacity: Optional[str] = None
    device_id: Optional[str] = None
    service_life: Optional[int] = None
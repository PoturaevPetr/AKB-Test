from webApi.database import *
import uuid

class Battery(Base):
    __tablename__ = "battery"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, default="")
    voltage = Column(Text, default="")
    capacity = Column(Text, default="")
    service_life = Column(Integer, default="")
    device_id = Column(UUID(as_uuid=True), ForeignKey('device.id'))

    

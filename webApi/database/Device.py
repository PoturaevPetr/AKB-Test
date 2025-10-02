from webApi.database import *
import uuid

class Device(Base):
    __tablename__ = "device"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, unique=True)
    version = Column(Text)
    state = Column(Boolean, default=True)
    max_batteries = Column(Integer)
    batteries = relationship("Battery", backref="device")

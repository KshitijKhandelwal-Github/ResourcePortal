from pydantic import BaseModel
from typing import Optional

class LocationBase(BaseModel):
    name: str

class LocationCreate(LocationBase):
    pass

class LocationUpdate(LocationBase):
    pass

class LocationOut(LocationBase):
    id: int

    class Config:
        from_attributes = True


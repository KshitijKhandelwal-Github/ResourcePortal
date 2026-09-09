from pydantic import BaseModel
from typing import Optional

class LocationBase(BaseModel):
    city: str
    state: Optional[str] = None
    country: Optional[str] = None

class LocationCreate(LocationBase):
    pass

class LocationUpdate(LocationBase):
    pass

class LocationOut(LocationBase):
    id: int

    class Config:
        from_attributes = True


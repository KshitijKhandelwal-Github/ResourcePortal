from pydantic import BaseModel
from typing import Optional

class ClusterBase(BaseModel):
    name: str
    description: Optional[str] = None

class ClusterCreate(ClusterBase):
    pass

class ClusterUpdate(ClusterBase):
    pass

class ClusterOut(ClusterBase):
    id: int

    class Config:
        from_attributes = True


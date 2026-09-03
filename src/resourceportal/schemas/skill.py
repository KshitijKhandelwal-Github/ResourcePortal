from pydantic import BaseModel
from typing import Optional

class SkillBase(BaseModel):
    name: str
    category: str

class SkillCreate(SkillBase):
    pass

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None

class SkillOut(SkillBase):
    id: int

    class Config:
        from_attributes = True


from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TrainingBase(BaseModel):
    training_name: str
    skill_id: Optional[int] = None
    status: str = "Planned"
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    description: Optional[str] = None

class TrainingCreate(TrainingBase):
    pass

class TrainingUpdate(BaseModel):
    training_name: Optional[str] = None
    skill_id: Optional[int] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    description: Optional[str] = None

class TrainingOut(BaseModel):
    id: int
    resource_id: int
    training_name: str
    skill_id: Optional[int] = None
    status: str
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True

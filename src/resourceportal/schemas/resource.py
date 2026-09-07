from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SkillBrief(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    class Config:
        from_attributes = True

class ClusterBrief(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class LocationBrief(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class ResourceBase(BaseModel):
    employee_id: str
    name: str
    email: str
    cluster_id: int
    designation: Optional[str] = None
    years_of_experience: Optional[float] = None
    current_location_id: Optional[int] = None
    preferred_location_id: Optional[int] = None
    availability_status: str = "Available"
    primary_skill_id: Optional[int] = None
    user_id: Optional[int] = None

class ResourceCreate(BaseModel):
    employee_id: str
    name: str
    email: str
    cluster_id: int
    designation: Optional[str] = None
    years_of_experience: Optional[float] = None
    current_location_id: Optional[int] = None
    preferred_location_id: Optional[int] = None
    availability_status: str = "Available"
    primary_skill_id: Optional[int] = None
    user_id: int
    secondary_skill_ids: Optional[List[int]] = []

class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    cluster_id: Optional[int] = None
    designation: Optional[str] = None
    years_of_experience: Optional[float] = None
    current_location_id: Optional[int] = None
    preferred_location_id: Optional[int] = None
    availability_status: Optional[str] = None
    primary_skill_id: Optional[int] = None
    secondary_skill_ids: Optional[List[int]] = None

class ResourceOut(BaseModel):
    id: int
    employee_id: str
    name: str
    email: str
    cluster_id: int
    designation: Optional[str] = None
    years_of_experience: Optional[float] = None
    current_location_id: Optional[int] = None
    preferred_location_id: Optional[int] = None
    availability_status: str
    primary_skill_id: Optional[int] = None
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # Nested relationships
    cluster: Optional[ClusterBrief] = None
    primary_skill: Optional[SkillBrief] = None
    current_location: Optional[LocationBrief] = None
    preferred_location: Optional[LocationBrief] = None
    skills: Optional[List[SkillBrief]] = []

    class Config:
        from_attributes = True

class ResourceListResponse(BaseModel):
    items: List[ResourceOut]
    total: int
    skip: int
    limit: int

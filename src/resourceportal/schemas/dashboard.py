from pydantic import BaseModel

class SummaryMetrics(BaseModel):
    total: int
    available: int
    allocated: int
    on_training: int
    on_leave: int

class SkillDistribution(BaseModel):
    skill_name: str
    count: int

class LocationDistribution(BaseModel):
    location_name: str
    count: int

class ExperienceDistribution(BaseModel):
    range: str
    count: int

class TrainingMetrics(BaseModel):
    status: str
    count: int

class AvailabilityMetrics(BaseModel):
    status: str
    count: int

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from resourceportal.database.database import get_db
from resourceportal.schemas.dashboard import (
    SummaryMetrics, SkillDistribution, LocationDistribution,
    ExperienceDistribution, TrainingMetrics, AvailabilityMetrics
)
from resourceportal.services import dashboard_service
from resourceportal.utils.dependencies import require_role
from resourceportal.models.user import User

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=SummaryMetrics)
def get_summary(
    cluster_id: Optional[int] = None,
    skill_id: Optional[int] = None,
    location_id: Optional[int] = None,
    availability_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "senior_associate"])),
):
    return dashboard_service.get_summary_metrics(db, cluster_id, skill_id, location_id, availability_status)

@router.get("/skills", response_model=list[SkillDistribution])
def get_skills(
    cluster_id: Optional[int] = None,
    skill_id: Optional[int] = None,
    location_id: Optional[int] = None,
    availability_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "senior_associate"])),
):
    return dashboard_service.get_skill_distribution(db, cluster_id, skill_id, location_id, availability_status)

@router.get("/location", response_model=list[LocationDistribution])
def get_locations(
    cluster_id: Optional[int] = None,
    skill_id: Optional[int] = None,
    location_id: Optional[int] = None,
    availability_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "senior_associate"])),
):
    return dashboard_service.get_location_distribution(db, cluster_id, skill_id, location_id, availability_status)

@router.get("/experience", response_model=list[ExperienceDistribution])
def get_experience(
    cluster_id: Optional[int] = None,
    skill_id: Optional[int] = None,
    location_id: Optional[int] = None,
    availability_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "senior_associate"])),
):
    return dashboard_service.get_experience_distribution(db, cluster_id, skill_id, location_id, availability_status)

@router.get("/training", response_model=list[TrainingMetrics])
def get_training(
    cluster_id: Optional[int] = None,
    skill_id: Optional[int] = None,
    location_id: Optional[int] = None,
    availability_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "senior_associate"])),
):
    return dashboard_service.get_training_metrics(db, cluster_id, skill_id, location_id, availability_status)

@router.get("/availability", response_model=list[AvailabilityMetrics])
def get_availability(
    cluster_id: Optional[int] = None,
    skill_id: Optional[int] = None,
    location_id: Optional[int] = None,
    availability_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "senior_associate"])),
):
    return dashboard_service.get_availability_metrics(db, cluster_id, skill_id, location_id, availability_status)

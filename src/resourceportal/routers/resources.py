from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from resourceportal.database.database import get_db
from resourceportal.schemas.resource import ResourceOut, ResourceCreate, ResourceUpdate, ResourceListResponse, SkillBrief
from resourceportal.services import resource_service
from resourceportal.utils.dependencies import get_current_user, require_role
from resourceportal.models.user import User
from resourceportal.utils.exceptions import NotFoundException

router = APIRouter(prefix="/api/v1/resources", tags=["resources"])

def _resource_to_out(r) -> dict:
    """Convert a resource model to ResourceOut-compatible dict with nested skills."""
    skills = []
    if hasattr(r, '_secondary_skills') and r._secondary_skills:
        skills = [SkillBrief.model_validate(s) for s in r._secondary_skills]
    elif hasattr(r, 'skills') and r.skills:
        skills = [SkillBrief.model_validate(rs.skill) for rs in r.skills if rs.skill]
    return ResourceOut.model_validate(r, from_attributes=True).model_copy(update={"skills": skills})

@router.get("", response_model=ResourceListResponse)
def get_resources(
    skip: int = 0,
    limit: int = 20,
    cluster_id: Optional[int] = None,
    skill_id: Optional[int] = None,
    availability_status: Optional[str] = None,
    location_id: Optional[int] = None,
    min_experience: Optional[float] = None,
    max_experience: Optional[float] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "senior_associate"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    result = resource_service.get_resources(
        db, skip=skip, limit=limit,
        cluster_id=cluster_id, skill_id=skill_id,
        availability_status=availability_status,
        location_id=location_id,
        min_experience=min_experience,
        max_experience=max_experience,
        search=search,
    )

    items_out = [_resource_to_out(r) for r in result["items"]]
    return ResourceListResponse(items=items_out, total=result["total"], skip=skip, limit=limit)

@router.get("/{employee_id}", response_model=ResourceOut)
def get_resource(employee_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_resource = resource_service.get_resource(db, employee_id)
    if not db_resource:
        raise NotFoundException()
    return _resource_to_out(db_resource)

@router.post("", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
def create_resource(
    resource: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "senior_associate"])),
):
    r = resource_service.create_resource(db, resource)
    return _resource_to_out(r)

@router.put("/{employee_id}", response_model=ResourceOut)
def update_resource(
    employee_id: str,
    resource: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_resource = resource_service.get_resource(db, employee_id)
    if not db_resource:
        raise NotFoundException()

    if current_user.role == "user" and db_resource.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to edit other resources")

    r = resource_service.update_resource(db, employee_id, resource)
    return _resource_to_out(r)

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    resource_service.delete_resource(db, employee_id)

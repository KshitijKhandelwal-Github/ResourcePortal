from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from resourceportal.models import Resource, ResourceSkill, Skill, User
from resourceportal.schemas.resource import ResourceCreate, ResourceUpdate
from resourceportal.utils.exceptions import NotFoundException
import logging

logger = logging.getLogger(__name__)

def _base_query(db: Session):
    return db.query(Resource).options(
        joinedload(Resource.cluster),
        joinedload(Resource.skills).joinedload(ResourceSkill.skill),
        joinedload(Resource.current_location),
        joinedload(Resource.preferred_location),
    )

def get_resources(db: Session, skip: int = 0, limit: int = 20, **filters):
    query = db.query(Resource).options(
        joinedload(Resource.cluster),
        joinedload(Resource.skills).joinedload(ResourceSkill.skill),
        joinedload(Resource.current_location),
        joinedload(Resource.preferred_location),
    )

    if filters.get("cluster_id"):
        query = query.filter(Resource.cluster_id == filters["cluster_id"])
    if filters.get("skill_id") or filters.get("primary_skill_id"):
        sid = filters.get("skill_id") or filters.get("primary_skill_id")
        # Match primary skill or secondary skills
        query = query.filter(
            or_(
                Resource.id.in_(
                    db.query(ResourceSkill.resource_id).filter(
                        ResourceSkill.skill_id == sid
                    )
                )
            )
        )
    if filters.get("availability_status"):
        query = query.filter(Resource.availability_status == filters["availability_status"])
    if filters.get("location_id"):
        query = query.filter(
            or_(
                Resource.current_location_id == filters["location_id"],
                Resource.preferred_location_id == filters["location_id"],
            )
        )
    if filters.get("min_experience"):
        query = query.filter(Resource.years_experience >= float(filters["min_experience"]))
    if filters.get("max_experience"):
        query = query.filter(Resource.years_experience <= float(filters["max_experience"]))
    if filters.get("search"):
        search = f"%{filters['search']}%"
        query = query.filter(or_(Resource.name.ilike(search), Resource.employee_id.ilike(search)))

    total = query.count()
    items = query.order_by(Resource.name).offset(skip).limit(limit).all()

    # Convert ResourceSkill relationships to skill briefs
    for item in items:
        item._secondary_skills = [rs.skill for rs in (item.skills or []) if rs.skill]

    return {"items": items, "total": total, "skip": skip, "limit": limit}

def get_resource(db: Session, employee_id: str):
    resource = _base_query(db).filter(Resource.employee_id == employee_id).first()
    if resource:
        # Attach secondary skills as a list of Skill objects
        resource._secondary_skills = [rs.skill for rs in (resource.skills or []) if rs.skill]
    return resource

def create_resource(db: Session, resource: ResourceCreate):
    user = db.query(User).filter(User.id == resource.user_id).first()
    # if not user:
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail="Registered user not found",
    #     )
    # if user.resource_id is not None:
    #     raise HTTPException(
    #         status_code=status.HTTP_409_CONFLICT,
    #         detail="This user is already linked to a resource",
    #     )
    existing_resource = db.query(Resource).filter(
        or_(
            Resource.employee_id == resource.employee_id,
            Resource.email == resource.email,
        )
    ).first()
    if existing_resource:
        duplicate_field = (
            "employee_id"
            if db.query(Resource).filter(
                Resource.employee_id == resource.employee_id
            ).first()
            else "email"
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A resource with this {duplicate_field} already exists",
        )

    data = resource.model_dump(
        exclude={"secondary_skill_ids", "primary_skill_id", "user_id"}
    )
    if "years_of_experience" in data:
        data["years_experience"] = data.pop("years_of_experience")
    secondary_skill_ids = resource.secondary_skill_ids or []

    db_resource = Resource(**data)
    db.add(db_resource)
    db.flush()  # Get the ID

    # Add secondary skills
    for skill_id in secondary_skill_ids:
        rs = ResourceSkill(
            resource_id=db_resource.id,
            skill_id=skill_id,
            skill_type="SECONDARY",
        )
        db.add(rs)

    # Add primary skill as ResourceSkill too if set
    if resource.primary_skill_id:
        rs = ResourceSkill(
            resource_id=db_resource.id,
            skill_id=resource.primary_skill_id,
            skill_type="PRIMARY",
        )
        db.add(rs)

    user.resource_id = db_resource.id # type: ignore

    db.commit()
    db.refresh(db_resource)
    logger.info(f"Created resource {db_resource.employee_id}")

    return get_resource(db, str(db_resource.employee_id))

def update_resource(db: Session, employee_id: str, resource: ResourceUpdate):
    db_resource = db.query(Resource).filter(Resource.employee_id == employee_id).first()
    if not db_resource:
        raise NotFoundException(detail="Resource not found")

    update_data = resource.model_dump(
        exclude_unset=True,
        exclude={"secondary_skill_ids", "primary_skill_id", "user_id"},
    )
    if "years_of_experience" in update_data:
        update_data["years_experience"] = update_data.pop("years_of_experience")
    for key, value in update_data.items():
        setattr(db_resource, key, value)

    # Update secondary skills if provided
    if resource.secondary_skill_ids is not None:
        # Remove existing
        db.query(ResourceSkill).filter(ResourceSkill.resource_id == db_resource.id).delete(synchronize_session=False)
        # Re-add primary
        primary_sid = resource.primary_skill_id
        if primary_sid:
            db.add(
                ResourceSkill(
                    resource_id=db_resource.id,
                    skill_id=primary_sid,
                    skill_type="PRIMARY",
                )
            )
        # Add secondary
        for skill_id in set(resource.secondary_skill_ids):
            if skill_id != resource.primary_skill_id:
                db.add(
                    ResourceSkill(
                        resource_id=db_resource.id,
                        skill_id=skill_id,
                        skill_type="SECONDARY",
                    )
                )

    elif resource.primary_skill_id is not None:
        db.query(ResourceSkill).filter(
            ResourceSkill.resource_id == db_resource.id,
            ResourceSkill.skill_type == "PRIMARY",
        ).delete(synchronize_session=False)

        db.add(
            ResourceSkill(
                resource_id=db_resource.id,
                skill_id=resource.primary_skill_id,
                skill_type="PRIMARY",
            )
        )

    db.commit()
    logger.info(f"Updated resource {employee_id}")
    return get_resource(db, employee_id)

def delete_resource(db: Session, employee_id: str):
    db_resource = db.query(Resource).filter(Resource.employee_id == employee_id).first()
    if not db_resource:
        raise NotFoundException(detail="Resource not found")

    # Delete associated resource_skills
    db.query(ResourceSkill).filter(ResourceSkill.resource_id == db_resource.id).delete()
    db.delete(db_resource)
    db.commit()
    logger.info(f"Deleted resource {employee_id}")

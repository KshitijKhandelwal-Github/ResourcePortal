from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from resourceportal.models import Resource, ResourceSkill, Skill
from resourceportal.schemas.resource import ResourceCreate, ResourceUpdate
from resourceportal.utils.exceptions import NotFoundException
import logging

logger = logging.getLogger(__name__)

def _base_query(db: Session):
    return db.query(Resource).options(
        joinedload(Resource.cluster),
        joinedload(Resource.primary_skill),
        joinedload(Resource.current_location),
        joinedload(Resource.preferred_location),
        joinedload(Resource.skills).joinedload(ResourceSkill.skill),
    )

def get_resources(db: Session, skip: int = 0, limit: int = 20, **filters):
    query = db.query(Resource).options(
        joinedload(Resource.cluster),
        joinedload(Resource.primary_skill),
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
                Resource.primary_skill_id == sid,
                Resource.id.in_(
                    db.query(ResourceSkill.resource_id).filter(ResourceSkill.skill_id == sid)
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
        query = query.filter(Resource.years_of_experience >= float(filters["min_experience"]))
    if filters.get("max_experience"):
        query = query.filter(Resource.years_of_experience <= float(filters["max_experience"]))
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
    data = resource.model_dump(exclude={"secondary_skill_ids"})
    secondary_skill_ids = resource.secondary_skill_ids or []

    db_resource = Resource(**data)
    db.add(db_resource)
    db.flush()  # Get the ID

    # Add secondary skills
    for skill_id in secondary_skill_ids:
        rs = ResourceSkill(resource_id=db_resource.id, skill_id=skill_id, is_primary=False)
        db.add(rs)

    # Add primary skill as ResourceSkill too if set
    if resource.primary_skill_id:
        rs = ResourceSkill(resource_id=db_resource.id, skill_id=resource.primary_skill_id, is_primary=True)
        db.add(rs)

    db.commit()
    db.refresh(db_resource)
    logger.info(f"Created resource {db_resource.employee_id}")

    return get_resource(db, db_resource.employee_id)

def update_resource(db: Session, employee_id: str, resource: ResourceUpdate):
    db_resource = db.query(Resource).filter(Resource.employee_id == employee_id).first()
    if not db_resource:
        raise NotFoundException(detail="Resource not found")

    update_data = resource.model_dump(exclude_unset=True, exclude={"secondary_skill_ids"})
    for key, value in update_data.items():
        setattr(db_resource, key, value)

    # Update secondary skills if provided
    if resource.secondary_skill_ids is not None:
        # Remove existing
        db.query(ResourceSkill).filter(ResourceSkill.resource_id == db_resource.id).delete()
        # Re-add primary
        primary_sid = resource.primary_skill_id or db_resource.primary_skill_id
        if primary_sid:
            db.add(ResourceSkill(resource_id=db_resource.id, skill_id=primary_sid, is_primary=True))
        # Add secondary
        for skill_id in resource.secondary_skill_ids:
            db.add(ResourceSkill(resource_id=db_resource.id, skill_id=skill_id, is_primary=False))

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

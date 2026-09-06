from sqlalchemy import func
from sqlalchemy.orm import Session

from resourceportal.models import (
    Location,
    Resource,
    ResourceSkill,
    Skill,
    Training,
)


def _apply_filters(
    query,
    db: Session,
    cluster_id=None,
    skill_id=None,
    location_id=None,
    availability_status=None,
):
    if cluster_id is not None:
        query = query.filter(Resource.cluster_id == cluster_id)

    if skill_id is not None:
        primary_resource_ids = db.query(ResourceSkill.resource_id).filter(
            ResourceSkill.skill_id == skill_id,
            ResourceSkill.skill_type == "PRIMARY",
        )
        query = query.filter(Resource.id.in_(primary_resource_ids))

    if location_id is not None:
        query = query.filter(Resource.current_location_id == location_id)

    if availability_status is not None:
        query = query.filter(
            Resource.availability_status == availability_status
        )

    return query


def get_summary_metrics(
    db: Session,
    cluster_id=None,
    skill_id=None,
    location_id=None,
    availability_status=None,
):
    query = _apply_filters(
        db.query(Resource),
        db,
        cluster_id,
        skill_id,
        location_id,
        availability_status,
    )

    return {
        "total": query.count(),
        "available": query.filter(
            Resource.availability_status == "Available"
        ).count(),
        "allocated": query.filter(
            Resource.availability_status == "Allocated"
        ).count(),
        "on_training": query.filter(
            Resource.availability_status == "On Training"
        ).count(),
        "on_leave": query.filter(
            Resource.availability_status == "On Leave"
        ).count(),
    }


def get_skill_distribution(
    db: Session,
    cluster_id=None,
    skill_id=None,
    location_id=None,
    availability_status=None,
):
    query = (
        db.query(Skill.name, func.count(Resource.id))
        .join(ResourceSkill, ResourceSkill.skill_id == Skill.id)
        .join(Resource, Resource.id == ResourceSkill.resource_id)
        .filter(ResourceSkill.skill_type == "PRIMARY")
    )

    if cluster_id is not None:
        query = query.filter(Resource.cluster_id == cluster_id)

    if skill_id is not None:
        query = query.filter(ResourceSkill.skill_id == skill_id)

    if location_id is not None:
        query = query.filter(Resource.current_location_id == location_id)

    if availability_status is not None:
        query = query.filter(
            Resource.availability_status == availability_status
        )

    results = query.group_by(Skill.name).all()

    return [
        {"skill_name": skill_name, "count": count}
        for skill_name, count in results
    ]


def get_location_distribution(
    db: Session,
    cluster_id=None,
    skill_id=None,
    location_id=None,
    availability_status=None,
):
    query = db.query(
        Location.name,
        func.count(Resource.id),
    ).join(
        Resource,
        Resource.current_location_id == Location.id,
    )

    if cluster_id is not None:
        query = query.filter(Resource.cluster_id == cluster_id)

    if skill_id is not None:
        primary_resource_ids = db.query(ResourceSkill.resource_id).filter(
            ResourceSkill.skill_id == skill_id,
            ResourceSkill.skill_type == "PRIMARY",
        )
        query = query.filter(Resource.id.in_(primary_resource_ids))

    if location_id is not None:
        query = query.filter(Resource.current_location_id == location_id)

    if availability_status is not None:
        query = query.filter(
            Resource.availability_status == availability_status
        )

    results = query.group_by(Location.name).all()

    return [
        {"location_name": location_name, "count": count}
        for location_name, count in results
    ]


def get_experience_distribution(
    db: Session,
    cluster_id=None,
    skill_id=None,
    location_id=None,
    availability_status=None,
):
    query = _apply_filters(
        db.query(Resource.years_experience),
        db,
        cluster_id,
        skill_id,
        location_id,
        availability_status,
    )

    resources = query.all()

    ranges = {
        "0-1 years": 0,
        "1-3 years": 0,
        "3-5 years": 0,
        "5-8 years": 0,
        "8-12 years": 0,
        "12+ years": 0,
    }

    for (experience,) in resources:
        if experience is None:
            continue

        if experience < 1:
            ranges["0-1 years"] += 1
        elif experience < 3:
            ranges["1-3 years"] += 1
        elif experience < 5:
            ranges["3-5 years"] += 1
        elif experience < 8:
            ranges["5-8 years"] += 1
        elif experience < 12:
            ranges["8-12 years"] += 1
        else:
            ranges["12+ years"] += 1

    return [
        {"range": range_name, "count": count}
        for range_name, count in ranges.items()
        if count > 0
    ]


def get_training_metrics(
    db: Session,
    cluster_id=None,
    skill_id=None,
    location_id=None,
    availability_status=None,
):
    query = db.query(
        Training.status,
        func.count(Training.id),
    ).join(
        Resource,
        Training.resource_id == Resource.id,
    )

    if cluster_id is not None:
        query = query.filter(Resource.cluster_id == cluster_id)

    if skill_id is not None:
        primary_resource_ids = db.query(ResourceSkill.resource_id).filter(
            ResourceSkill.skill_id == skill_id,
            ResourceSkill.skill_type == "PRIMARY",
        )
        query = query.filter(Resource.id.in_(primary_resource_ids))

    if location_id is not None:
        query = query.filter(Resource.current_location_id == location_id)

    if availability_status is not None:
        query = query.filter(
            Resource.availability_status == availability_status
        )

    results = query.group_by(Training.status).all()

    return [
        {"status": status, "count": count}
        for status, count in results
    ]


def get_availability_metrics(
    db: Session,
    cluster_id=None,
    skill_id=None,
    location_id=None,
    availability_status=None,
):
    query = db.query(
        Resource.availability_status,
        func.count(Resource.id),
    )

    if cluster_id is not None:
        query = query.filter(Resource.cluster_id == cluster_id)

    if skill_id is not None:
        primary_resource_ids = db.query(ResourceSkill.resource_id).filter(
            ResourceSkill.skill_id == skill_id,
            ResourceSkill.skill_type == "PRIMARY",
        )
        query = query.filter(Resource.id.in_(primary_resource_ids))

    if location_id is not None:
        query = query.filter(Resource.current_location_id == location_id)

    if availability_status is not None:
        query = query.filter(
            Resource.availability_status == availability_status
        )

    results = query.group_by(Resource.availability_status).all()

    return [
        {"status": status, "count": count}
        for status, count in results
    ]
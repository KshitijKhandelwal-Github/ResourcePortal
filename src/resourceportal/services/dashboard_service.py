from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_
from typing import Optional
from resourceportal.models.resource import Resource, ResourceSkill
from resourceportal.models.skill import Skill
from resourceportal.models.location import Location
from resourceportal.models.training import Training

def _apply_filters(query, cluster_id=None, skill_id=None, location_id=None, availability_status=None):
    if cluster_id:
        query = query.filter(Resource.cluster_id == cluster_id)
    if skill_id:
        query = query.filter(Resource.primary_skill_id == skill_id)
    if location_id:
        query = query.filter(Resource.current_location_id == location_id)
    if availability_status:
        query = query.filter(Resource.availability_status == availability_status)
    return query

def get_summary_metrics(db: Session, cluster_id=None, skill_id=None, location_id=None, availability_status=None):
    query = db.query(Resource)
    query = _apply_filters(query, cluster_id, skill_id, location_id, availability_status)

    total = query.count()
    available = query.filter(Resource.availability_status == "Available").count()
    allocated = query.filter(Resource.availability_status == "Allocated").count()
    on_training = query.filter(Resource.availability_status == "On Training").count()
    on_leave = query.filter(Resource.availability_status == "On Leave").count()

    return {
        "total": total,
        "available": available,
        "allocated": allocated,
        "on_training": on_training,
        "on_leave": on_leave,
    }

def get_skill_distribution(db: Session, cluster_id=None, skill_id=None, location_id=None, availability_status=None):
    query = db.query(Skill.name, func.count(Resource.id)).join(
        Resource, Resource.primary_skill_id == Skill.id
    )
    if cluster_id:
        query = query.filter(Resource.cluster_id == cluster_id)
    if location_id:
        query = query.filter(Resource.current_location_id == location_id)
    if availability_status:
        query = query.filter(Resource.availability_status == availability_status)
    results = query.group_by(Skill.name).all()
    return [{"skill_name": r[0], "count": r[1]} for r in results]

def get_location_distribution(db: Session, cluster_id=None, skill_id=None, location_id=None, availability_status=None):
    query = db.query(Location.city, func.count(Resource.id)).join(
        Resource, Resource.current_location_id == Location.id
    )
    if cluster_id:
        query = query.filter(Resource.cluster_id == cluster_id)
    if skill_id:
        query = query.filter(Resource.primary_skill_id == skill_id)
    if availability_status:
        query = query.filter(Resource.availability_status == availability_status)
    results = query.group_by(Location.city).all()
    return [{"location_name": r[0], "count": r[1]} for r in results]

def get_experience_distribution(db: Session, cluster_id=None, skill_id=None, location_id=None, availability_status=None):
    query = db.query(Resource.years_of_experience)
    query = _apply_filters(query, cluster_id, skill_id, location_id, availability_status)
    resources = query.all()

    ranges = {"0-1 years": 0, "1-3 years": 0, "3-5 years": 0, "5-8 years": 0, "8-12 years": 0, "12+ years": 0}
    for (exp,) in resources:
        if exp is None:
            continue
        if exp < 1:
            ranges["0-1 years"] += 1
        elif exp < 3:
            ranges["1-3 years"] += 1
        elif exp < 5:
            ranges["3-5 years"] += 1
        elif exp < 8:
            ranges["5-8 years"] += 1
        elif exp < 12:
            ranges["8-12 years"] += 1
        else:
            ranges["12+ years"] += 1

    return [{"range": k, "count": v} for k, v in ranges.items() if v > 0]

def get_training_metrics(db: Session, cluster_id=None, skill_id=None, location_id=None, availability_status=None):
    query = db.query(Training.status, func.count(Training.id))
    if cluster_id or skill_id or location_id or availability_status:
        query = query.join(Resource, Training.resource_id == Resource.id)
        if cluster_id:
            query = query.filter(Resource.cluster_id == cluster_id)
        if skill_id:
            query = query.filter(Resource.primary_skill_id == skill_id)
        if location_id:
            query = query.filter(Resource.current_location_id == location_id)
        if availability_status:
            query = query.filter(Resource.availability_status == availability_status)
    results = query.group_by(Training.status).all()
    return [{"status": r[0], "count": r[1]} for r in results]

def get_availability_metrics(db: Session, cluster_id=None, skill_id=None, location_id=None, availability_status=None):
    query = db.query(Resource.availability_status, func.count(Resource.id))
    if cluster_id:
        query = query.filter(Resource.cluster_id == cluster_id)
    if skill_id:
        query = query.filter(Resource.primary_skill_id == skill_id)
    if location_id:
        query = query.filter(Resource.current_location_id == location_id)
    results = query.group_by(Resource.availability_status).all()
    return [{"status": r[0], "count": r[1]} for r in results]

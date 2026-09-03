from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import (
    User,
    Resource,
    Cluster,
    Skill,
    ResourceSkill,
    Training,
    Certification,
    Location,
)
from .services.auth_service import get_password_hash


router = APIRouter(
    prefix="/data",
    tags=["Database Data"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def populate_database():
    db = SessionLocal()

    try:
        if db.query(Cluster).count() == 0:
            clusters = [
                Cluster(name="Oracle", description="Oracle technology cluster"),
                Cluster(name="AI/ML", description="Artificial Intelligence and Machine Learning"),
                Cluster(name="Cloud", description="Cloud technologies"),
                Cluster(name="Data", description="Data engineering and analytics"),
                Cluster(name="Java", description="Java development"),
                Cluster(name="Python", description="Python development"),
                Cluster(name="DevOps", description="DevOps and automation"),
                Cluster(name="Frontend", description="Frontend development"),
                Cluster(name="Backend", description="Backend development"),
                Cluster(name="Testing", description="Software testing")
            ]

            db.add_all(clusters)
            db.commit()

        if db.query(Location).count() == 0:
            locations = [
                Location(name="Chennai"),
                Location(name="Bangalore"),
                Location(name="Hyderabad"),
                Location(name="Pune"),
                Location(name="Mumbai"),
                Location(name="Delhi"),
                Location(name="Kolkata"),
                Location(name="Noida"),
                Location(name="Gurgaon"),
                Location(name="Coimbatore")
            ]

            db.add_all(locations)
            db.commit()

        if db.query(Skill).count() == 0:
            skills = [
                Skill(name="Python", category="Programming"),
                Skill(name="Java", category="Programming"),
                Skill(name="FastAPI", category="Backend"),
                Skill(name="React", category="Frontend"),
                Skill(name="Angular", category="Frontend"),
                Skill(name="AI/ML", category="Artificial Intelligence"),
                Skill(name="PyTorch", category="Artificial Intelligence"),
                Skill(name="SQL", category="Database"),
                Skill(name="AWS", category="Cloud"),
                Skill(name="Docker", category="DevOps")
            ]

            db.add_all(skills)
            db.commit()

        if db.query(Resource).count() == 0:
            resources = [
                Resource(
                    employee_id="EMP001",
                    name="Rahul Sharma",
                    email="rahul.sharma@company.com",
                    designation="Python Developer",
                    years_experience=4,
                    cluster_id=6,
                    current_location_id=1,
                    preferred_location_id=2,
                    availability_status="Available"
                ),
                Resource(
                    employee_id="EMP002",
                    name="Priya Kumar",
                    email="priya.kumar@company.com",
                    designation="Java Developer",
                    years_experience=6,
                    cluster_id=5,
                    current_location_id=2,
                    preferred_location_id=1,
                    availability_status="Allocated"
                ),
                Resource(
                    employee_id="EMP003",
                    name="Arun Raj",
                    email="arun.raj@company.com",
                    designation="AI Engineer",
                    years_experience=3,
                    cluster_id=2,
                    current_location_id=1,
                    preferred_location_id=3,
                    availability_status="Available"
                ),
                Resource(
                    employee_id="EMP004",
                    name="Sneha Patel",
                    email="sneha.patel@company.com",
                    designation="Frontend Developer",
                    years_experience=5,
                    cluster_id=8,
                    current_location_id=3,
                    preferred_location_id=2,
                    availability_status="Allocated"
                ),
                Resource(
                    employee_id="EMP005",
                    name="Vikram Singh",
                    email="vikram.singh@company.com",
                    designation="DevOps Engineer",
                    years_experience=7,
                    cluster_id=7,
                    current_location_id=4,
                    preferred_location_id=5,
                    availability_status="Available"
                ),
                Resource(
                    employee_id="EMP006",
                    name="Ananya Iyer",
                    email="ananya.iyer@company.com",
                    designation="Data Engineer",
                    years_experience=4,
                    cluster_id=4,
                    current_location_id=5,
                    preferred_location_id=1,
                    availability_status="On Training"
                ),
                Resource(
                    employee_id="EMP007",
                    name="Karthik Rao",
                    email="karthik.rao@company.com",
                    designation="Backend Developer",
                    years_experience=8,
                    cluster_id=9,
                    current_location_id=6,
                    preferred_location_id=2,
                    availability_status="Available"
                ),
                Resource(
                    employee_id="EMP008",
                    name="Divya Menon",
                    email="divya.menon@company.com",
                    designation="Cloud Engineer",
                    years_experience=5,
                    cluster_id=3,
                    current_location_id=7,
                    preferred_location_id=4,
                    availability_status="Allocated"
                ),
                Resource(
                    employee_id="EMP009",
                    name="Sanjay Verma",
                    email="sanjay.verma@company.com",
                    designation="QA Engineer",
                    years_experience=6,
                    cluster_id=10,
                    current_location_id=8,
                    preferred_location_id=9,
                    availability_status="On Leave"
                ),
                Resource(
                    employee_id="EMP010",
                    name="Meera Krishnan",
                    email="meera.krishnan@company.com",
                    designation="Python Developer",
                    years_experience=2,
                    cluster_id=6,
                    current_location_id=9,
                    preferred_location_id=1,
                    availability_status="Available"
                )
            ]

            db.add_all(resources)
            db.commit()

        if db.query(User).count() == 0:
            users = [
                User(
                    username="admin",
                    email="admin@company.com",
                    password_hash=get_password_hash("admin123"),
                    role="ADMIN",
                    resource_id=None,
                    is_active=1
                ),
                User(
                    username="rahul",
                    email="rahul.sharma@company.com",
                    password_hash=get_password_hash("rahul123"),
                    role="REGULAR_USER",
                    resource_id=1,
                    is_active=1
                ),
                User(
                    username="priya",
                    email="priya.kumar@company.com",
                    password_hash=get_password_hash("priya123"),
                    role="REGULAR_USER",
                    resource_id=2,
                    is_active=1
                ),
                User(
                    username="arun",
                    email="arun.raj@company.com",
                    password_hash=get_password_hash("arun123"),
                    role="REGULAR_USER",
                    resource_id=3,
                    is_active=1
                ),
                User(
                    username="sneha",
                    email="sneha.patel@company.com",
                    password_hash=get_password_hash("sneha123"),
                    role="REGULAR_USER",
                    resource_id=4,
                    is_active=1
                ),
                User(
                    username="vikram",
                    email="vikram.singh@company.com",
                    password_hash=get_password_hash("vikram123"),
                    role="SENIOR_ASSOCIATE",
                    resource_id=5,
                    is_active=1
                ),
                User(
                    username="ananya",
                    email="ananya.iyer@company.com",
                    password_hash=get_password_hash("ananya123"),
                    role="REGULAR_USER",
                    resource_id=6,
                    is_active=1
                ),
                User(
                    username="karthik",
                    email="karthik.rao@company.com",
                    password_hash=get_password_hash("karthik123"),
                    role="REGULAR_USER",
                    resource_id=7,
                    is_active=1
                ),
                User(
                    username="divya",
                    email="divya.menon@company.com",
                    password_hash=get_password_hash("divya123"),
                    role="REGULAR_USER",
                    resource_id=8,
                    is_active=1
                ),
                User(
                    username="sanjay",
                    email="sanjay.verma@company.com",
                    password_hash=get_password_hash("sanjay123"),
                    role="REGULAR_USER",
                    resource_id=9,
                    is_active=1
                )
            ]

            db.add_all(users)
            db.commit()

        if db.query(ResourceSkill).count() == 0:
            resource_skills = [
                ResourceSkill(
                    resource_id=1,
                    skill_id=1,
                    skill_type="PRIMARY",
                    proficiency_level="ADVANCED",
                    years_experience=4
                ),
                ResourceSkill(
                    resource_id=2,
                    skill_id=2,
                    skill_type="PRIMARY",
                    proficiency_level="EXPERT",
                    years_experience=6
                ),
                ResourceSkill(
                    resource_id=3,
                    skill_id=6,
                    skill_type="PRIMARY",
                    proficiency_level="ADVANCED",
                    years_experience=3
                ),
                ResourceSkill(
                    resource_id=4,
                    skill_id=4,
                    skill_type="PRIMARY",
                    proficiency_level="ADVANCED",
                    years_experience=5
                ),
                ResourceSkill(
                    resource_id=5,
                    skill_id=10,
                    skill_type="PRIMARY",
                    proficiency_level="EXPERT",
                    years_experience=7
                ),
                ResourceSkill(
                    resource_id=6,
                    skill_id=8,
                    skill_type="PRIMARY",
                    proficiency_level="ADVANCED",
                    years_experience=4
                ),
                ResourceSkill(
                    resource_id=7,
                    skill_id=3,
                    skill_type="PRIMARY",
                    proficiency_level="EXPERT",
                    years_experience=8
                ),
                ResourceSkill(
                    resource_id=8,
                    skill_id=9,
                    skill_type="PRIMARY",
                    proficiency_level="ADVANCED",
                    years_experience=5
                ),
                ResourceSkill(
                    resource_id=9,
                    skill_id=8,
                    skill_type="PRIMARY",
                    proficiency_level="ADVANCED",
                    years_experience=6
                ),
                ResourceSkill(
                    resource_id=10,
                    skill_id=1,
                    skill_type="PRIMARY",
                    proficiency_level="INTERMEDIATE",
                    years_experience=2
                )
            ]

            db.add_all(resource_skills)
            db.commit()

        if db.query(Training).count() == 0:
            training = [
                Training(
                    resource_id=1,
                    skill_id=3,
                    training_name="Advanced FastAPI",
                    status="COMPLETED",
                    start_date="2026-01-10",
                    completion_date="2026-02-10",
                    description="Advanced backend development using FastAPI"
                ),
                Training(
                    resource_id=2,
                    skill_id=2,
                    training_name="Advanced Java",
                    status="COMPLETED",
                    start_date="2025-10-01",
                    completion_date="2025-11-01",
                    description="Advanced Java development"
                ),
                Training(
                    resource_id=3,
                    skill_id=7,
                    training_name="PyTorch Deep Learning",
                    status="IN_PROGRESS",
                    start_date="2026-08-01",
                    completion_date=None,
                    description="Deep learning using PyTorch"
                ),
                Training(
                    resource_id=4,
                    skill_id=4,
                    training_name="Advanced React",
                    status="COMPLETED",
                    start_date="2026-02-01",
                    completion_date="2026-03-01",
                    description="Advanced React development"
                ),
                Training(
                    resource_id=5,
                    skill_id=10,
                    training_name="Docker and Kubernetes",
                    status="IN_PROGRESS",
                    start_date="2026-08-15",
                    completion_date=None,
                    description="Containerization and orchestration"
                ),
                Training(
                    resource_id=6,
                    skill_id=8,
                    training_name="Advanced SQL",
                    status="COMPLETED",
                    start_date="2025-09-01",
                    completion_date="2025-10-01",
                    description="Advanced SQL and database concepts"
                ),
                Training(
                    resource_id=7,
                    skill_id=3,
                    training_name="FastAPI Backend Development",
                    status="PLANNED",
                    start_date="2026-10-01",
                    completion_date=None,
                    description="Backend API development"
                ),
                Training(
                    resource_id=8,
                    skill_id=9,
                    training_name="AWS Cloud Practitioner",
                    status="COMPLETED",
                    start_date="2026-01-01",
                    completion_date="2026-02-01",
                    description="AWS cloud fundamentals"
                ),
                Training(
                    resource_id=9,
                    skill_id=8,
                    training_name="SQL Testing",
                    status="PLANNED",
                    start_date="2026-11-01",
                    completion_date=None,
                    description="Database testing"
                ),
                Training(
                    resource_id=10,
                    skill_id=1,
                    training_name="Advanced Python",
                    status="IN_PROGRESS",
                    start_date="2026-08-20",
                    completion_date=None,
                    description="Advanced Python programming"
                )
            ]

            db.add_all(training)
            db.commit()

        if db.query(Certification).count() == 0:
            certifications = [
                Certification(
                    resource_id=1,
                    certification_name="Python Professional Certification",
                    issuing_organization="Python Institute",
                    issue_date="2025-01-15",
                    expiry_date="2028-01-15",
                    credential_id="PY-001"
                ),
                Certification(
                    resource_id=2,
                    certification_name="Oracle Java Certification",
                    issuing_organization="Oracle",
                    issue_date="2024-05-10",
                    expiry_date="2027-05-10",
                    credential_id="JAVA-002"
                ),
                Certification(
                    resource_id=3,
                    certification_name="Machine Learning Specialist",
                    issuing_organization="AWS",
                    issue_date="2025-03-20",
                    expiry_date="2028-03-20",
                    credential_id="ML-003"
                ),
                Certification(
                    resource_id=4,
                    certification_name="React Developer Certification",
                    issuing_organization="Meta",
                    issue_date="2025-06-01",
                    expiry_date="2028-06-01",
                    credential_id="REACT-004"
                ),
                Certification(
                    resource_id=5,
                    certification_name="Docker Certified Associate",
                    issuing_organization="Docker",
                    issue_date="2024-08-15",
                    expiry_date="2027-08-15",
                    credential_id="DOCKER-005"
                ),
                Certification(
                    resource_id=6,
                    certification_name="Data Engineering Certification",
                    issuing_organization="Databricks",
                    issue_date="2025-02-10",
                    expiry_date="2028-02-10",
                    credential_id="DATA-006"
                ),
                Certification(
                    resource_id=7,
                    certification_name="Backend Development Certification",
                    issuing_organization="Microsoft",
                    issue_date="2024-11-01",
                    expiry_date="2027-11-01",
                    credential_id="BACKEND-007"
                ),
                Certification(
                    resource_id=8,
                    certification_name="AWS Solutions Architect",
                    issuing_organization="AWS",
                    issue_date="2025-04-15",
                    expiry_date="2028-04-15",
                    credential_id="AWS-008"
                ),
                Certification(
                    resource_id=9,
                    certification_name="ISTQB Foundation",
                    issuing_organization="ISTQB",
                    issue_date="2024-07-01",
                    expiry_date=None,
                    credential_id="ISTQB-009"
                ),
                Certification(
                    resource_id=10,
                    certification_name="Python Developer Certification",
                    issuing_organization="Python Institute",
                    issue_date="2026-01-10",
                    expiry_date="2029-01-10",
                    credential_id="PY-010"
                )
            ]

            db.add_all(certifications)
            db.commit()

        return {
            "message": "Database populated successfully"
        }

    finally:
        db.close()


# =========================================================
# GENERIC TABLE FETCH API
# =========================================================

TABLE_MODELS = {
    "users": User,
    "resources": Resource,
    "clusters": Cluster,
    "skills": Skill,
    "resource_skills": ResourceSkill,
    "training": Training,
    "certifications": Certification,
    "locations": Location
}


@router.get("/{table_name}")
def get_table_data(
    table_name: str,
    db: Session = Depends(get_db)
):
    model = TABLE_MODELS.get(table_name.lower())

    if model is None:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "Table not found",
                "available_tables": list(TABLE_MODELS.keys())
            }
        )

    records = db.query(model).all()

    return [
        {
            column.name: getattr(record, column.name)
            for column in model.__table__.columns
        }
        for record in records
    ]
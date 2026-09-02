from sqlalchemy.orm import Session
from resourceportal.models.user import User
from resourceportal.models.cluster import Cluster
from resourceportal.models.skill import Skill
from resourceportal.models.location import Location
from resourceportal.models.resource import Resource, ResourceSkill
from resourceportal.models.training import Training
from resourceportal.services.auth_service import get_password_hash
import logging

logger = logging.getLogger(__name__)

def seed_db(db: Session):
    # Check if already seeded
    if db.query(User).filter(User.username == "admin").first():
        logger.info("Database already seeded, skipping")
        return

    logger.info("Seeding database with initial data...")

    # Users
    admin = User(username="admin", email="admin@portal.com",
                 hashed_password=get_password_hash("admin123"), role="admin")
    manager = User(username="manager1", email="manager1@portal.com",
                   hashed_password=get_password_hash("manager123"), role="senior_associate")
    user1 = User(username="user1", email="user1@portal.com",
                 hashed_password=get_password_hash("user123"), role="user")
    db.add_all([admin, manager, user1])
    db.flush()

    # Clusters
    cluster_data = ["GOLF", "ECHO", "DELTA", "FOXTROT", "BRAVO"]
    clusters = {}
    for name in cluster_data:
        c = Cluster(name=name, description=f"{name} Cluster")
        db.add(c)
        db.flush()
        clusters[name] = c

    # Assign manager to GOLF cluster
    manager.cluster_id = clusters["GOLF"].id

    # Skills
    skill_data = [
        ("Python", "Backend"), ("Java", "Backend"), ("Angular", "Frontend"),
        ("React", "Frontend"), ("DevOps", "Infrastructure"), ("AI/ML", "Data Science"),
        ("Node.js", "Backend"), ("SQL", "Database"), ("Docker", "DevOps"),
        ("Kubernetes", "DevOps"),
    ]
    skills = {}
    for name, cat in skill_data:
        s = Skill(name=name, category=cat)
        db.add(s)
        db.flush()
        skills[name] = s

    # Locations
    loc_data = [
        ("Bangalore", "Karnataka", "India"),
        ("Chennai", "Tamil Nadu", "India"),
        ("Hyderabad", "Telangana", "India"),
        ("Pune", "Maharashtra", "India"),
        ("Mumbai", "Maharashtra", "India"),
    ]
    locations = {}
    for city, state, country in loc_data:
        l = Location(city=city, state=state, country=country)
        db.add(l)
        db.flush()
        locations[city] = l

    # Sample resources
    resources_data = [
        ("EMP001", "Rajesh Kumar", "rajesh@example.com", "GOLF", "Senior Developer", 5.5,
         "Bangalore", "Bangalore", "Available", "Python", ["Java", "SQL", "Docker"]),
        ("EMP002", "Priya Sharma", "priya@example.com", "GOLF", "Software Engineer", 3.0,
         "Chennai", "Bangalore", "Available", "React", ["Angular", "Node.js"]),
        ("EMP003", "Amit Patel", "amit@example.com", "ECHO", "DevOps Engineer", 7.0,
         "Hyderabad", "Hyderabad", "Allocated", "DevOps", ["Docker", "Kubernetes"]),
        ("EMP004", "Sneha Reddy", "sneha@example.com", "ECHO", "Data Scientist", 4.5,
         "Bangalore", "Pune", "On Training", "AI/ML", ["Python", "SQL"]),
        ("EMP005", "Vikram Singh", "vikram@example.com", "DELTA", "Full Stack Developer", 6.0,
         "Pune", "Mumbai", "Available", "Java", ["Angular", "SQL"]),
        ("EMP006", "Ananya Iyer", "ananya@example.com", "DELTA", "Frontend Developer", 2.0,
         "Chennai", "Chennai", "Available", "Angular", ["React"]),
        ("EMP007", "Karthik Nair", "karthik@example.com", "FOXTROT", "Backend Developer", 8.5,
         "Mumbai", "Mumbai", "Allocated", "Node.js", ["Python", "Docker"]),
        ("EMP008", "Divya Menon", "divya@example.com", "FOXTROT", "ML Engineer", 3.5,
         "Bangalore", "Bangalore", "Available", "AI/ML", ["Python"]),
        ("EMP009", "Rohit Gupta", "rohit@example.com", "BRAVO", "Cloud Engineer", 10.0,
         "Hyderabad", "Bangalore", "On Leave", "DevOps", ["Kubernetes", "Docker"]),
        ("EMP010", "Megha Joshi", "megha@example.com", "BRAVO", "Software Engineer", 1.5,
         "Pune", "Pune", "Available", "Python", ["SQL", "React"]),
        ("EMP011", "Suresh Babu", "suresh@example.com", "GOLF", "Senior Developer", 12.0,
         "Bangalore", "Bangalore", "Allocated", "Java", ["Python", "SQL", "Docker"]),
        ("EMP012", "Lakshmi Devi", "lakshmi@example.com", "ECHO", "QA Engineer", 4.0,
         "Chennai", "Hyderabad", "Available", "Python", ["SQL"]),
    ]

    for emp_id, name, email, cluster, desg, exp, curr_loc, pref_loc, status, primary, secondary in resources_data:
        r = Resource(
            employee_id=emp_id, name=name, email=email,
            cluster_id=clusters[cluster].id, designation=desg,
            years_of_experience=exp,
            current_location_id=locations[curr_loc].id,
            preferred_location_id=locations[pref_loc].id,
            availability_status=status,
            primary_skill_id=skills[primary].id,
        )
        db.add(r)
        db.flush()

        # Add primary as ResourceSkill
        db.add(ResourceSkill(resource_id=r.id, skill_id=skills[primary].id, is_primary=True))
        # Add secondary skills
        for sec in secondary:
            if sec in skills:
                db.add(ResourceSkill(resource_id=r.id, skill_id=skills[sec].id, is_primary=False))

    # Link user1 to EMP001
    emp1 = db.query(Resource).filter(Resource.employee_id == "EMP001").first()
    if emp1:
        emp1.user_id = user1.id

    # Sample training records
    emp1 = db.query(Resource).filter(Resource.employee_id == "EMP001").first()
    emp4 = db.query(Resource).filter(Resource.employee_id == "EMP004").first()
    if emp1:
        db.add(Training(resource_id=emp1.id, training_name="Advanced Python", skill_id=skills["Python"].id,
                        status="Completed", start_date="2025-01-15", completion_date="2025-03-15"))
        db.add(Training(resource_id=emp1.id, training_name="FastAPI Masterclass", skill_id=skills["Python"].id,
                        status="In Progress", start_date="2026-08-01"))
    if emp4:
        db.add(Training(resource_id=emp4.id, training_name="Deep Learning Fundamentals", skill_id=skills["AI/ML"].id,
                        status="In Progress", start_date="2026-07-01"))
        db.add(Training(resource_id=emp4.id, training_name="TensorFlow Certification Prep", skill_id=skills["AI/ML"].id,
                        status="Planned"))

    db.commit()
    logger.info("Database seeded successfully with %d resources", len(resources_data))

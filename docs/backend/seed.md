# Database Seeder (`seed.py`)

## Overview

The [`seed.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/seed.py) file is responsible for populating an empty database with realistic initial data when the application starts for the first time.

Think of [`seed.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/seed.py) like **staging a fully furnished show apartment**:
- If someone visits an empty apartment, it's hard to visualize where the furniture goes or test if the appliances work.
- When developers run the Resource Portal or run tests, they need ready-to-use user accounts with various permissions, sample organizational clusters, technical skills, office locations, employees (resources) with different skills and availability statuses, and training records.
- [`seed.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/seed.py) fills the empty database with this data automatically, while intelligently checking if data already exists so it never duplicates records.

---

## Imports and Dependencies

```python
from sqlalchemy.orm import Session
from resourceportal.models.user import User
from resourceportal.models.cluster import Cluster
from resourceportal.models.skill import Skill
from resourceportal.models.location import Location
from resourceportal.models.resource import Resource, ResourceSkill
from resourceportal.models.training import Training
from resourceportal.services.auth_service import get_password_hash
import logging
```

Here is why each import is needed:

- **[`Session`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/seed.py#L1)**: SQLAlchemy's session interface used to query existing records, stage insertions, and commit changes.
- **[`User`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/seed.py#L2)**: The model for user login accounts, credentials, and roles (`admin`, `senior_associate`, `user`).
- **[`Cluster`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/seed.py#L3)**: The model representing organizational team clusters (such as GOLF, ECHO, DELTA).
- **[`Skill`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/seed.py#L4)**: The model representing technical competencies (such as Python, React, DevOps).
- **[`Location`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/seed.py#L5)**: The model representing geographic office branches (Bangalore, Chennai, Hyderabad, Pune, Mumbai).
- **[`Resource`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/seed.py#L6)** & **[`ResourceSkill`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/seed.py#L6)**:
  - `Resource`: Model representing an employee's profile, availability status, experience, and cluster assignment.
  - `ResourceSkill`: Junction table model linking resources to their primary and secondary technical skills.
- **[`Training`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/seed.py#L7)**: Model representing skill development courses assigned to resources with status tracking (`Completed`, `In Progress`, `Planned`).
- **[`get_password_hash`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/services/auth_service.py#L12-L13)**: Cryptographic password hasher from `auth_service` that hashes initial passwords (`admin123`, `manager123`, `user123`) before saving.
- **`logging`**: Python standard library logger used to print status messages to the console during startup.

---

## The `seed_db` Function

```python
def seed_db(db: Session):
```

### What it does
The [`seed_db`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/seed.py#L13-L141) function checks whether the database has already been seeded, and if not, generates a comprehensive baseline dataset for the entire application.

### Why it's needed
When starting fresh in development or spinning up a test environment, manual data entry of dozens of linked database records would be time-consuming and error-prone. This function automates bootstrapping in a fraction of a second.

- **Parameters**: `db: Session` - An active SQLAlchemy database session.
- **Returns**: `None`.

---

## Detailed Step-by-Step Logic

### Step 1: Idempotency Check

```python
if db.query(User).filter(User.username == "admin").first():
    logger.info("Database already seeded, skipping")
    return
```
- **Why**: An operation is **idempotent** if running it multiple times yields the same result without unintended side effects.
- **How**: It queries the `User` table for the username `"admin"`. If found, it means the database was already seeded on a previous run; it logs an informational message and exits immediately, preventing duplicate key errors or duplicate data.

---

### Step 2: Seed Default User Accounts

```python
admin = User(username="admin", email="admin@portal.com",
             hashed_password=get_password_hash("admin123"), role="admin")
manager = User(username="manager1", email="manager1@portal.com",
               hashed_password=get_password_hash("manager123"), role="senior_associate")
user1 = User(username="user1", email="user1@portal.com",
             hashed_password=get_password_hash("user123"), role="user")
db.add_all([admin, manager, user1])
db.flush()
```
- Creates 3 users covering the main application roles:
  1. **Admin** (`admin` / `admin123`): Full system privileges across all clusters.
  2. **Manager / Senior Associate** (`manager1` / `manager123`): Department/cluster-level manager privileges.
  3. **Standard User** (`user1` / `user123`): General employee access.
- **`db.flush()`**: Flushes the pending records to the database transaction, assigning them database IDs without finalizing the transaction yet.

---

### Step 3: Seed Clusters

```python
cluster_data = ["GOLF", "ECHO", "DELTA", "FOXTROT", "BRAVO"]
clusters = {}
for name in cluster_data:
    c = Cluster(name=name, description=f"{name} Cluster")
    db.add(c)
    db.flush()
    clusters[name] = c

# Assign manager to GOLF cluster
manager.cluster_id = clusters["GOLF"].id
```
- Inserts 5 business clusters commonly used for grouping teams and projects.
- Saves the cluster objects in a dictionary `clusters` so their newly generated `.id` values can be referenced.
- Connects `manager1` specifically to the `"GOLF"` cluster.

---

### Step 4: Seed Technical Skills

```python
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
```
- Inserts 10 diverse technical skills across various categories (Backend, Frontend, Infrastructure, Data Science, Database, DevOps).
- Saves them into the `skills` dictionary for foreign key mapping in subsequent steps.

---

### Step 5: Seed Office Locations

```python
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
```
- Inserts 5 major office cities with their respective state and country.
- Stores location objects in `locations` keyed by city name.

---

### Step 6: Seed Resources & Skill Mappings

```python
resources_data = [
    ("EMP001", "Rajesh Kumar", "rajesh@example.com", "GOLF", "Senior Developer", 5.5,
     "Bangalore", "Bangalore", "Available", "Python", ["Java", "SQL", "Docker"]),
    ...
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

    # Add primary skill junction
    db.add(ResourceSkill(resource_id=r.id, skill_id=skills[primary].id, is_primary=True))
    # Add secondary skills junction
    for sec in secondary:
        if sec in skills:
            db.add(ResourceSkill(resource_id=r.id, skill_id=skills[sec].id, is_primary=False))
```
- Seeds 12 employees (`EMP001` through `EMP012`) with diverse roles, experience levels (ranging from 1.5 to 12 years), current/preferred locations, and statuses (`Available`, `Allocated`, `On Training`, `On Leave`).
- **Junction Mapping**: For every employee created, records are added to `ResourceSkill`:
  - Exactly one primary skill (`is_primary=True`).
  - Zero or more secondary skills (`is_primary=False`).

---

### Step 7: Link Resource to User Account

```python
emp1 = db.query(Resource).filter(Resource.employee_id == "EMP001").first()
if emp1:
    emp1.user_id = user1.id
```
- Connects the user account `user1` to employee record `EMP001` (`Rajesh Kumar`), allowing `user1` to view and update their own resource profile upon logging in.

---

### Step 8: Seed Training Records & Commit

```python
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
```
- Attaches past and active training courses for employees `EMP001` and `EMP004`.
- **`db.commit()`**: Commits the entire transaction to disk in one atomic save. If any step had thrown an unexpected error, none of the half-completed records would be saved.

---

## Key Concepts

- **Database Seeding**: The automated process of filling a database with initial, dummy, or default configuration data for development and testing.
- **Idempotency**: An operation that can be applied multiple times without changing the result beyond the initial application. `seed_db` checks for `"admin"` before doing anything, ensuring safety across multiple restarts.
- **`flush()` vs `commit()`**: 
  - `db.flush()` sends SQL changes to the database engine so auto-incremented primary keys (like `id`) are generated and available in Python, but it does not permanently finalize the transaction.
  - `db.commit()` permanently saves the entire transaction to disk.
- **Junction Table (Many-to-Many Relationship)**: A resource can have many skills, and a skill can belong to many resources. The `ResourceSkill` table acts as a bridge containing `resource_id`, `skill_id`, and metadata like `is_primary`.

# Resource Service (`resource_service.py`)

## Overview

The `resource_service.py` file is the business logic engine responsible for managing personnel data in the Resource Portal. It serves as the intermediary between the HTTP presentation layer (`routers/resources.py`) and the relational database (`models/resource.py`).

While routers handle HTTP requests, responses, and authorization checks, the service layer handles:
- Constructing optimized SQL queries with eager loading to prevent performance bottlenecks.
- Dynamically assembling complex search filters (multi-criteria queries across skills, locations, and experience).
- Managing transactional operations, such as synchronizing junction tables (`ResourceSkill`) when creating or updating employees.
- Ensuring referential integrity during resource deletion.

---

## Imports and Dependencies

```python
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from resourceportal.models.resource import Resource, ResourceSkill
from resourceportal.models.skill import Skill
from resourceportal.schemas.resource import ResourceCreate, ResourceUpdate
from resourceportal.utils.exceptions import NotFoundException
import logging
```

Here is why each import is needed:

- **`sqlalchemy.orm.Session`**: Represents the database transaction and query context.
- **`sqlalchemy.orm.joinedload`**: An eager loading strategy that tells SQLAlchemy to fetch related entities (like a resource's cluster, location, and skills) in a single SQL `JOIN` query rather than issuing individual queries for each relationship.
- **`sqlalchemy.or_`**: An expression construct that combines multiple boolean conditions with logical `OR` (e.g., matching either name or employee ID).
- **`Resource`, `ResourceSkill`**: SQLAlchemy models for the primary `resources` table and the many-to-many junction table `resource_skills`.
- **`Skill`**: SQLAlchemy model representing individual skills.
- **`ResourceCreate`, `ResourceUpdate`**: Pydantic input schemas containing incoming data.
- **`NotFoundException`**: Custom application exception raised when a queried record is missing.
- **`logging`**: Standard library logger used to record operational events (creation, update, deletion).

---

## Functions and Business Logic

### 1. `_base_query(db: Session)`

```python
def _base_query(db: Session):
    return db.query(Resource).options(
        joinedload(Resource.cluster),
        joinedload(Resource.primary_skill),
        joinedload(Resource.current_location),
        joinedload(Resource.preferred_location),
        joinedload(Resource.skills).joinedload(ResourceSkill.skill),
    )
```

- **What it does**: Constructs a pre-configured SQLAlchemy query that eagerly loads all related database models for a resource.
- **Why it's needed**: By default, SQLAlchemy uses *lazy loading*, meaning it only fetches related records (like the resource's office location or skills) when you access them in code. If you fetch 50 resources and inspect their skills, lazy loading executes 50+ additional SQL queries (the infamous "N+1 query problem"). `joinedload` instructs SQLAlchemy to perform SQL `LEFT OUTER JOIN` operations up front, fetching all associated records in a single round-trip.
- **Parameters**: `db` (`Session`): Active database session.
- **Returns**: A SQLAlchemy `Query` object configured with joined relationships.

---

### 2. `get_resources(db: Session, skip: int = 0, limit: int = 20, **filters)`

```python
def get_resources(db: Session, skip: int = 0, limit: int = 20, **filters):
```

- **What it does**: Searches, filters, counts, and paginates resources according to arbitrary filter criteria.
- **Parameters**:
  - `db` (`Session`): Database session.
  - `skip` (`int`): Pagination offset (default: 0).
  - `limit` (`int`): Page size limit (default: 20).
  - `**filters`: Arbitrary keyword arguments containing filter values.
- **Returns**: A dictionary containing:
  - `items`: List of matching `Resource` objects.
  - `total`: Total count of matching records.
  - `skip`: Applied offset.
  - `limit`: Applied limit.

#### Step-by-Step Logic:

1. **Initialize Base Query**:
   Creates an eager-loading query for `Resource` including `cluster`, `primary_skill`, `current_location`, and `preferred_location`.

2. **Apply Dynamic Filters**:
   - **Cluster Filter**: If `cluster_id` is supplied:
     ```python
     query = query.filter(Resource.cluster_id == filters["cluster_id"])
     ```
   - **Skill Filter**: Checks if the specified `skill_id` matches the employee's `primary_skill_id` OR is present in the `resource_skills` junction table:
     ```python
     query = query.filter(
         or_(
             Resource.primary_skill_id == sid,
             Resource.id.in_(
                 db.query(ResourceSkill.resource_id).filter(ResourceSkill.skill_id == sid)
             )
         )
     )
     ```
   - **Availability Status**: Matches the exact string (`Available`, `Allocated`, etc.).
   - **Location Filter**: Matches if either `current_location_id` OR `preferred_location_id` equals the requested `location_id`.
   - **Experience Range**: Applies `>= min_experience` and `<= max_experience` numeric bounds on `years_of_experience`.
   - **Free-Text Search**: Performs case-insensitive wildcard matching (`ILIKE %search%`) on either `name` or `employee_id`.

3. **Count and Paginate**:
   - Calculates the total count: `total = query.count()`.
   - Sorts results alphabetically by name: `query.order_by(Resource.name)`.
   - Applies pagination slices: `.offset(skip).limit(limit).all()`.

4. **Attach Secondary Skills**:
   Loops through the returned resources and extracts the secondary skill models from junction objects for convenient serialization.

---

### 3. `get_resource(db: Session, employee_id: str)`

```python
def get_resource(db: Session, employee_id: str):
    resource = _base_query(db).filter(Resource.employee_id == employee_id).first()
    if resource:
        resource._secondary_skills = [rs.skill for rs in (resource.skills or []) if rs.skill]
    return resource
```

- **What it does**: Retrieves a single resource by their employee identifier string (e.g., "EMP101") with all nested relationships fully populated.
- **Step-by-Step Logic**:
  1. Executes `_base_query(db)` filtered by `Resource.employee_id == employee_id`.
  2. If found, extracts related skills into `_secondary_skills`.
  3. Returns the `Resource` object, or `None` if not found.

---

### 4. `create_resource(db: Session, resource: ResourceCreate)`

```python
def create_resource(db: Session, resource: ResourceCreate):
```

- **What it does**: Handles the transactional creation of an employee profile and manages many-to-many associations in the `resource_skills` table.
- **Parameters**: `db` (`Session`), `resource` (`ResourceCreate`).
- **Returns**: Fully loaded `Resource` object with relationships.

#### Step-by-Step Logic:

1. **Extract Core Data**:
   Separates core resource profile fields from the secondary skills list:
   ```python
   data = resource.model_dump(exclude={"secondary_skill_ids"})
   secondary_skill_ids = resource.secondary_skill_ids or []
   ```
2. **Stage Resource Entity**:
   Instantiates `Resource(**data)`, adds it to the session, and calls `db.flush()`. 
   > **Note on `db.flush()`**: `flush()` communicates with the database to execute the `INSERT` SQL statement, which generates and assigns the primary key `db_resource.id` without committing the transaction yet.
3. **Populate Junction Table**:
   - For each skill ID in `secondary_skill_ids`, creates a `ResourceSkill` record with `is_primary=False`.
   - If `primary_skill_id` is set, also creates a `ResourceSkill` entry with `is_primary=True`.
4. **Commit & Reload**:
   Commits the transaction (`db.commit()`), writes an audit log message, and delegates to `get_resource` to return a fully populated model.

---

### 5. `update_resource(db: Session, employee_id: str, resource: ResourceUpdate)`

```python
def update_resource(db: Session, employee_id: str, resource: ResourceUpdate):
```

- **What it does**: Updates profile details and synchronizes skill associations.
- **Step-by-Step Logic**:
  1. Queries the resource by `employee_id`. Raises `NotFoundException` if missing.
  2. Applies scalar field updates via `.model_dump(exclude_unset=True)` and `setattr`.
  3. **Skill Synchronization**:
     If `secondary_skill_ids` was provided in the update payload:
     - Deletes all existing `ResourceSkill` junction rows for this resource (`db.query(ResourceSkill)...delete()`).
     - Re-creates the primary skill entry if assigned.
     - Inserts the new secondary skill junction entries.
  4. Commits the transaction and logs the update.

---

### 6. `delete_resource(db: Session, employee_id: str)`

```python
def delete_resource(db: Session, employee_id: str):
```

- **What it does**: Permanently removes a resource and cleans up junction table records.
- **Step-by-Step Logic**:
  1. Finds the resource record or raises `NotFoundException`.
  2. Explicitly deletes all related `ResourceSkill` rows referencing `resource.id` to maintain foreign key integrity.
  3. Deletes the `Resource` entity itself.
  4. Commits the transaction and logs the deletion.

---

## Key Concepts

- **Eager Loading vs. Lazy Loading**: Eager loading (`joinedload`) instructs the ORM to fetch related tables simultaneously using SQL `JOIN`s, avoiding the severe performance penalty of lazy-loading thousands of rows in tight loops.
- **`flush()` vs. `commit()`**: 
  - `flush()` pushes SQL changes to the database driver to obtain generated values (like auto-incrementing IDs) while keeping the transaction open.
  - `commit()` permanently commits the entire transaction to disk.
- **Junction Table Synchronization**: Many-to-many relationships (like Resources to Skills) are stored in an intermediate table (`resource_skills`). When updating a resource's skills, deleting old associations and inserting new ones is a reliable technique to keep the link table synchronized.
- **Dynamic Filtering**: Instead of hardcoding separate query functions for every possible combination of filters, the service inspects the incoming filter dictionary and stacks `.filter()` clauses dynamically.

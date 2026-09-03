# Skills Router (`skills.py`)

## Overview

The `skills.py` router manages the catalog of technical skills and competencies recognized within the Resource Portal (e.g., Python, React, AWS, Docker, Kubernetes). 

Skills are fundamental metadata across the entire portal:
- Resources tag skills they possess or designate one as their primary skill.
- Dashboard analytics group personnel by skill competencies.
- Search filters allow managers to locate resources with specific technical qualifications.

This router provides full CRUD endpoints for the skill directory. Reading skills is open to any user, while creating, updating, or deleting skills is restricted to administrators.

---

## Imports and Dependencies

```python
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from resourceportal.database.database import get_db
from resourceportal.schemas.skill import SkillOut, SkillCreate, SkillUpdate
from resourceportal.models.skill import Skill
from resourceportal.utils.dependencies import require_role
from resourceportal.utils.exceptions import NotFoundException
```

Here is why each import is needed:

- **`fastapi.APIRouter`, `Depends`, `status`**: Core FastAPI tools for defining API routes, injecting dependencies, and using HTTP status codes.
- **`sqlalchemy.orm.Session`**: Enables querying, inserting, and deleting records in the database.
- **`typing.List`**: Type annotation for returning a collection of skills.
- **`get_db`**: Injects an active database session for each incoming request.
- **`SkillOut`, `SkillCreate`, `SkillUpdate`**: Pydantic schemas validating skill inputs and structuring output data (e.g., `id`, `name`, `category`).
- **`Skill`**: The SQLAlchemy ORM model representing the `skills` table.
- **`require_role`**: Dependency ensuring that mutating actions are restricted to users with the `admin` role.
- **`NotFoundException`**: Custom exception returning HTTP 404 if a requested skill ID does not exist.

---

## Router Configuration

```python
router = APIRouter(prefix="/api/v1/skills", tags=["skills"])
```

- **`prefix="/api/v1/skills"`**: Every route is mounted under `/api/v1/skills`.
- **`tags=["skills"]`**: Groups these endpoints under "skills" in the OpenAPI/Swagger interactive documentation.

---

## Endpoints

### 1. List Skills (`GET /api/v1/skills`)

```python
@router.get("", response_model=List[SkillOut])
def get_skills(db: Session = Depends(get_db)):
    return db.query(Skill).all()
```

- **HTTP Method & Path**: `GET /api/v1/skills`
- **Authentication & Authorization**: Public / Unrestricted. Any caller (or authenticated frontend user) can query the skill list to populate dropdown menus and search bars.
- **What it does**: Queries and returns all skills registered in the database.
- **Parameters**: `db` (`Session`): Injected database session.
- **Returns**: `List[SkillOut]` containing each skill's `id`, `name`, and `category`.

---

### 2. Create Skill (`POST /api/v1/skills`)

```python
@router.post("", response_model=SkillOut, status_code=status.HTTP_201_CREATED)
def create_skill(skill: SkillCreate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_skill = Skill(**skill.model_dump())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill
```

- **HTTP Method & Path**: `POST /api/v1/skills`
- **Authentication & Authorization**: Requires `admin` role.
- **What it does**: Adds a new skill to the master dictionary.
- **Parameters**:
  - `skill` (`SkillCreate`): JSON payload with `name` (e.g., "FastAPI") and `category` (e.g., "Backend").
  - `db` (`Session`): Database session.
  - `current_user`: Verified admin user.
- **Returns**: Newly created `SkillOut` object with HTTP 201 Created status.

---

### 3. Update Skill (`PUT /api/v1/skills/{skill_id}`)

```python
@router.put("/{skill_id}", response_model=SkillOut)
def update_skill(skill_id: int, skill: SkillUpdate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise NotFoundException("Skill not found")
    update_data = skill.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_skill, k, v)
    db.commit()
    db.refresh(db_skill)
    return db_skill
```

- **HTTP Method & Path**: `PUT /api/v1/skills/{skill_id}`
- **Authentication & Authorization**: Requires `admin` role.
- **Path Parameters**: `skill_id` (int): ID of the skill to edit.
- **Body**: `SkillUpdate` containing optional updated `name` or `category`.
- **Returns**: The updated `SkillOut` record.
- **Error Handling**: Raises `NotFoundException` (404) if no skill exists with `skill_id`.

---

### 4. Delete Skill (`DELETE /api/v1/skills/{skill_id}`)

```python
@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(skill_id: int, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise NotFoundException("Skill not found")
    db.delete(db_skill)
    db.commit()
```

- **HTTP Method & Path**: `DELETE /api/v1/skills/{skill_id}`
- **Authentication & Authorization**: Requires `admin` role.
- **Path Parameters**: `skill_id` (int): ID of the skill to remove.
- **Returns**: Empty body with HTTP 204 No Content.
- **Logic**: Locates the skill record and deletes it from the database table.

---

## Key Concepts

- **Lookup / Reference Data Pattern**: Tables like `skills` represent reference data (dictionaries). They rarely change compared to transactional data, but are referenced throughout the system by foreign keys.
- **Read-Open, Write-Restricted**: Making the GET endpoint public allows frontend filters and forms to populate autocomplete boxes effortlessly, while write/edit/delete operations are strictly protected by role checks.
- **Dictionary Unpacking (`**skill.model_dump()`)**: Convenient Python idiom that converts a Pydantic schema into a dictionary and expands its key-value pairs into keyword arguments for the SQLAlchemy model constructor.

# Training Router (`training.py`)

## Overview

The `training.py` router manages employee upskilling and professional development programs within the Resource Portal. It tracks courses, certifications, workshops, or training modules assigned to or completed by personnel.

In modern engineering teams, tracking training progress is vital:
- Resources can log their professional development and mark modules in-progress or completed.
- Resource managers and leads can track capability development and plan project assignments.
- Executive dashboards compute training completion rates across clusters.

This router allows viewing training history, creating new training records for a resource, and updating progress statuses.

---

## Imports and Dependencies

```python
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from resourceportal.database.database import get_db
from resourceportal.schemas.training import TrainingOut, TrainingCreate, TrainingUpdate
from resourceportal.models.training import Training
from resourceportal.models.resource import Resource
from resourceportal.utils.dependencies import get_current_user
from resourceportal.models.user import User
from resourceportal.utils.exceptions import NotFoundException
```

Here is why each import is needed:

- **`fastapi.APIRouter`, `Depends`, `status`, `HTTPException`**: Routing, dependency injection, HTTP status constants, and HTTP error responses.
- **`sqlalchemy.orm.Session`**: Enables querying and persisting training records.
- **`typing.List`**: Type hint for endpoints returning lists.
- **`get_db`**: Generator dependency providing a database session.
- **`TrainingOut`, `TrainingCreate`, `TrainingUpdate`**: Pydantic schemas validating training inputs (training name, provider, status, start/completion dates) and formatting API output.
- **`Training`**: SQLAlchemy model representing the `trainings` table.
- **`Resource`**: SQLAlchemy model representing personnel records in the `resources` table.
- **`get_current_user`**: Authenticates the caller from their JWT token.
- **`User`**: SQLAlchemy model for user accounts.
- **`NotFoundException`**: Custom 404 exception raised when a resource or training record cannot be found.

---

## Router Configuration

```python
router = APIRouter(prefix="/api/v1", tags=["training"])
```

- **`prefix="/api/v1"`**: Notice that unlike some other routers, the prefix here is `/api/v1` because endpoints have differing paths: some are nested under resources (`/resources/{employee_id}/training`) while updates target individual training records (`/training/{training_id}`).
- **`tags=["training"]`**: Groups these endpoints under the "training" tag in Swagger/OpenAPI docs.

---

## Endpoints

### 1. Get Trainings for Resource (`GET /api/v1/resources/{employee_id}/training`)

```python
@router.get("/resources/{employee_id}/training", response_model=List[TrainingOut])
def get_training(employee_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(Resource).filter(Resource.employee_id == employee_id).first()
    if not resource:
        raise NotFoundException("Resource not found")
    return db.query(Training).filter(Training.resource_id == resource.id).all()
```

- **HTTP Method & Path**: `GET /api/v1/resources/{employee_id}/training`
- **Authentication & Authorization**: Any authenticated user (`current_user`).
- **Path Parameters**: `employee_id` (str): Employee identifier (e.g., "EMP001").
- **Returns**: `List[TrainingOut]` containing all training activities for the resource.
- **Step-by-Step Logic**:
  1. Look up the `Resource` matching `employee_id`.
  2. If no resource exists, raise `NotFoundException("Resource not found")`.
  3. Query and return all `Training` records linked to the resource's primary key (`resource_id == resource.id`).

---

### 2. Create Training Record (`POST /api/v1/resources/{employee_id}/training`)

```python
@router.post("/resources/{employee_id}/training", response_model=TrainingOut, status_code=status.HTTP_201_CREATED)
def create_training(employee_id: str, training: TrainingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(Resource).filter(Resource.employee_id == employee_id).first()
    if not resource:
        raise NotFoundException("Resource not found")
    
    if current_user.role == "user" and resource.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not permitted")
        
    db_training = Training(**training.model_dump(), resource_id=resource.id)
    db.add(db_training)
    db.commit()
    db.refresh(db_training)
    return db_training
```

- **HTTP Method & Path**: `POST /api/v1/resources/{employee_id}/training`
- **Authentication & Authorization**:
  - `admin` and `senior_associate` can add training records to any resource.
  - A regular `user` can only add training records to their own resource profile (`resource.user_id == current_user.id`). Violations return HTTP 403 Forbidden.
- **Path Parameters**: `employee_id` (str): Employee receiving the training record.
- **Body**: `TrainingCreate` containing training title, provider, status, start date, and target completion date.
- **Returns**: Newly created `TrainingOut` with HTTP 201 Created status.
- **Step-by-Step Logic**:
  1. Fetch the target resource by `employee_id`.
  2. Verify resource ownership if caller has the standard `user` role.
  3. Instantiate `Training` using the payload fields and associate it with `resource.id`.
  4. Save to the database and return the saved record.

---

### 3. Update Training Record (`PUT /api/v1/training/{training_id}`)

```python
@router.put("/training/{training_id}", response_model=TrainingOut)
def update_training(training_id: int, training: TrainingUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_training = db.query(Training).filter(Training.id == training_id).first()
    if not db_training:
        raise NotFoundException("Training not found")
        
    resource = db.query(Resource).filter(Resource.id == db_training.resource_id).first()
    if current_user.role == "user" and (not resource or resource.user_id != current_user.id):
         raise HTTPException(status_code=403, detail="Not permitted")
         
    update_data = training.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_training, k, v)
    db.commit()
    db.refresh(db_training)
    return db_training
```

- **HTTP Method & Path**: `PUT /api/v1/training/{training_id}`
- **Authentication & Authorization**:
  - `admin` and `senior_associate` can update any training entry.
  - A regular `user` can only update trainings associated with their own resource profile.
- **Path Parameters**: `training_id` (int): Database ID of the training record.
- **Body**: `TrainingUpdate` containing optional updates (such as changing status to "Completed" or updating completion dates).
- **Returns**: Updated `TrainingOut` record.
- **Step-by-Step Logic**:
  1. Retrieve the training record by `training_id`. If not found, raise 404.
  2. Retrieve the associated resource to verify ownership permissions.
  3. Apply partial updates using `model_dump(exclude_unset=True)` and `setattr`.
  4. Commit changes to the database and refresh.

---

## Key Concepts

- **Nested RESTful Resources**: Endpoints like `/resources/{employee_id}/training` represent child resources under a parent resource. This makes the URL self-descriptive about the relationship between personnel and trainings.
- **Resource Ownership Authorization**: Instead of a blanket role check, authorization checks whether the resource being modified belongs to the caller (`resource.user_id == current_user.id`). This pattern allows self-service workflows while safeguarding against unauthorized tampering.
- **Foreign Key Linkage**: The router links the training record to the internal primary key (`resource.id`) rather than the human-readable `employee_id`, ensuring database referential integrity.

# Resources Router (`resources.py`)

## Overview

The `resources.py` file is the central API router for managing company personnel (employees/contractors) referred to as **Resources**. It provides complete CRUD (Create, Read, Update, Delete) functionality, filtering capabilities (by cluster, skill, location, availability status, experience), and role-based permissions.

Think of it as the company's human resources catalog: managers can search for candidates with specific skills or availability, view employee profiles, onboard new personnel, update details, or remove departing resources.

---

## Imports and Dependencies

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from resourceportal.database.database import get_db
from resourceportal.schemas.resource import ResourceOut, ResourceCreate, ResourceUpdate, ResourceListResponse, SkillBrief, ClusterBrief, LocationBrief
from resourceportal.services import resource_service
from resourceportal.utils.dependencies import get_current_user, require_role
from resourceportal.models.user import User
from resourceportal.utils.exceptions import NotFoundException
```

Here is why each import is needed:

- **`fastapi.APIRouter`, `Depends`, `HTTPException`, `status`**: Core FastAPI tools to define endpoints, inject dependencies, raise HTTP errors, and reference standard HTTP status codes.
- **`sqlalchemy.orm.Session`**: Provides database session management.
- **`typing.Optional`**: Type hinting for query parameters that are not mandatory (can be `None`).
- **`get_db`**: Database session dependency generator.
- **`ResourceOut`, `ResourceCreate`, `ResourceUpdate`, `ResourceListResponse`, `SkillBrief`, `ClusterBrief`, `LocationBrief`**: Pydantic schemas that validate inputs and define the response structure for resources and nested relationships.
- **`resource_service`**: The business logic layer that handles querying, filtering, inserting, and deleting resource records in the database.
- **`get_current_user`**: Dependency that decodes the JWT bearer token to find and authenticate the requesting user.
- **`require_role`**: A higher-order dependency factory that enforces role-based access control (e.g., allowing only admins or senior associates).
- **`User`**: SQLAlchemy model representing the user performing the request.
- **`NotFoundException`**: Custom application exception that converts to an HTTP 404 Not Found response when a resource cannot be found.

---

## Router Configuration

```python
router = APIRouter(prefix="/api/v1/resources", tags=["resources"])
```

- **`prefix="/api/v1/resources"`**: Base path for all resource-related endpoints.
- **`tags=["resources"]`**: Groups resource endpoints together in Swagger/OpenAPI docs.

---

## Helper Functions

### `_resource_to_out(r) -> ResourceOut`

```python
def _resource_to_out(r) -> ResourceOut:
    """Convert a resource SQLAlchemy model to ResourceOut schema, resolving nested relationships."""
    # Build skills list from ResourceSkill association objects
    skill_briefs = []
    if hasattr(r, 'skills') and r.skills:
        for rs in r.skills:
            if rs.skill:
                skill_briefs.append(SkillBrief(id=rs.skill.id, name=rs.skill.name, category=rs.skill.category))

    # Build cluster, location, primary_skill briefs
    cluster = ClusterBrief(id=r.cluster.id, name=r.cluster.name) if r.cluster else None
    primary_skill = SkillBrief(id=r.primary_skill.id, name=r.primary_skill.name, category=r.primary_skill.category) if r.primary_skill else None
    current_location = LocationBrief(id=r.current_location.id, city=r.current_location.city) if r.current_location else None
    preferred_location = LocationBrief(id=r.preferred_location.id, city=r.preferred_location.city) if r.preferred_location else None

    return ResourceOut(...)
```

- **What it does**: Translates a database `Resource` model (and its relational links) into a clean, serializable `ResourceOut` Pydantic model.
- **Why it's needed**: A resource has relationships to clusters, locations, and multiple skills via a junction table (`ResourceSkill`). Database models contain circular links and complex ORM structures that cannot be sent directly as JSON. This helper flattens and formats these relationships into concise summary objects (`SkillBrief`, `ClusterBrief`, `LocationBrief`).
- **Parameters**: `r`: An SQLAlchemy `Resource` model object.
- **Returns**: A structured `ResourceOut` instance.

---

## Endpoints

### 1. List Resources (`GET /api/v1/resources`)

```python
@router.get("", response_model=ResourceListResponse)
def get_resources(
    skip: int = 0,
    limit: int = 20,
    cluster_id: Optional[int] = None,
    skill_id: Optional[int] = None,
    availability_status: Optional[str] = None,
    location_id: Optional[int] = None,
    min_experience: Optional[float] = None,
    max_experience: Optional[float] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
```

- **HTTP Method & Path**: `GET /api/v1/resources`
- **Authentication & Authorization**: Requires authenticated user with role `admin` or `senior_associate`. Regular `user` roles are rejected with HTTP 403 Forbidden.
- **Query Parameters**:
  - `skip` (int, default: 0): Offset for pagination.
  - `limit` (int, default: 20): Maximum number of records to return.
  - `cluster_id` (Optional[int]): Filter by assigned cluster ID.
  - `skill_id` (Optional[int]): Filter resources possessing this skill.
  - `availability_status` (Optional[str]): Filter by status (e.g., "available", "allocated", "shadow").
  - `location_id` (Optional[int]): Filter by current or preferred location ID.
  - `min_experience` / `max_experience` (Optional[float]): Filter by range of years of experience.
  - `search` (Optional[str]): Free-text search matching name, email, or employee ID.
- **Returns**: `ResourceListResponse` containing:
  - `items`: List of `ResourceOut` objects.
  - `total`: Total matching record count in the database.
  - `skip`, `limit`: Applied pagination bounds.

---

### 2. Get Resource by Employee ID (`GET /api/v1/resources/{employee_id}`)

```python
@router.get("/{employee_id}", response_model=ResourceOut)
def get_resource(employee_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
```

- **HTTP Method & Path**: `GET /api/v1/resources/{employee_id}`
- **Authentication & Authorization**: Any authenticated user (`admin`, `senior_associate`, or `user`).
- **Path Parameters**: `employee_id` (str): Unique employee code (e.g., "EMP1024").
- **Returns**: Detailed `ResourceOut` object.
- **Error Handling**: Raises `NotFoundException` (404) if no resource exists with the given `employee_id`.

---

### 3. Create Resource (`POST /api/v1/resources`)

```python
@router.post("", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
def create_resource(
    resource: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "senior_associate"])),
):
```

- **HTTP Method & Path**: `POST /api/v1/resources`
- **Authentication & Authorization**: Requires `admin` or `senior_associate` role (enforced via `require_role`).
- **Body**: `ResourceCreate` schema containing all employee profile fields (name, email, cluster_id, skills list, experience, etc.).
- **Returns**: `ResourceOut` with HTTP 201 Created status.
- **Step-by-Step Logic**:
  1. Delegates creation and association linking to `resource_service.create_resource`.
  2. Converts the saved SQLAlchemy model to `ResourceOut` using `_resource_to_out`.

---

### 4. Update Resource (`PUT /api/v1/resources/{employee_id}`)

```python
@router.put("/{employee_id}", response_model=ResourceOut)
def update_resource(
    employee_id: str,
    resource: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
```

- **HTTP Method & Path**: `PUT /api/v1/resources/{employee_id}`
- **Authentication & Authorization**:
  - `admin` and `senior_associate` can update any resource.
  - A regular `user` can only update their **own** resource profile (where `db_resource.user_id == current_user.id`). If they attempt to edit someone else's, raises HTTP 403 Forbidden.
- **Path Parameters**: `employee_id` (str).
- **Body**: `ResourceUpdate` containing the fields to update.
- **Returns**: Updated `ResourceOut` object.

---

### 5. Delete Resource (`DELETE /api/v1/resources/{employee_id}`)

```python
@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
```

- **HTTP Method & Path**: `DELETE /api/v1/resources/{employee_id}`
- **Authentication & Authorization**: Strictly `admin` only.
- **Path Parameters**: `employee_id` (str).
- **Returns**: Empty body with HTTP 204 No Content.
- **Logic**: Calls `resource_service.delete_resource`, removing the resource and related association records from the database.

---

## Key Concepts

- **Service Layer Pattern**: The router does not execute raw database queries directly. Instead, it delegates business operations to `resource_service`. This separates HTTP routing logic from database logic.
- **Role-Based Access Control (RBAC)**: Different endpoints enforce different privilege levels:
  - Deleting is admin-only.
  - Creating and global listing are admin or senior associate.
  - Self-updates allow standard users to maintain their own profiles.
- **Data Transfer Object (DTO) Transformation**: The `_resource_to_out` function transforms relational database graph structures into cleanly formatted JSON contracts.
- **Pagination**: The `skip` and `limit` parameters prevent returning thousands of records in a single response, preserving server memory and network bandwidth.

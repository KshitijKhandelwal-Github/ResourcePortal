# Locations Router (`locations.py`)

## Overview

The `locations.py` router manages geographical locations and office branches (e.g., New York, London, Bangalore, Tokyo) in the Resource Portal.

Locations are critical metadata for managing personnel:
- Each resource has a **current location** (where they presently reside/work) and an optional **preferred location** (where they wish to relocate or take project assignments).
- Dashboards utilize location entities to render geographical headcount heatmaps and distributions.
- Resource search filters allow managers to locate available talent in specific cities.

This router implements standard CRUD endpoints. Listing locations is publicly available, while create, update, and delete actions require administrative privileges.

---

## Imports and Dependencies

```python
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from resourceportal.database.database import get_db
from resourceportal.schemas.location import LocationOut, LocationCreate, LocationUpdate
from resourceportal.models.location import Location
from resourceportal.utils.dependencies import require_role
from resourceportal.utils.exceptions import NotFoundException
```

Here is why each import is needed:

- **`fastapi.APIRouter`, `Depends`, `status`**: Core FastAPI utilities for route declaration, dependency injection, and standard HTTP response status codes.
- **`sqlalchemy.orm.Session`**: Enables executing queries and transactions against the database.
- **`typing.List`**: Type annotation for endpoints returning lists of objects.
- **`get_db`**: Generator dependency that furnishes a fresh database connection per request and cleans it up after completion.
- **`LocationOut`, `LocationCreate`, `LocationUpdate`**: Pydantic schemas validating incoming location data (`city`, `country`) and shaping JSON responses.
- **`Location`**: SQLAlchemy model mapping to the `locations` database table.
- **`require_role`**: Dependency enforcing role-based security rules (specifically restricting access to administrators).
- **`NotFoundException`**: Custom exception triggering an HTTP 404 response when a referenced location is not found.

---

## Router Configuration

```python
router = APIRouter(prefix="/api/v1/locations", tags=["locations"])
```

- **`prefix="/api/v1/locations"`**: Prefixes all endpoints defined in this file.
- **`tags=["locations"]`**: Groups location endpoints under the "locations" tag in Swagger/OpenAPI docs.

---

## Endpoints

### 1. List Locations (`GET /api/v1/locations`)

```python
@router.get("", response_model=List[LocationOut])
def get_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()
```

- **HTTP Method & Path**: `GET /api/v1/locations`
- **Authentication & Authorization**: Public / Unrestricted.
- **What it does**: Fetches and returns all registered geographic locations.
- **Parameters**: `db` (`Session`): Database session injected by FastAPI.
- **Returns**: `List[LocationOut]` containing `id`, `city`, and `country` for each entry.

---

### 2. Create Location (`POST /api/v1/locations`)

```python
@router.post("", response_model=LocationOut, status_code=status.HTTP_201_CREATED)
def create_location(location: LocationCreate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_location = Location(**location.model_dump())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location
```

- **HTTP Method & Path**: `POST /api/v1/locations`
- **Authentication & Authorization**: Admin only (`require_role(["admin"])`).
- **What it does**: Adds a new office or city location to the system.
- **Parameters**:
  - `location` (`LocationCreate`): Input data containing `city` and `country`.
  - `db` (`Session`): Database session.
  - `current_user`: Authenticated admin user.
- **Returns**: Newly created `LocationOut` with HTTP 201 Created status.

---

### 3. Update Location (`PUT /api/v1/locations/{location_id}`)

```python
@router.put("/{location_id}", response_model=LocationOut)
def update_location(location_id: int, location: LocationUpdate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise NotFoundException("Location not found")
    update_data = location.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_location, k, v)
    db.commit()
    db.refresh(db_location)
    return db_location
```

- **HTTP Method & Path**: `PUT /api/v1/locations/{location_id}`
- **Authentication & Authorization**: Admin only.
- **Path Parameters**: `location_id` (int): Database ID of the target location.
- **Body**: `LocationUpdate` with optional updated fields (`city`, `country`).
- **Returns**: The updated `LocationOut` record.
- **Error Handling**: Raises `NotFoundException` (404) if no location matches `location_id`.

---

### 4. Delete Location (`DELETE /api/v1/locations/{location_id}`)

```python
@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(location_id: int, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise NotFoundException("Location not found")
    db.delete(db_location)
    db.commit()
```

- **HTTP Method & Path**: `DELETE /api/v1/locations/{location_id}`
- **Authentication & Authorization**: Admin only.
- **Path Parameters**: `location_id` (int): Database ID of the location to delete.
- **Returns**: Empty body with HTTP 204 No Content.
- **Logic**: Deletes the location record from the database.

---

## Key Concepts

- **Lookup Tables**: Locations serve as normalized reference data. Instead of typing "New York" as free text across thousands of resource records (which leads to typos like "new york" or "NYC"), resources reference a canonical `location_id`.
- **HTTP 204 No Content**: The standard HTTP status code for successful delete operations indicating the action succeeded and there is no entity body to return.
- **Partial Schema Updates**: Using `.model_dump(exclude_unset=True)` allows updating single fields (like changing just the city or country) without clobbering existing attributes.

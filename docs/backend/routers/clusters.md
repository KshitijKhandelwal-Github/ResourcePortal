# Clusters Router (`clusters.py`)

## Overview

The `clusters.py` router manages organizational business units known as **Clusters** (e.g., Cloud Engineering, Data & AI, Frontend Practice, Cybersecurity). 

Clusters serve as departmental groupings within the Resource Portal:
- Resources belong to a specific cluster.
- Users can be assigned to oversee or participate in a cluster.
- Executive dashboards aggregate headcount and availability metrics by cluster.

This file provides RESTful CRUD (Create, Read, Update, Delete) endpoints for managing clusters. Reading the list of clusters is open to all callers, whereas administrative privileges (`admin`) are required to create, update, or delete clusters.

---

## Imports and Dependencies

```python
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from resourceportal.database.database import get_db
from resourceportal.schemas.cluster import ClusterOut, ClusterCreate, ClusterUpdate
from resourceportal.models.cluster import Cluster
from resourceportal.utils.dependencies import require_role
from resourceportal.utils.exceptions import NotFoundException
```

Here is why each import is needed:

- **`fastapi.APIRouter`, `Depends`, `status`**: Core FastAPI mechanisms for routing, dependency injection, and HTTP status codes.
- **`sqlalchemy.orm.Session`**: Represents the active database session for querying and persisting cluster records.
- **`typing.List`**: Type annotation for endpoint responses that return a collection of clusters.
- **`get_db`**: Generator function that provides an isolated database session per request.
- **`ClusterOut`, `ClusterCreate`, `ClusterUpdate`**: Pydantic schemas:
  - `ClusterOut`: Serialization model returning cluster details (`id`, `name`, `description`).
  - `ClusterCreate`: Validation schema for creating a cluster (requires `name`, optional `description`).
  - `ClusterUpdate`: Validation schema for modifying cluster fields.
- **`Cluster`**: SQLAlchemy ORM model mapping to the `clusters` table.
- **`require_role`**: Security dependency that validates the caller possesses the `admin` role.
- **`NotFoundException`**: Custom exception that returns an HTTP 404 response when a cluster ID is missing.

---

## Router Configuration

```python
router = APIRouter(prefix="/api/v1/clusters", tags=["clusters"])
```

- **`prefix="/api/v1/clusters"`**: Prepends this URL segment to all routes in this module.
- **`tags=["clusters"]`**: Categorizes endpoints under the "clusters" section in interactive documentation (`/docs`).

---

## Endpoints

### 1. List All Clusters (`GET /api/v1/clusters`)

```python
@router.get("", response_model=List[ClusterOut])
def get_clusters(db: Session = Depends(get_db)):
    return db.query(Cluster).all()
```

- **HTTP Method & Path**: `GET /api/v1/clusters`
- **Authentication & Authorization**: Public / Unrestricted.
- **What it does**: Fetches and returns all business clusters configured in the database.
- **Parameters**: `db` (`Session`): Injected database session.
- **Returns**: `List[ClusterOut]` containing cluster IDs, names, and descriptions.

---

### 2. Create Cluster (`POST /api/v1/clusters`)

```python
@router.post("", response_model=ClusterOut, status_code=status.HTTP_201_CREATED)
def create_cluster(cluster: ClusterCreate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_cluster = Cluster(**cluster.model_dump())
    db.add(db_cluster)
    db.commit()
    db.refresh(db_cluster)
    return db_cluster
```

- **HTTP Method & Path**: `POST /api/v1/clusters`
- **Authentication & Authorization**: Admin only (`require_role(["admin"])`).
- **What it does**: Adds a new cluster to the organization.
- **Parameters**:
  - `cluster` (`ClusterCreate`): JSON body containing cluster `name` and optional `description`.
  - `db` (`Session`): Database session.
  - `current_user`: Verified admin user.
- **Returns**: Created `ClusterOut` record with HTTP 201 Created status.

---

### 3. Update Cluster (`PUT /api/v1/clusters/{cluster_id}`)

```python
@router.put("/{cluster_id}", response_model=ClusterOut)
def update_cluster(cluster_id: int, cluster: ClusterUpdate, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not db_cluster:
        raise NotFoundException("Cluster not found")
    update_data = cluster.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_cluster, k, v)
    db.commit()
    db.refresh(db_cluster)
    return db_cluster
```

- **HTTP Method & Path**: `PUT /api/v1/clusters/{cluster_id}`
- **Authentication & Authorization**: Admin only.
- **Path Parameters**: `cluster_id` (int): Database ID of the cluster.
- **Body**: `ClusterUpdate` containing updated cluster fields.
- **Returns**: Updated `ClusterOut` record.
- **Error Handling**: Raises `NotFoundException` (404) if no cluster with the given ID exists.

---

### 4. Delete Cluster (`DELETE /api/v1/clusters/{cluster_id}`)

```python
@router.delete("/{cluster_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cluster(cluster_id: int, db: Session = Depends(get_db), current_user = Depends(require_role(["admin"]))):
    db_cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not db_cluster:
        raise NotFoundException("Cluster not found")
    db.delete(db_cluster)
    db.commit()
```

- **HTTP Method & Path**: `DELETE /api/v1/clusters/{cluster_id}`
- **Authentication & Authorization**: Admin only.
- **Path Parameters**: `cluster_id` (int): Primary key of the cluster.
- **Returns**: Empty response with HTTP 204 No Content.
- **Logic**: Deletes the cluster record from the database.

---

## Key Concepts

- **Master / Lookup Data**: Clusters act as high-level organizational buckets. Changes to clusters cascade to how personnel and dashboard reports are categorized.
- **Separation of Read vs. Write Access**: Read access is kept open so that selection dropdowns throughout the portal (such as user registration or resource creation forms) can easily populate without requiring elevated permissions.
- **Idempotent Updates**: Using `model_dump(exclude_unset=True)` ensures only fields explicitly supplied in the request body are modified, leaving other fields untouched.

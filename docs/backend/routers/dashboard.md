# Dashboard Router (`dashboard.py`)

## Overview

The `dashboard.py` file exposes analytics and aggregation endpoints for the Resource Portal's executive dashboard. It provides high-level organizational insights, such as:
- Total resource counts, billability percentages, and availability breakdowns.
- Skill distribution across personnel.
- Geographic distribution by city/office location.
- Experience tiers (entry-level, mid-level, senior, lead).
- Training progress and completion rates.

Think of it as the analytics cockpit of an airline: instead of inspecting one passenger at a time, it delivers real-time aggregated metrics and chart-ready data for decision-makers.

---

## Imports and Dependencies

```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from resourceportal.database.database import get_db
from resourceportal.schemas.dashboard import (
    SummaryMetrics, SkillDistribution, LocationDistribution,
    ExperienceDistribution, TrainingMetrics, AvailabilityMetrics
)
from resourceportal.services import dashboard_service
from resourceportal.utils.dependencies import require_role
from resourceportal.models.user import User
```

Here is why each import is needed:

- **`fastapi.APIRouter`, `Depends`, `Query`**: Router building blocks and dependency handling in FastAPI.
- **`sqlalchemy.orm.Session`**: Provides an active database connection for executing SQL aggregations.
- **`typing.Optional`**: Permits dashboard filter parameters to be optional (`None` when omitted).
- **`get_db`**: Dependency provider for database sessions.
- **Dashboard Schemas**:
  - `SummaryMetrics`: High-level summary totals (e.g., total resources, available, allocated, billability %).
  - `SkillDistribution`: Count of resources associated with each skill.
  - `LocationDistribution`: Headcount per office or city.
  - `ExperienceDistribution`: Headcount bucketed by years of experience ranges.
  - `TrainingMetrics`: Completion and in-progress status counts for employee trainings.
  - `AvailabilityMetrics`: Counts per availability status (e.g., available, project, shadow).
- **`dashboard_service`**: The backend service performing aggregated database queries (e.g., `COUNT`, `GROUP BY`, mathematical percentages).
- **`require_role`**: Security dependency that limits access to privileged roles.
- **`User`**: SQLAlchemy model for the authenticated user.

---

## Router Configuration

```python
router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])
```

- **`prefix="/api/v1/dashboard"`**: All endpoints in this file are accessible under `/api/v1/dashboard`.
- **`tags=["dashboard"]`**: Groups all analytics endpoints under "dashboard" in OpenAPI/Swagger documentation.

---

## Shared Query Filter Parameters

Across all dashboard endpoints, four optional query parameters can be passed to slice and dice the data:

1. **`cluster_id`** (`Optional[int]`): Narrow analytics down to a specific cluster or business unit.
2. **`skill_id`** (`Optional[int]`): Focus metrics on employees with a specific skill.
3. **`location_id`** (`Optional[int]`): Filter metrics for a specific office location.
4. **`availability_status`** (`Optional[str]`): Filter by availability (e.g., "available", "allocated").

All endpoints also require:
- **`current_user: User = Depends(require_role(["admin", "senior_associate"]))`**: Only users with `admin` or `senior_associate` roles may access dashboard analytics. Standard users receive HTTP 403 Forbidden.

---

## Endpoints

### 1. Summary Metrics (`GET /api/v1/dashboard/summary`)

```python
@router.get("/summary", response_model=SummaryMetrics)
def get_summary(
    cluster_id: Optional[int] = None,
    skill_id: Optional[int] = None,
    location_id: Optional[int] = None,
    availability_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "senior_associate"])),
):
    return dashboard_service.get_summary_metrics(db, cluster_id, skill_id, location_id, availability_status)
```

- **HTTP Method & Path**: `GET /api/v1/dashboard/summary`
- **What it does**: Computes top-line KPI figures across the resource pool.
- **Returns**: `SummaryMetrics` containing:
  - `total_resources`: Total number of active employees.
  - `available_resources`: Count of unassigned resources ready for deployment.
  - `allocated_resources`: Count of resources currently deployed on projects.
  - `billability_rate`: Percentage of billable personnel (`(allocated / total) * 100`).
  - `in_training`: Resources currently undertaking training programs.

---

### 2. Skill Distribution (`GET /api/v1/dashboard/skills`)

```python
@router.get("/skills", response_model=list[SkillDistribution])
def get_skills(...):
    return dashboard_service.get_skill_distribution(db, cluster_id, skill_id, location_id, availability_status)
```

- **HTTP Method & Path**: `GET /api/v1/dashboard/skills`
- **What it does**: Aggregates employee counts grouped by technical skill name.
- **Returns**: A list of `SkillDistribution` objects (e.g., `[{"skill_name": "Python", "count": 42}, {"skill_name": "React", "count": 30}]`). Perfect for rendering bar charts.

---

### 3. Location Distribution (`GET /api/v1/dashboard/location`)

```python
@router.get("/location", response_model=list[LocationDistribution])
def get_locations(...):
    return dashboard_service.get_location_distribution(db, cluster_id, skill_id, location_id, availability_status)
```

- **HTTP Method & Path**: `GET /api/v1/dashboard/location`
- **What it does**: Groups headcount by office city or branch.
- **Returns**: A list of `LocationDistribution` objects (e.g., `[{"location": "New York", "count": 25}, {"location": "London", "count": 18}]`). Used for geo-distribution charts.

---

### 4. Experience Distribution (`GET /api/v1/dashboard/experience`)

```python
@router.get("/experience", response_model=list[ExperienceDistribution])
def get_experience(...):
    return dashboard_service.get_experience_distribution(db, cluster_id, skill_id, location_id, availability_status)
```

- **HTTP Method & Path**: `GET /api/v1/dashboard/experience`
- **What it does**: Categorizes resources into experience brackets (e.g., 0–2 years, 3–5 years, 6–10 years, 10+ years).
- **Returns**: A list of `ExperienceDistribution` objects indicating headcount per seniority bracket.

---

### 5. Training Metrics (`GET /api/v1/dashboard/training`)

```python
@router.get("/training", response_model=list[TrainingMetrics])
def get_training(...):
    return dashboard_service.get_training_metrics(db, cluster_id, skill_id, location_id, availability_status)
```

- **HTTP Method & Path**: `GET /api/v1/dashboard/training`
- **What it does**: Computes completion, in-progress, and failed statistics for ongoing training modules.
- **Returns**: A list of `TrainingMetrics` objects summarizing training engagement.

---

### 6. Availability Metrics (`GET /api/v1/dashboard/availability`)

```python
@router.get("/availability", response_model=list[AvailabilityMetrics])
def get_availability(...):
    return dashboard_service.get_availability_metrics(db, cluster_id, skill_id, location_id, availability_status)
```

- **HTTP Method & Path**: `GET /api/v1/dashboard/availability`
- **What it does**: Provides counts grouped by status (e.g., "Available", "Allocated", "Shadow", "On Leave").
- **Returns**: A list of `AvailabilityMetrics` objects, useful for donut and pie charts.

---

## Key Concepts

- **Data Aggregation**: Rather than returning thousands of raw resource rows to the frontend for calculation, the backend performs SQL `GROUP BY` and `COUNT` queries directly on the database engine. This is significantly faster and consumes less network bandwidth.
- **Dynamic Multi-Dimensional Filtering**: By passing identical filter parameters (`cluster_id`, `skill_id`, `location_id`, `availability_status`) across all charts, the UI can provide interactive dashboard filters where selecting a cluster immediately updates all charts synchronously.
- **Role Guarding**: Analytics often reveal confidential business capacity and billing data; restricting access to `admin` and `senior_associate` ensures privacy compliance.

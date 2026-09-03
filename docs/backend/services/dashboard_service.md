# Dashboard Service (`dashboard_service.py`)

## Overview

The `dashboard_service.py` file is the data aggregation engine powering the analytics and executive reporting dashboards of the Resource Portal. 

Instead of dealing with individual records, this service computes statistical summaries, grouping operations, and distributions across the organization's workforce. It executes optimized SQL aggregation queries (`COUNT`, `GROUP BY`, conditional joins) and shapes the results into chart-ready data formats for the frontend dashboard.

---

## Imports and Dependencies

```python
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_
from typing import Optional
from resourceportal.models.resource import Resource, ResourceSkill
from resourceportal.models.skill import Skill
from resourceportal.models.location import Location
from resourceportal.models.training import Training
```

Here is why each import is needed:

- **`sqlalchemy.orm.Session`**: Provides the database session for executing SQL queries.
- **`sqlalchemy.func`**: SQL function builder (used here to invoke SQL `COUNT`).
- **`sqlalchemy.case`, `and_`**: SQL expression constructs for conditional statements and logical conjunctions.
- **`typing.Optional`**: Type hinting for optional parameters.
- **`Resource`, `ResourceSkill`**: Models representing personnel and skill associations.
- **`Skill`**: Model representing technical skills.
- **`Location`**: Model representing office locations and cities.
- **`Training`**: Model representing employee training and upskilling programs.

---

## Functions and Business Logic

### 1. `_apply_filters(query, cluster_id=None, skill_id=None, location_id=None, availability_status=None)`

```python
def _apply_filters(query, cluster_id=None, skill_id=None, location_id=None, availability_status=None):
    if cluster_id:
        query = query.filter(Resource.cluster_id == cluster_id)
    if skill_id:
        query = query.filter(Resource.primary_skill_id == skill_id)
    if location_id:
        query = query.filter(Resource.current_location_id == location_id)
    if availability_status:
        query = query.filter(Resource.availability_status == availability_status)
    return query
```

- **What it does**: A reusable helper function that appends SQL `WHERE` clauses to an existing SQLAlchemy `Resource` query based on filter parameters.
- **Why it's needed**: Keeps code DRY (Don't Repeat Yourself). Instead of repeating filter checks across all metrics functions, this helper standardizes filter application.
- **Parameters**: 
  - `query`: The initial SQLAlchemy query object.
  - Optional filters: `cluster_id`, `skill_id`, `location_id`, `availability_status`.
- **Returns**: The modified query with applied filters.

---

### 2. `get_summary_metrics(...)`

```python
def get_summary_metrics(db: Session, cluster_id=None, skill_id=None, location_id=None, availability_status=None):
    query = db.query(Resource)
    query = _apply_filters(query, cluster_id, skill_id, location_id, availability_status)

    total = query.count()
    available = query.filter(Resource.availability_status == "Available").count()
    allocated = query.filter(Resource.availability_status == "Allocated").count()
    on_training = query.filter(Resource.availability_status == "On Training").count()
    on_leave = query.filter(Resource.availability_status == "On Leave").count()

    return {
        "total": total,
        "available": available,
        "allocated": allocated,
        "on_training": on_training,
        "on_leave": on_leave,
    }
```

- **What it does**: Computes headcount totals across each staffing status category.
- **Step-by-Step Logic**:
  1. Creates a base query on `Resource` and applies incoming filters.
  2. Executes `.count()` to determine `total` personnel matching the criteria.
  3. Reuses the filtered query to count specific statuses:
     - `"Available"`: Ready for deployment.
     - `"Allocated"`: Active on client or internal projects.
     - `"On Training"`: Upskilling.
     - `"On Leave"`: Vacation, sick leave, or sabbatical.
  4. Returns a dictionary matching `SummaryMetrics`.

---

### 3. `get_skill_distribution(...)`

```python
def get_skill_distribution(db: Session, cluster_id=None, skill_id=None, location_id=None, availability_status=None):
    query = db.query(Skill.name, func.count(Resource.id)).join(
        Resource, Resource.primary_skill_id == Skill.id
    )
    if cluster_id:
        query = query.filter(Resource.cluster_id == cluster_id)
    if location_id:
        query = query.filter(Resource.current_location_id == location_id)
    if availability_status:
        query = query.filter(Resource.availability_status == availability_status)
    results = query.group_by(Skill.name).all()
    return [{"skill_name": r[0], "count": r[1]} for r in results]
```

- **What it does**: Computes resource headcount grouped by primary skill.
- **Step-by-Step Logic**:
  1. Joins the `Skill` table to `Resource` where `Resource.primary_skill_id == Skill.id`.
  2. Applies any active filters (`cluster_id`, `location_id`, `availability_status`).
  3. Executes a SQL `GROUP BY Skill.name` with `func.count(Resource.id)`.
  4. Formats each row into a list of dictionaries: `[{"skill_name": "Python", "count": 25}, ...]`.

---

### 4. `get_location_distribution(...)`

```python
def get_location_distribution(db: Session, cluster_id=None, skill_id=None, location_id=None, availability_status=None):
    query = db.query(Location.city, func.count(Resource.id)).join(
        Resource, Resource.current_location_id == Location.id
    )
    if cluster_id:
        query = query.filter(Resource.cluster_id == cluster_id)
    if skill_id:
        query = query.filter(Resource.primary_skill_id == skill_id)
    if availability_status:
        query = query.filter(Resource.availability_status == availability_status)
    results = query.group_by(Location.city).all()
    return [{"location_name": r[0], "count": r[1]} for r in results]
```

- **What it does**: Computes headcount grouped by office city.
- **Step-by-Step Logic**:
  1. Joins the `Location` table to `Resource` on `Resource.current_location_id == Location.id`.
  2. Applies relevant dimensional filters.
  3. Groups by `Location.city` and counts resources.
  4. Returns `[{"location_name": r[0], "count": r[1]}]`.

---

### 5. `get_experience_distribution(...)`

```python
def get_experience_distribution(db: Session, cluster_id=None, skill_id=None, location_id=None, availability_status=None):
    query = db.query(Resource.years_of_experience)
    query = _apply_filters(query, cluster_id, skill_id, location_id, availability_status)
    resources = query.all()

    ranges = {"0-1 years": 0, "1-3 years": 0, "3-5 years": 0, "5-8 years": 0, "8-12 years": 0, "12+ years": 0}
    for (exp,) in resources:
        if exp is None:
            continue
        if exp < 1:
            ranges["0-1 years"] += 1
        elif exp < 3:
            ranges["1-3 years"] += 1
        elif exp < 5:
            ranges["3-5 years"] += 1
        elif exp < 8:
            ranges["5-8 years"] += 1
        elif exp < 12:
            ranges["8-12 years"] += 1
        else:
            ranges["12+ years"] += 1

    return [{"range": k, "count": v} for k, v in ranges.items() if v > 0]
```

- **What it does**: Buckets personnel into career seniority brackets (experience histogram).
- **Step-by-Step Logic**:
  1. Queries all `years_of_experience` values from the filtered `Resource` table.
  2. Initializes a dictionary with 6 predefined range buckets:
     - `0-1 years`, `1-3 years`, `3-5 years`, `5-8 years`, `8-12 years`, `12+ years`.
  3. Loops over each resource's experience value and increments the corresponding bucket.
  4. Filters out empty buckets (`v > 0`) to keep the chart clean, returning `[{"range": "3-5 years", "count": 14}, ...]`.

---

### 6. `get_training_metrics(...)`

```python
def get_training_metrics(db: Session, cluster_id=None, skill_id=None, location_id=None, availability_status=None):
    query = db.query(Training.status, func.count(Training.id))
    if cluster_id or skill_id or location_id or availability_status:
        query = query.join(Resource, Training.resource_id == Resource.id)
        if cluster_id:
            query = query.filter(Resource.cluster_id == cluster_id)
        if skill_id:
            query = query.filter(Resource.primary_skill_id == skill_id)
        if location_id:
            query = query.filter(Resource.current_location_id == location_id)
        if availability_status:
            query = query.filter(Resource.availability_status == availability_status)
    results = query.group_by(Training.status).all()
    return [{"status": r[0], "count": r[1]} for r in results]
```

- **What it does**: Aggregates counts of training enrollments by status (e.g., "Planned", "In Progress", "Completed").
- **Step-by-Step Logic**:
  1. Base query selects `Training.status` and counts `Training.id`.
  2. If any resource-level filters are active, conditionally performs a SQL `JOIN` to `Resource` on `Training.resource_id == Resource.id` to apply cluster, skill, location, or availability constraints.
  3. Executes `GROUP BY Training.status`.
  4. Returns `[{"status": r[0], "count": r[1]}]`.

---

### 7. `get_availability_metrics(...)`

```python
def get_availability_metrics(db: Session, cluster_id=None, skill_id=None, location_id=None):
    query = db.query(Resource.availability_status, func.count(Resource.id))
    if cluster_id:
        query = query.filter(Resource.cluster_id == cluster_id)
    if skill_id:
        query = query.filter(Resource.primary_skill_id == skill_id)
    if location_id:
        query = query.filter(Resource.current_location_id == location_id)
    results = query.group_by(Resource.availability_status).all()
    return [{"status": r[0], "count": r[1]} for r in results]
```

- **What it does**: Computes the distribution of workforce availability.
- **Step-by-Step Logic**:
  1. Queries `Resource.availability_status` and `func.count(Resource.id)`.
  2. Applies optional filters.
  3. Groups results by `Resource.availability_status`.
  4. Returns list of dictionaries for rendering donut charts.

---

## Key Concepts

- **SQL Aggregations (`func.count`, `group_by`)**: Database engines are heavily optimized for computing summaries. Grouping and counting inside SQL is orders of magnitude faster than downloading thousands of raw rows into Python memory and aggregating manually.
- **Conditional Joins**: In `get_training_metrics`, the join to `Resource` only occurs if resource-level filters (`cluster_id`, etc.) are specified. If no filters are provided, the query runs directly on `Training` without an unnecessary SQL join.
- **Data Binning / Bucketing**: The `get_experience_distribution` function takes continuous numerical data (years of experience as floating-point numbers) and groups them into discrete categorical bins for intuitive visualization.

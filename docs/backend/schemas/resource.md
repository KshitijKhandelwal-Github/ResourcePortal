# Resource Schemas (`resource.py`)

## Overview

The `resource.py` file contains the Pydantic schema models for representing company personnel ("Resources") in the Resource Portal. It defines:
- Brief representation schemas for associated models (skills, clusters, locations).
- Creation schemas for onboarding new employees (`ResourceCreate`).
- Update schemas for modifying employee data (`ResourceUpdate`).
- Detailed response models resolving nested relationships (`ResourceOut`).
- Paginated list responses (`ResourceListResponse`).

In enterprise systems, personnel records are relational and rich: an employee belongs to a cluster, is based in an office, holds multiple skills, and has an availability status. These schemas define how that data is validated on input and structured on output.

---

## Imports and Dependencies

```python
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
```

Here is why each import is needed:

- **`pydantic.BaseModel`**: The base class enabling data validation, parsing, and type enforcement.
- **`typing.Optional`, `typing.List`**: Python standard type hints for optional values and lists of items.
- **`datetime.datetime`**: Type used for timestamp fields (`created_at`, `updated_at`).

---

## Nested Brief Schemas

When returning a resource, the client often needs summary details of related entities without fetching full nested databases. The "Brief" schemas provide minimal representations:

### 1. `SkillBrief`
```python
class SkillBrief(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    class Config:
        from_attributes = True
```
- Summarizes a skill: its unique ID, name (e.g., "Python"), and broad category (e.g., "Backend").

### 2. `ClusterBrief`
```python
class ClusterBrief(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True
```
- Summarizes a cluster/department: its ID and name (e.g., "Cloud Engineering").

### 3. `LocationBrief`
```python
class LocationBrief(BaseModel):
    id: int
    city: str
    class Config:
        from_attributes = True
```
- Summarizes a location: its ID and city name (e.g., "New York").

---

## Core Resource Schemas

### 4. `ResourceBase`

```python
class ResourceBase(BaseModel):
    employee_id: str
    name: str
    email: str
    cluster_id: int
    designation: Optional[str] = None
    years_of_experience: Optional[float] = None
    current_location_id: Optional[int] = None
    preferred_location_id: Optional[int] = None
    availability_status: str = "Available"
    primary_skill_id: Optional[int] = None
    user_id: Optional[int] = None
```

- **What it does**: Establishes common fields shared across resource definitions.
- **Fields**:
  - `employee_id` (`str`): Unique employee identifier (e.g., "EMP001"). Required.
  - `name` (`str`): Full legal or preferred name. Required.
  - `email` (`str`): Corporate email address. Required.
  - `cluster_id` (`int`): Primary business unit ID. Required.
  - `designation` (`Optional[str]`): Job title (e.g., "Senior Software Engineer").
  - `years_of_experience` (`Optional[float]`): Total work experience in years.
  - `current_location_id` (`Optional[int]`): Foreign key referencing present office location.
  - `preferred_location_id` (`Optional[int]`): Foreign key referencing preferred office or relocation preference.
  - `availability_status` (`str`, default: `"Available"`): Staffing state (e.g., "Available", "Allocated", "Shadow", "On Leave").
  - `primary_skill_id` (`Optional[int]`): Foreign key referencing the employee's top specialty skill.
  - `user_id` (`Optional[int]`): Foreign key linking this resource to a registered system user account.

---

### 5. `ResourceCreate`

```python
class ResourceCreate(BaseModel):
    employee_id: str
    name: str
    email: str
    cluster_id: int
    designation: Optional[str] = None
    years_of_experience: Optional[float] = None
    current_location_id: Optional[int] = None
    preferred_location_id: Optional[int] = None
    availability_status: str = "Available"
    primary_skill_id: Optional[int] = None
    user_id: Optional[int] = None
    secondary_skill_ids: Optional[List[int]] = []
```

- **What it does**: Validates incoming POST requests to create a new resource.
- **Why it's needed**: In addition to base resource fields, creating a resource can include a list of secondary skill IDs (`secondary_skill_ids`) to establish many-to-many associations in one operation.
- **Fields**:
  - Contains all basic profile fields plus `secondary_skill_ids: Optional[List[int]] = []` (list of integers matching skill IDs).

---

### 6. `ResourceUpdate`

```python
class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    cluster_id: Optional[int] = None
    designation: Optional[str] = None
    years_of_experience: Optional[float] = None
    current_location_id: Optional[int] = None
    preferred_location_id: Optional[int] = None
    availability_status: Optional[str] = None
    primary_skill_id: Optional[int] = None
    secondary_skill_ids: Optional[List[int]] = None
```

- **What it does**: Validates partial updates to a resource profile.
- **Why it's needed**: All fields are optional (`None` by default). Notice that `employee_id` is excluded because an employee's organizational ID should never change after creation.
- **Fields**: Any subset of editable fields, including updating the secondary skills list.

---

### 7. `ResourceOut`

```python
class ResourceOut(BaseModel):
    id: int
    employee_id: str
    name: str
    email: str
    cluster_id: int
    designation: Optional[str] = None
    years_of_experience: Optional[float] = None
    current_location_id: Optional[int] = None
    preferred_location_id: Optional[int] = None
    availability_status: str
    primary_skill_id: Optional[int] = None
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # Nested relationships
    cluster: Optional[ClusterBrief] = None
    primary_skill: Optional[SkillBrief] = None
    current_location: Optional[LocationBrief] = None
    preferred_location: Optional[LocationBrief] = None
    skills: Optional[List[SkillBrief]] = []

    class Config:
        from_attributes = True
```

- **What it does**: The comprehensive response model returned when retrieving resource profiles.
- **Why it's needed**: In addition to raw IDs, frontend components need human-readable names for clusters, locations, and skills. `ResourceOut` embeds nested summary objects:
  - `cluster`: `ClusterBrief` with cluster name.
  - `primary_skill`: `SkillBrief` with primary skill name.
  - `current_location`, `preferred_location`: `LocationBrief` with city names.
  - `skills`: List of `SkillBrief` representing all skills held by the resource.
  - `created_at`, `updated_at`: Audit timestamps.
- **`Config.from_attributes = True`**: Allows reading from SQLAlchemy model instances directly.

---

### 8. `ResourceListResponse`

```python
class ResourceListResponse(BaseModel):
    items: List[ResourceOut]
    total: int
    skip: int
    limit: int
```

- **What it does**: Envelopes a paginated list of resources.
- **Why it's needed**: Provides metadata along with data rows so the frontend can display pagination controls (e.g., "Showing 1-20 of 145").
- **Fields**:
  - `items`: The slice of `ResourceOut` records.
  - `total`: Total count of matching records across the entire database.
  - `skip`: Pagination offset applied.
  - `limit`: Maximum count per page.

---

## Key Concepts

- **Nested Schemas**: By composing smaller schemas (`SkillBrief`, `ClusterBrief`, `LocationBrief`) inside `ResourceOut`, we avoid returning flat IDs that require subsequent network round-trips to resolve.
- **Decoupling Input from Output**: Notice how `ResourceCreate` takes integer foreign keys (`cluster_id`, `secondary_skill_ids`), whereas `ResourceOut` outputs structured objects (`cluster`, `skills`). This simplifies client input while enriching client output.
- **Paginated Response Envelope**: Wrapping list responses with pagination metadata (`total`, `skip`, `limit`) is an API best practice that prevents memory issues with large datasets.

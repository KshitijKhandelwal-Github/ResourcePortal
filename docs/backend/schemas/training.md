# Training Schemas (`training.py`)

## Overview

The `training.py` schema file defines the Pydantic models for employee upskilling initiatives and training program records.

Training programs track professional development milestones for personnel. These schemas handle validating new training records, handling status changes (such as progressing from "Planned" to "In Progress" to "Completed"), and formatting the data returned by API endpoints.

---

## Imports and Dependencies

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
```

Here is why each import is needed:

- **`pydantic.BaseModel`**: The core foundation class providing type validation, parsing, and serialization.
- **`typing.Optional`**: Type hint indicating fields that are not strictly required or can hold `None`.
- **`datetime.datetime`**: Imported for date and timestamp support.

---

## Schema Classes & Fields

### 1. `TrainingBase`

```python
class TrainingBase(BaseModel):
    training_name: str
    skill_id: Optional[int] = None
    status: str = "Planned"
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    description: Optional[str] = None
```

- **What it does**: Holds common attributes shared across training schemas.
- **Fields**:
  - `training_name` (`str`): The title of the course, workshop, or module (e.g., "Advanced Kubernetes Administration"). Required.
  - `skill_id` (`Optional[int]`, default: `None`): Optional foreign key pointing to the target skill being learned.
  - `status` (`str`, default: `"Planned"`): Current state of training (e.g., `"Planned"`, `"In Progress"`, `"Completed"`).
  - `start_date` (`Optional[str]`, default: `None`): The date training commenced (formatted as ISO string e.g., `"2026-03-01"`).
  - `completion_date` (`Optional[str]`, default: `None`): The actual or target completion date.
  - `description` (`Optional[str]`, default: `None`): Notes, syllabus details, or course provider link.

---

### 2. `TrainingCreate`

```python
class TrainingCreate(TrainingBase):
    pass
```

- **What it does**: Validates incoming requests to enroll a resource in a training program.
- **Why it's needed**: Inherits all fields from `TrainingBase`. It does not require a `resource_id` in the body because the parent resource is identified in the route path (`/resources/{employee_id}/training`).

---

### 3. `TrainingUpdate`

```python
class TrainingUpdate(BaseModel):
    training_name: Optional[str] = None
    skill_id: Optional[int] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    description: Optional[str] = None
```

- **What it does**: Validates partial updates to an existing training record.
- **Why it's needed**: Allows users or managers to update the status (e.g., marking a course as "Completed") and adding the `completion_date` without needing to re-send all original course information.
- **Fields**: All fields from `TrainingBase` marked optional (`None` default).

---

### 4. `TrainingOut`

```python
class TrainingOut(BaseModel):
    id: int
    resource_id: int
    training_name: str
    skill_id: Optional[int] = None
    status: str
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True
```

- **What it does**: Defines the structured JSON output returned to API consumers.
- **Why it's needed**: Exposes system-generated IDs (`id` and `resource_id`) alongside training information.
- **Fields**:
  - `id` (`int`): Primary key ID of the training record.
  - `resource_id` (`int`): Database foreign key identifying the employee taking the training.
  - All training descriptive fields (`training_name`, `skill_id`, `status`, `start_date`, `completion_date`, `description`).
- **`Config.from_attributes = True`**: Enables ORM mode so Pydantic can automatically extract fields from SQLAlchemy `Training` models.

---

## Key Concepts

- **Progressive Lifecycle Modeling**: Fields like `status`, `start_date`, and `completion_date` represent an ongoing lifecycle. By pairing `TrainingCreate` (which defaults to `"Planned"`) with `TrainingUpdate` (allowing status transitions), the schemas cleanly support standard organizational workflows.
- **Base Class Pattern**: By inheriting from `TrainingBase`, any change to common fields (e.g., adding a provider name) only needs to happen in one place.

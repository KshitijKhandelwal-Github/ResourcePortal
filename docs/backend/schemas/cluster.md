# Cluster Schemas (`cluster.py`)

## Overview

The `cluster.py` schema file defines the Pydantic data models for organizational clusters (departments or business capability groups).

Clusters group resources and projects under shared organizational divisions (such as Data Analytics, Cloud Infrastructure, Mobile Apps). These schemas specify how cluster data is validated when created or updated, and how it is formatted when returned by the API.

---

## Imports and Dependencies

```python
from pydantic import BaseModel
from typing import Optional
```

- **`pydantic.BaseModel`**: The foundational class providing automated data validation and JSON conversion.
- **`typing.Optional`**: Type hint indicating fields that may be omitted or set to `None`.

---

## Schema Classes & Fields

### 1. `ClusterBase`

```python
class ClusterBase(BaseModel):
    name: str
    description: Optional[str] = None
```

- **What it does**: Defines core attributes shared by all cluster schemas.
- **Fields**:
  - `name` (`str`): The organizational cluster's title (e.g., "Enterprise Cloud", "Cybersecurity"). Required.
  - `description` (`Optional[str]`, default: `None`): Optional explanation of the cluster's focus, scope, or leadership.

---

### 2. `ClusterCreate`

```python
class ClusterCreate(ClusterBase):
    pass
```

- **What it does**: Validates the payload when an administrator registers a new cluster.
- **Why it's needed**: Inherits `name` (required) and `description` (optional) from `ClusterBase`.

---

### 3. `ClusterUpdate`

```python
class ClusterUpdate(ClusterBase):
    pass
```

- **What it does**: Validates payload when updating an existing cluster's details.
- **Why it's needed**: Ensures cluster modifications supply valid cluster data attributes.

---

### 4. `ClusterOut`

```python
class ClusterOut(ClusterBase):
    id: int

    class Config:
        from_attributes = True
```

- **What it does**: Serializes cluster details returned to clients.
- **Why it's needed**: Includes the database primary key `id` along with `name` and `description`.
- **`Config.from_attributes = True`**: Enables ORM mode so Pydantic can read properties directly from SQLAlchemy `Cluster` models.

---

## Key Concepts

- **Inheritance for DRY (Don't Repeat Yourself)**: All variations (`Create`, `Update`, `Out`) inherit from `ClusterBase`, keeping field declarations centralized in one place.
- **ORM Mode**: Allows FastAPI to return SQLAlchemy `Cluster` objects from database queries directly, with Pydantic handling JSON conversion automatically.

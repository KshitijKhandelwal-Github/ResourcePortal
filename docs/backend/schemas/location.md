# Location Schemas (`location.py`)

## Overview

The `location.py` schema file defines data models for office locations and geographical regions in the Resource Portal.

Locations provide structured geographical data (`city`, `state`, `country`) so that personnel placement and regional availability can be tracked with consistency rather than relying on unstructured text.

---

## Imports and Dependencies

```python
from pydantic import BaseModel
from typing import Optional
```

- **`pydantic.BaseModel`**: Base class providing validation, data coercion, and serialization.
- **`typing.Optional`**: Type hint indicating optional values.

---

## Schema Classes & Fields

### 1. `LocationBase`

```python
class LocationBase(BaseModel):
    city: str
    state: str
    country: str
```

- **What it does**: Defines shared fields required for geographical locations.
- **Fields**:
  - `city` (`str`): City name (e.g., "San Francisco", "London", "Bengaluru"). Required.
  - `state` (`str`): State, province, or region (e.g., "California", "Karnataka"). Required.
  - `country` (`str`): Country name (e.g., "USA", "India", "UK"). Required.

---

### 2. `LocationCreate`

```python
class LocationCreate(LocationBase):
    pass
```

- **What it does**: Validates incoming requests to add a new office location.
- **Why it's needed**: Inherits `city`, `state`, and `country` from `LocationBase`, ensuring all three are provided when creating a location.

---

### 3. `LocationUpdate`

```python
class LocationUpdate(LocationBase):
    pass
```

- **What it does**: Validates requests when modifying an existing location's details.

---

### 4. `LocationOut`

```python
class LocationOut(LocationBase):
    id: int

    class Config:
        from_attributes = True
```

- **What it does**: Response model returned by location endpoints.
- **Why it's needed**: Appends the database primary key `id` to the location fields.
- **`Config.from_attributes = True`**: Enables ORM mode to serialize directly from SQLAlchemy `Location` model objects.

---

## Key Concepts

- **Structured Geographical Normalization**: Requiring `city`, `state`, and `country` as separate fields eliminates ambiguity (e.g., distinguishing Springfield, Illinois from Springfield, Massachusetts) and enables hierarchical aggregation on analytics dashboards.
- **Automated Validation**: Pydantic ensures that none of the core fields (`city`, `state`, `country`) are left blank or null when registering new locations.

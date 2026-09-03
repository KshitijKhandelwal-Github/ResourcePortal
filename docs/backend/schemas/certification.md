# Certification Schemas (`certification.py`)

## Overview

The `certification.py` schema file defines data models for managing employee industry certifications, licenses, and professional credentials.

Certifications are key qualifications in technical consulting:
- Verifying whether an engineer holds certifications (such as AWS Solutions Architect or Certified Scrum Master).
- Tracking credential expiration dates to plan recertification exams.
- Serializing certification records cleanly when viewing an employee's profile.

---

## Imports and Dependencies

```python
from typing import Optional
from pydantic import BaseModel
```

- **`typing.Optional`**: Type hint indicating fields that are not mandatory and can be `None`.
- **`pydantic.BaseModel`**: The core foundation class providing type validation, parsing, and JSON serialization.

---

## Schema Classes & Fields

### 1. `CertificationBase`

```python
class CertificationBase(BaseModel):
    name: str
    issuing_organization: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
```

- **What it does**: Holds common fields shared across certification models.
- **Fields**:
  - `name` (`str`): The official title of the certification (e.g., "AWS Certified Solutions Architect - Associate"). Required.
  - `issuing_organization` (`Optional[str]`, default: `None`): The authority or vendor that issued the credential (e.g., "Amazon Web Services", "Microsoft", "Scrum Alliance").
  - `issue_date` (`Optional[str]`, default: `None`): Date granted (formatted as string, e.g., `"2025-06-15"`).
  - `expiry_date` (`Optional[str]`, default: `None`): Date the credential lapses, if applicable.

---

### 2. `CertificationCreate`

```python
class CertificationCreate(CertificationBase):
    pass
```

- **What it does**: Validates incoming payloads to attach a new certification to a resource.
- **Why it's needed**: Inherits all fields from `CertificationBase`. The resource linkage is derived from the route path URL, keeping the payload concise.

---

### 3. `CertificationUpdate`

```python
class CertificationUpdate(BaseModel):
    name: Optional[str] = None
    issuing_organization: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
```

- **What it does**: Validates requests to update an existing certification.
- **Why it's needed**: Allows modifying fields (such as updating an `expiry_date` upon recertification) without needing to re-send all other unchanged attributes.
- **Fields**: All certification attributes marked optional.

---

### 4. `CertificationOut`

```python
class CertificationOut(BaseModel):
    id: int
    resource_id: int
    name: str
    issuing_organization: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None

    class Config:
        from_attributes = True
```

- **What it does**: Defines the output format returned to API clients.
- **Why it's needed**: Appends the database primary key `id` and the associated foreign key `resource_id` to the certification information.
- **`Config.from_attributes = True`**: Enables ORM mode, allowing Pydantic to read attributes directly from SQLAlchemy `Certification` database instances.

---

## Key Concepts

- **Date Storage as Strings**: In this schema, `issue_date` and `expiry_date` are typed as `Optional[str]`. This accommodates ISO 8601 formatted strings (e.g., `"YYYY-MM-DD"`) from client datepickers without strict datetime object conversion overhead.
- **Field Optionality**: Only `name` is strictly required; issuing authority and dates are optional because some certifications do not expire or might be historical entries where exact grant dates are unrecorded.

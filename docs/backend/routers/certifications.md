# Certifications Router (`certifications.py`)

## Overview

The `certifications.py` router manages professional licenses and technical accreditations earned by personnel (such as AWS Certified Solutions Architect, CISSP, PMP, or Google Cloud Professional Data Engineer).

In technical consulting and engineering organizations:
- Certifications serve as verifiable proof of technical competence.
- Project staffing decisions often depend on having resources with specific vendor credentials.
- Personnel take pride in tracking their credentials, issue dates, and expiry dates.

This router enables retrieving certifications for an employee, adding newly earned certifications, and updating existing certification details.

---

## Imports and Dependencies

```python
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from resourceportal.database.database import get_db
from resourceportal.schemas.certification import CertificationOut, CertificationCreate, CertificationUpdate
from resourceportal.models.certification import Certification
from resourceportal.models.resource import Resource
from resourceportal.utils.dependencies import get_current_user
from resourceportal.models.user import User
from resourceportal.utils.exceptions import NotFoundException
```

Here is why each import is needed:

- **`fastapi.APIRouter`, `Depends`, `status`, `HTTPException`**: Core FastAPI tools for building endpoints, injecting database sessions/user tokens, using HTTP status codes, and raising HTTP exceptions.
- **`sqlalchemy.orm.Session`**: Facilitates database query execution and data persistence.
- **`typing.List`**: Type annotation indicating endpoints that return a collection of certification records.
- **`get_db`**: Generator dependency that yields an active database session for each request.
- **`CertificationOut`, `CertificationCreate`, `CertificationUpdate`**: Pydantic schemas validating certification inputs (e.g., certification name, issuing organization, issue date, expiry date, credential ID) and shaping JSON responses.
- **`Certification`**: SQLAlchemy ORM model mapping to the `certifications` database table.
- **`Resource`**: SQLAlchemy model mapping to the `resources` table.
- **`get_current_user`**: Decodes the JWT bearer token to identify the authenticated caller.
- **`User`**: SQLAlchemy model representing system users.
- **`NotFoundException`**: Custom exception triggering an HTTP 404 response when a resource or certification is not found.

---

## Router Configuration

```python
router = APIRouter(prefix="/api/v1", tags=["certifications"])
```

- **`prefix="/api/v1"`**: Common base path for routes in this module.
- **`tags=["certifications"]`**: Categorizes certification endpoints under the "certifications" heading in Swagger/OpenAPI documentation.

---

## Endpoints

### 1. Get Certifications for Resource (`GET /api/v1/resources/{employee_id}/certifications`)

```python
@router.get("/resources/{employee_id}/certifications", response_model=List[CertificationOut])
def get_certifications(employee_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(Resource).filter(Resource.employee_id == employee_id).first()
    if not resource:
        raise NotFoundException("Resource not found")
    return db.query(Certification).filter(Certification.resource_id == resource.id).all()
```

- **HTTP Method & Path**: `GET /api/v1/resources/{employee_id}/certifications`
- **Authentication & Authorization**: Any authenticated user (`get_current_user`).
- **Path Parameters**: `employee_id` (str): Identifier of the target employee (e.g., "EMP042").
- **Returns**: `List[CertificationOut]` containing all certifications linked to the employee.
- **Step-by-Step Logic**:
  1. Find the resource record matching `employee_id`.
  2. If no resource is found, raise `NotFoundException("Resource not found")`.
  3. Query the `Certification` table where `resource_id` matches `resource.id` and return all rows.

---

### 2. Create Certification (`POST /api/v1/resources/{employee_id}/certifications`)

```python
@router.post("/resources/{employee_id}/certifications", response_model=CertificationOut, status_code=status.HTTP_201_CREATED)
def create_certification(employee_id: str, cert: CertificationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(Resource).filter(Resource.employee_id == employee_id).first()
    if not resource:
        raise NotFoundException("Resource not found")
    
    if current_user.role == "user" and resource.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not permitted")
        
    db_cert = Certification(**cert.model_dump(), resource_id=resource.id)
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert
```

- **HTTP Method & Path**: `POST /api/v1/resources/{employee_id}/certifications`
- **Authentication & Authorization**:
  - `admin` and `senior_associate` can add certifications to any resource.
  - A standard `user` can only add certifications to their own resource profile (`resource.user_id == current_user.id`). Other attempts are rejected with HTTP 403 Forbidden.
- **Path Parameters**: `employee_id` (str): Employee receiving the new certification.
- **Body**: `CertificationCreate` containing certification name, issuer, issue date, and optional expiry date or credential ID.
- **Returns**: Created `CertificationOut` with HTTP 201 Created status.
- **Step-by-Step Logic**:
  1. Retrieve the resource matching `employee_id`.
  2. Enforce self-ownership checks for standard users.
  3. Instantiate a `Certification` model with the provided data and set its `resource_id`.
  4. Save to the database, refresh to load generated IDs, and return the entity.

---

### 3. Update Certification (`PUT /api/v1/certifications/{certification_id}`)

```python
@router.put("/certifications/{certification_id}", response_model=CertificationOut)
def update_certification(certification_id: int, cert: CertificationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_cert = db.query(Certification).filter(Certification.id == certification_id).first()
    if not db_cert:
        raise NotFoundException("Certification not found")
        
    resource = db.query(Resource).filter(Resource.id == db_cert.resource_id).first()
    if current_user.role == "user" and (not resource or resource.user_id != current_user.id):
         raise HTTPException(status_code=403, detail="Not permitted")
         
    update_data = cert.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_cert, k, v)
    db.commit()
    db.refresh(db_cert)
    return db_cert
```

- **HTTP Method & Path**: `PUT /api/v1/certifications/{certification_id}`
- **Authentication & Authorization**:
  - `admin` and `senior_associate` can update any certification record.
  - A standard `user` can only update certifications that belong to their own resource profile.
- **Path Parameters**: `certification_id` (int): Database ID of the certification record.
- **Body**: `CertificationUpdate` containing updated certification fields.
- **Returns**: Updated `CertificationOut` record.
- **Step-by-Step Logic**:
  1. Look up the certification record by `certification_id`. Raise 404 if not found.
  2. Look up the parent resource record via `db_cert.resource_id` to verify caller ownership.
  3. Update only the supplied fields using `model_dump(exclude_unset=True)`.
  4. Commit to the database and return the refreshed record.

---

## Key Concepts

- **Parent-Child Relational Traversal**: When updating a certification, the router queries the parent `Resource` to verify that `resource.user_id == current_user.id`. This ensures permissions are validated even when accessing the child resource directly by its ID.
- **Auditing and Credentials**: Tracking credentials with explicit verification IDs and expiry dates allows companies to ensure compliance requirements (e.g., maintaining required numbers of AWS certified architects for partner tiers) are met.
- **Declarative Schema Serialization**: FastAPI automatically converts SQLAlchemy models into JSON matching the schema specified in `response_model=CertificationOut`.

# Custom HTTP Exceptions (`exceptions.py`)

## Overview

The [`exceptions.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/exceptions.py) file defines custom, reusable HTTP exception classes for common error scenarios encountered across the Resource Management Portal backend.

Think of [`exceptions.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/exceptions.py) like **pre-printed official rejection stamps at an office**:
- Instead of filling out a full legal form explaining status codes and protocol headers every single time a document cannot be found or has invalid data, you grab a ready-made stamp:
  - The **`NotFoundException`** stamp: Pre-marked with **404 Not Found**.
  - The **`BadRequestException`** stamp: Pre-marked with **400 Bad Request**.
- This keeps router and service code clean, consistent, and concise.

---

## Imports and Dependencies

```python
from fastapi import HTTPException, status
```

Here is why each import is needed:

- **[`fastapi.HTTPException`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/exceptions.py#L1)**: FastAPI's base exception class for returning HTTP error responses. When raised anywhere inside a request handler, FastAPI catches it and converts it into a standardized JSON response with an appropriate HTTP status code.
- **[`fastapi.status`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/exceptions.py#L1)**: A module containing human-readable constants for HTTP status codes, such as `status.HTTP_404_NOT_FOUND` (integer `404`) and `status.HTTP_400_BAD_REQUEST` (integer `400`).

---

## Exception Classes

### 1. `NotFoundException`

```python
class NotFoundException(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
```

- **What it does**: A specialized subclass of `HTTPException` that is permanently bound to the `404 Not Found` HTTP status code.
- **Why it's needed**: In database-driven APIs, checking if a requested item exists is one of the most frequent operations. If a resource, user, skill, or cluster is missing from the database, raising this custom exception immediately sends a 404 response to the client with a clear error message.
- **Parameters**:
  - `detail` (`str`, default `"Resource not found"`): Custom error message explaining what entity could not be found.
- **How it works**:
  - Inherits from `HTTPException`.
  - In its `__init__` constructor, it invokes the parent class constructor `super().__init__()`, passing `status_code=status.HTTP_404_NOT_FOUND` (404) and the custom `detail` string.

#### Usage Comparison
```python
# Without custom exception (verbose and repetitive):
raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource with ID 5 not found")

# With NotFoundException (clean and readable):
raise NotFoundException("Resource with ID 5 not found")
```

---

### 2. `BadRequestException`

```python
class BadRequestException(HTTPException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
```

- **What it does**: A specialized subclass of `HTTPException` permanently bound to the `400 Bad Request` HTTP status code.
- **Why it's needed**: When a client sends a request that violates business rules or contains invalid/conflicting data (such as trying to add a duplicate skill name or referencing an invalid foreign key), raising this exception informs the client that their request was malformed.
- **Parameters**:
  - `detail` (`str`, default `"Bad request"`): Custom error message describing why the request was invalid.
- **How it works**:
  - Inherits from `HTTPException`.
  - In its `__init__` constructor, it invokes `super().__init__()`, passing `status_code=status.HTTP_400_BAD_REQUEST` (400) and the custom `detail` string.

#### Usage Comparison
```python
# Without custom exception:
raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A skill with this name already exists")

# With BadRequestException:
raise BadRequestException("A skill with this name already exists")
```

---

## Key Concepts

- **Object-Oriented Inheritance (`class Child(Parent):`)**: A programming principle where a new class adopts properties and behaviors from an existing class. `NotFoundException` inherits all behavior of FastAPI's `HTTPException`, meaning FastAPI handles it identically without needing special error handlers.
- **`super().__init__()`**: Python syntax used inside a subclass to call the initialization method of the parent class, ensuring the base class attributes (like `status_code` and `headers`) are properly initialized.
- **DRY (Don't Repeat Yourself)**: A foundational software engineering principle stating that every piece of knowledge or logic must have a single, unambiguous representation in a system. Subclassing eliminates repeating `status_code=status.HTTP_404_NOT_FOUND` in dozens of files.
- **HTTP Status Codes: 400 vs 404**:
  - **400 Bad Request**: The server understood the request syntax, but could not process it due to invalid arguments or business rule violations (e.g. duplicate resource names, invalid dates).
  - **404 Not Found**: The server cannot find the requested resource at the given identifier or path.

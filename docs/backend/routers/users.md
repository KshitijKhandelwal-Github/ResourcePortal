# Users Router (`users.py`)

## Overview

The `users.py` file defines endpoints for user account administration and personal profile inspection. While `auth.py` handles logging in and registering, `users.py` manages ongoing user profiles, permissions, and account statuses.

In an enterprise system:
- Administrators need a directory to view all registered users and adjust their roles (e.g., promoting a user to `senior_associate` or deactivating an account).
- Any logged-in user needs a quick way to inspect their own profile and privileges (`/me`).

---

## Imports and Dependencies

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from resourceportal.database.database import get_db
from resourceportal.schemas.user import UserOut, UserUpdate
from resourceportal.models.user import User
from resourceportal.utils.dependencies import require_role, get_current_user
from resourceportal.utils.exceptions import NotFoundException
```

Here is why each import is needed:

- **`fastapi.APIRouter`, `Depends`**: FastAPI tools for registering routes and injecting dependencies.
- **`sqlalchemy.orm.Session`**: Provides an active database session.
- **`typing.List`**: Type annotation indicating a response returns a list of items.
- **`get_db`**: Injects a scoped database session.
- **`UserOut`, `UserUpdate`**: Pydantic schemas:
  - `UserOut`: Controls what user data is safely exposed to the client (excludes sensitive fields like password hashes).
  - `UserUpdate`: Validates incoming partial updates for user fields (e.g., `role`, `cluster_id`, `is_active`).
- **`User`**: SQLAlchemy model representing the user database table.
- **`require_role`, `get_current_user`**: Security dependencies:
  - `require_role(["admin"])`: Guards administrative endpoints.
  - `get_current_user`: Identifies the current caller from their JWT token.
- **`NotFoundException`**: Custom exception returning HTTP 404 when an entity is not found.

---

## Router Configuration

```python
router = APIRouter(prefix="/api/v1/users", tags=["users"])
```

- **`prefix="/api/v1/users"`**: Prefix for all user management endpoints.
- **`tags=["users"]`**: Categorizes endpoints under "users" in Swagger/OpenAPI documentation.

---

## Endpoints

### 1. List All Users (`GET /api/v1/users`)

```python
@router.get("", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(require_role(["admin"]))):
    return db.query(User).all()
```

- **HTTP Method & Path**: `GET /api/v1/users`
- **Authentication & Authorization**: Requires `admin` role. Non-admins receive HTTP 403 Forbidden.
- **What it does**: Queries and returns a complete list of all user accounts in the database.
- **Parameters**:
  - `db` (`Session`): Database session.
  - `current_user` (`User`): Admin user executing the request.
- **Returns**: `List[UserOut]` containing IDs, usernames, emails, roles, cluster assignments, and active statuses.

---

### 2. Get Current User Profile (`GET /api/v1/users/me`)

```python
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
```

- **HTTP Method & Path**: `GET /api/v1/users/me`
- **Authentication & Authorization**: Any authenticated user with a valid JWT token.
- **What it does**: Returns the authenticated user's own profile information.
- **Why it's needed**: When a frontend client loads or refreshes, it calls `/me` using its stored token to determine who is logged in and what UI features to show based on their role.
- **Parameters**: `current_user` (`User`): Resolved directly from the bearer token.
- **Returns**: `UserOut` model of the requesting user.

---

### 3. Update User (`PUT /api/v1/users/{user_id}`)

```python
@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role(["admin"]))):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise NotFoundException(detail="User not found")
    
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user
```

- **HTTP Method & Path**: `PUT /api/v1/users/{user_id}`
- **Authentication & Authorization**: Requires `admin` role.
- **Path Parameters**: `user_id` (int): Database ID of the target user to modify.
- **Body**: `UserUpdate` containing fields to change (e.g., `role`, `cluster_id`, `is_active`).
- **Returns**: Updated `UserOut` object.
- **Step-by-Step Logic**:
  1. Look up the user record by `user_id`.
  2. If the user does not exist, raise `NotFoundException("User not found")`.
  3. Extract only the fields supplied in the request body via `.model_dump(exclude_unset=True)`.
  4. Dynamically update the model attributes using Python's `setattr`.
  5. Commit changes to the database and refresh the object.
  6. Return the updated user.

---

## Key Concepts

- **Partial Updates (`exclude_unset=True`)**: In Pydantic v2, `model_dump(exclude_unset=True)` returns a dictionary containing *only* the fields that the client explicitly provided, ignoring unset optional fields. This prevents accidentally overwriting existing values with `None`.
- **Dynamic Attribute Setting (`setattr`)**: `setattr(db_user, key, value)` is equivalent to `db_user.key = value`, but allows updating fields programmatically from a dictionary loop without hardcoding every attribute.
- **Self-Inspection Pattern (`/me`)**: Standard REST convention allowing clients to obtain user-specific state without knowing their numerical ID beforehand.

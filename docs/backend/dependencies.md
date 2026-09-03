# FastAPI Authentication & Authorization Dependencies (`dependencies.py`)

## Overview

The [`dependencies.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/dependencies.py) file defines reusable FastAPI dependency functions that secure API routes. It handles extracting Bearer tokens from incoming HTTP requests, verifying user identity, and enforcing Role-Based Access Control (RBAC).

Think of [`dependencies.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/dependencies.py) like **security guards and VIP bouncers at an exclusive event**:
- **[`get_current_user`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/dependencies.py#L11-L27)** is the security guard at the building entrance: they check your ID badge (the JWT token in the `Authorization` header), confirm it hasn't expired or been forged, look up your name in the company registry, and allow you into general areas.
- **[`require_role`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/dependencies.py#L29-L34)** is the bouncer stationed at restricted doors (like the executive boardroom): they check your badge to see if your role (`admin` or `senior_associate`) is on the approved list for that room. If not, they turn you away with an HTTP 403 Forbidden error.

---

## Imports and Dependencies

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from resourceportal.database.database import get_db
from resourceportal.models.user import User
from resourceportal.config import settings
```

Here is why each import is needed:

- **[`fastapi.Depends`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/dependencies.py#L1)**: FastAPI's dependency injection decorator. It tells FastAPI to execute a dependency function and pass its return value as an argument into an endpoint or another dependency.
- **[`fastapi.HTTPException`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/dependencies.py#L1)**: Exception class used to immediately abort request execution and send a specific HTTP error status (such as 401 Unauthorized or 403 Forbidden) back to the client.
- **[`fastapi.status`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/dependencies.py#L1)**: Constants for HTTP status codes (`HTTP_401_UNAUTHORIZED`, etc.).
- **[`OAuth2PasswordBearer`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/dependencies.py#L2)**: Security helper class that inspects incoming HTTP requests for an `Authorization: Bearer <token>` header, extracts the token string, and integrates with FastAPI's automatic Swagger/OpenAPI documentation.
- **`jwt` (PyJWT)**: Decodes and cryptographically validates JSON Web Tokens using `settings.SECRET_KEY`.
- **[`Session`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/dependencies.py#L4)**: SQLAlchemy database session type hint.
- **[`get_db`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/database.py#L14-L19)**: The database session generator dependency.
- **[`User`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/models/user.py)**: The SQLAlchemy database model representing user accounts.
- **[`settings`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/config.py#L11)**: Application settings providing the `SECRET_KEY` required to decode and verify JWT signatures.

---

## OAuth2 Scheme (`oauth2_scheme`)

```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
```

### What it does
Creates an [`OAuth2PasswordBearer`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/utils/dependencies.py#L9) instance. It tells FastAPI that our API uses OAuth2 Bearer token authentication and designates `/api/v1/auth/login` as the URL where clients can obtain tokens.

### Why it's needed
1. When injected into an endpoint via `Depends(oauth2_scheme)`, it automatically searches the incoming request's headers for `Authorization: Bearer <token>` and extracts just the `<token>` string. If the header is missing, it automatically responds with HTTP 401 Unauthorized.
2. It lights up the interactive **"Authorize"** button in FastAPI's Swagger UI documentation (`/docs`), allowing developers to log in and test protected routes directly in their browser.

---

## Functions

### 1. `get_current_user`

```python
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user
```

- **What it does**: Validates the JWT token from the client, identifies the user, retrieves their full record from the database, and returns the [`User`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/models/user.py) object.
- **Why it's needed**: Any protected endpoint (e.g. updating profile details, viewing internal resources) needs to know who is making the request and verify their credentials are authentic.
- **Parameters**:
  - `token` (`str`): Injected automatically by `Depends(oauth2_scheme)`.
  - `db` (`Session`): Injected database session via `Depends(get_db)`.
- **Returns**: [`User`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/models/user.py) - The authenticated database user object.
- **Step-by-Step Logic**:
  1. **Prepare Exception**: Defines a reusable `credentials_exception` with HTTP status 401 Unauthorized and standard `WWW-Authenticate: Bearer` challenge header.
  2. **Decode & Verify Signature**: Calls `jwt.decode()`. PyJWT verifies that the token was signed with `settings.SECRET_KEY`, that the algorithm is `"HS256"`, and that the token's expiration timestamp (`exp`) has not passed.
  3. **Extract Username**: Reads the `"sub"` (subject) field from the decoded payload. If missing, raises `credentials_exception`.
  4. **Handle Token Errors**: If `jwt.InvalidTokenError` occurs (e.g., expired token, altered signature, corrupted format), catches the exception and raises `credentials_exception`.
  5. **Database Lookup**: Queries the `User` table for `User.username == username`.
  6. **Existence Check**: If no matching user is found (e.g., the user was deleted after the token was issued), raises `credentials_exception`.
  7. **Return User**: Returns the active `User` model instance to the calling route.

---

### 2. `require_role`

```python
def require_role(roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return current_user
    return role_checker
```

- **What it does**: A dependency factory (higher-order function) that generates a role-checking dependency restricting endpoint access to specific user roles.
- **Why it's needed**: Implements **Role-Based Access Control (RBAC)** cleanly. Instead of writing `if user.role != 'admin': raise ...` inside every single route, you declare permitted roles directly in the endpoint signature.
- **Parameters**:
  - `roles` (`list[str]`): A list of allowed role strings (e.g., `["admin"]` or `["admin", "senior_associate"]`).
- **Returns**: A callable `role_checker` function suitable for use with `Depends()`.
- **Step-by-Step Logic**:
  1. `require_role(["admin"])` is called when defining a route. It captures the list of permitted roles in a Python closure.
  2. The returned `role_checker` function depends on `current_user: User = Depends(get_current_user)`. This ensures user authentication runs first.
  3. When an HTTP request arrives, `role_checker` inspects `current_user.role`.
  4. If `current_user.role` is not in the allowed `roles` list, it immediately raises `HTTPException(status_code=403, detail="Not enough permissions")`.
  5. If authorized, it returns the `current_user` to the endpoint.

### Example Usage in a Router
```python
from fastapi import APIRouter, Depends
from resourceportal.utils.dependencies import require_role
from resourceportal.models.user import User

router = APIRouter()

# Only administrators can delete a cluster:
@router.delete("/clusters/{id}", dependencies=[Depends(require_role(["admin"]))])
def delete_cluster(id: int):
    ...

# Both admins and managers can view team reports:
@router.get("/reports")
def view_reports(user: User = Depends(require_role(["admin", "senior_associate"]))):
    ...
```

---

## Key Concepts

- **Dependency Injection (`Depends`)**: A software design pattern where a function declares what dependencies it needs (like a database session or authenticated user), and the framework automatically resolves and injects them at runtime.
- **Closures and Factory Functions**: A function that creates and returns another function. `require_role()` is a factory that takes configuration (`roles`) and produces a custom `role_checker` function that remembers those roles.
- **RBAC (Role-Based Access Control)**: Restricting system access based on the roles assigned to individual users (e.g., `admin`, `senior_associate`, `user`).
- **HTTP 401 vs. HTTP 403**:
  - **401 Unauthorized**: *"Who are you?"* The client has not provided valid authentication credentials (bad token, expired token, or not logged in).
  - **403 Forbidden**: *"I know who you are, but you are not allowed in here."* The client is authenticated, but their account lacks sufficient permissions for the requested action.

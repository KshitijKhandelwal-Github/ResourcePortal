# Authentication Router (`auth.py`)

## Overview

The `auth.py` file defines the HTTP API routes for authentication and user registration in the Resource Portal. Think of it like the front door and security checkpoint of a building:
- When a user arrives, they can present their credentials to prove who they are and receive an access pass (JWT token) via the `/login` endpoint.
- If a new user needs an account, they can sign up at the reception desk via the `/register` endpoint.

This file acts as a **router**, meaning it maps specific web addresses (URLs) and HTTP methods (POST, GET, etc.) to Python functions that handle the request, verify credentials against the database, and return formatted responses.

---

## Imports and Dependencies

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from resourceportal.database.database import get_db
from resourceportal.services.auth_service import verify_password, create_access_token, get_password_hash
from resourceportal.models.user import User
from resourceportal.schemas.user import LoginRequest, LoginResponse, UserCreate, UserOut
```

Here is why each import is needed:

- **`fastapi.APIRouter`**: Allows grouping related endpoints together into modular route collections (like organizing chapters in a book).
- **`fastapi.Depends`**: FastAPI's dependency injection system. It provides database sessions or other dependencies automatically to endpoint functions when a request arrives.
- **`fastapi.HTTPException`**: An exception used to immediately interrupt request handling and send a standardized HTTP error response (like 401 Unauthorized or 400 Bad Request) back to the client.
- **`fastapi.status`**: A set of human-readable constants representing HTTP status codes (e.g., `status.HTTP_201_CREATED`, `status.HTTP_401_UNAUTHORIZED`).
- **`sqlalchemy.orm.Session`**: Represents an active connection and transaction to the database, allowing querying and saving records.
- **`get_db`**: A dependency generator that yields an active database session for a single request and closes it safely when done.
- **`verify_password`, `create_access_token`, `get_password_hash`**: Security helper functions from `auth_service`:
  - `verify_password`: Compares plain text password against a stored cryptographic hash.
  - `create_access_token`: Generates a signed JSON Web Token (JWT) encoding the user's identity.
  - `get_password_hash`: Securely hashes passwords before saving them to the database.
- **`User`**: The SQLAlchemy database model representing the `users` table.
- **`LoginRequest`, `LoginResponse`, `UserCreate`, `UserOut`**: Pydantic schemas that validate incoming request payloads and structure outgoing JSON responses.

---

## Router Configuration

```python
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
```

- **`router`**: An instance of `APIRouter`.
  - **`prefix="/api/v1/auth"`**: Prepends this URL path to all endpoints defined in this file. For example, `/login` becomes `/api/v1/auth/login`.
  - **`tags=["auth"]`**: Categorizes these endpoints under the "auth" heading in interactive Swagger/OpenAPI documentation (`/docs`).

---

## Endpoints

### 1. User Login (`POST /api/v1/auth/login`)

```python
@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated")
    access_token = create_access_token(data={"sub": user.username})
    return LoginResponse(
        access_token=access_token,
        user=UserOut(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            cluster_id=user.cluster_id,
            is_active=user.is_active,
        ),
    )
```

- **HTTP Method & Path**: `POST /api/v1/auth/login`
- **Authentication Requirements**: None (Public endpoint).
- **What it does**: Authenticates a user by checking their username and password. If valid, returns a JSON Web Token (JWT) access token and basic user details.
- **Parameters**:
  - `login_data` (`LoginRequest`): JSON body containing `username` and `password`.
  - `db` (`Session`): Injected database session via `Depends(get_db)`.
- **Returns**: `LoginResponse` containing:
  - `access_token` (str): JWT string.
  - `token_type` (str): Defaulting to "bearer".
  - `user` (`UserOut`): User profile summary (ID, username, email, role, cluster ID, active status).
- **Step-by-Step Logic**:
  1. Search the database for a user matching `login_data.username`.
  2. If the user doesn't exist or `verify_password()` returns `False`, stop immediately and return HTTP 401 Unauthorized with a header asking for Bearer auth.
  3. If the user exists but `is_active` is `False`, raise HTTP 403 Forbidden ("User account is deactivated").
  4. Generate a JWT token encoding the user's username in the `sub` (subject) claim.
  5. Return the token and user profile model.

---

### 2. User Registration (`POST /api/v1/auth/register`)

```python
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter((User.username == user.username) | (User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        role=user.role,
        cluster_id=user.cluster_id,
        hashed_password=hashed_password,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
```

- **HTTP Method & Path**: `POST /api/v1/auth/register`
- **Authentication Requirements**: None (Public endpoint).
- **What it does**: Registers a new user account into the system.
- **Parameters**:
  - `user` (`UserCreate`): JSON body containing `username`, `email`, `password`, and optional `role` and `cluster_id`.
  - `db` (`Session`): Injected database session via `Depends(get_db)`.
- **Returns**: `UserOut` with HTTP status 201 Created. Note that password hashes are never returned.
- **Step-by-Step Logic**:
  1. Check if a user with the same username OR email already exists.
  2. If a match is found, raise HTTP 400 Bad Request with an explanation.
  3. Hash the plain text password using bcrypt via `get_password_hash`.
  4. Create a new `User` SQLAlchemy model instance with the hashed password.
  5. Save the user to the database (`db.add`, `db.commit`).
  6. Refresh the user instance to populate auto-generated database columns (such as `id` and `created_at`).
  7. Return the new user object (FastAPI filters this using `UserOut`).

---

## Key Concepts

- **Dependency Injection (`Depends`)**: Instead of functions creating their own database connections, FastAPI creates the connection and passes ("injects") it into the function. This ensures connections are cleaned up properly and makes unit testing simple.
- **Password Hashing**: Storing passwords in plain text is dangerous. Hashing transforms a password into a scrambled string using a one-way mathematical function (`bcrypt`). You cannot convert the hash back into the password; you can only check if another password hashes to the same value.
- **JWT (JSON Web Token)**: A compact, URL-safe token representing claims between two parties. Once issued on login, the client sends this token in subsequent requests inside the `Authorization: Bearer <token>` header to prove their identity without needing to re-send passwords.
- **Pydantic Validation (`response_model`)**: FastAPI uses Pydantic models to automatically validate incoming JSON bodies and filter outgoing data so sensitive fields (like `hashed_password`) are never leaked to the client.

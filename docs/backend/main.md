# Application Entry Point (`main.py`)

## Overview

The [`main.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/main.py) file is the central entry point and orchestrator of the Resource Management Portal backend. When you start the web server (for example, using Uvicorn), this file is what gets loaded first.

Think of [`main.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/main.py) like the **lobby and front reception desk of an office building**:
- It unlocks the doors and turns on the lights before anyone enters (creating database tables and loading initial data via `lifespan`).
- It posts security policies at the door (configuring CORS middleware so frontend web apps can interact with the API).
- It houses a directory board that routes visitors to different departments like HR, Finance, and IT (registering the various routers like `/auth`, `/resources`, `/skills`).
- It has a friendly greeter at the front desk (a root `/` endpoint confirming the API is awake and healthy).

---

## Imports and Dependencies

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from resourceportal.database.database import engine, Base, get_db
from resourceportal.database.seed import seed_db
from resourceportal.routers import auth, resources, dashboard, users, skills, clusters, locations, certifications, training
import contextlib
```

Here is why each import is needed:

- **[`FastAPI`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/main.py#L1)**: The core Python class from the FastAPI framework used to create and configure the web application.
- **[`CORSMiddleware`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/main.py#L2)**: Middleware that manages Cross-Origin Resource Sharing (CORS). It allows browsers running a frontend website on one origin (e.g., `http://localhost:5173`) to communicate with this backend API running on another origin (e.g., `http://localhost:8000`).
- **[`engine`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/database.py#L7-L9)**: The SQLAlchemy database connection engine that executes SQL statements against the configured database.
- **[`Base`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/database.py#L12)**: The declarative base class that keeps track of all database models (tables) defined in the application.
- **[`get_db`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/database.py#L14-L19)**: A generator function providing isolated database sessions.
- **[`seed_db`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/seed.py#L13-L141)**: A utility function that populates the database with default sample data (users, clusters, skills, resources, etc.) if it hasn't been seeded yet.
- **`resourceportal.routers.*`**: The 9 feature modules containing individual API endpoints:
  - `auth`: Login and registration routes.
  - `resources`: Resource profiles, skills, and availability management.
  - `dashboard`: Metrics and analytical charts for management.
  - `users`: User administration and role handling.
  - `skills`: Technical skills taxonomy.
  - `clusters`: Business organizational groups (GOLF, ECHO, etc.).
  - `locations`: Office locations and cities.
  - `certifications`: Employee certifications tracking.
  - `training`: Skill training courses and completion records.
- **`contextlib`**: Python standard library module used to define an asynchronous context manager for application startup and shutdown lifecycle management.

---

## Application Lifecycle (`lifespan`)

```python
@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    seed_db(db)
    yield
```

### What it does
The [`lifespan`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/main.py#L8-L13) function defines actions that must happen **before** the application starts accepting incoming HTTP traffic, as well as cleanup steps when the application shuts down.

### Why it's needed
Before users can log in or request resources, the database tables must physically exist in SQLite/PostgreSQL, and standard baseline records (such as default admin accounts and initial skill categories) must be present. Running this in `lifespan` guarantees the database is ready on cold boot without requiring manual setup scripts.

### How it works step-by-step
1. **Create Tables**: `Base.metadata.create_all(bind=engine)` inspects all registered SQLAlchemy model classes (like `User`, `Resource`, `Skill`) and creates their corresponding tables in the database if they do not already exist.
2. **Open Database Session**: `db = next(get_db())` steps through the `get_db()` generator to acquire an active database session for startup tasks.
3. **Seed Baseline Data**: `seed_db(db)` runs seed checks. If the database is empty, it inserts default users, clusters, locations, skills, resources, and training records.
4. **`yield` Control**: The `yield` statement pauses this function and transfers control back to FastAPI. The server now runs, waiting for incoming requests.
5. **Shutdown Cleanup**: When the server is stopped, execution resumes after `yield` where any shutdown operations (like disconnecting background queues or closing external pools) would take place.

- **Parameters**: `app: FastAPI` - The application instance.
- **Returns**: An asynchronous generator context manager.

---

## Application Instance & CORS Setup

```python
app = FastAPI(title="Resource Management Portal", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### What it does
- **`app = FastAPI(...)`**: Instantiates the primary web application object and sets the interactive OpenAPI documentation title to `"Resource Management Portal"`.
- **`app.add_middleware(CORSMiddleware, ...)`**: Attaches security middleware that handles cross-origin HTTP requests.

### Why it's needed
Web browsers enforce the **Same-Origin Policy** to protect users from malicious scripts. If your React or Vite frontend is running at `http://localhost:5173` and tries to fetch data from your API at `http://localhost:8000`, the browser will block the response unless the backend explicitly authorizes that origin through CORS headers.

### Configuration Settings Explained
- **`allow_origins=["http://localhost:5173"]`**: Grants permission exclusively to the frontend client running on Vite's default dev server port (`5173`).
- **`allow_credentials=True`**: Allows cookies, authorization headers, and credentials to be included in cross-origin HTTP requests.
- **`allow_methods=["*"]`**: Allows all HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`).
- **`allow_headers=["*"]`**: Allows all HTTP headers (such as `Authorization`, `Content-Type`, `Accept`).

---

## Router Registration

```python
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(clusters.router)
app.include_router(locations.router)
app.include_router(skills.router)
app.include_router(resources.router)
app.include_router(certifications.router)
app.include_router(training.router)
app.include_router(dashboard.router)
```

### What it does
Mounts each feature's router onto the primary `app` instance.

### Why it's needed
Rather than writing hundreds of API endpoints inside a single massive file, modern applications split routes into distinct modules (e.g. `routers/auth.py`, `routers/resources.py`). `app.include_router()` registers each module's routes so that the server recognizes their URL endpoints.

| Router Module | Responsibility |
| :--- | :--- |
| `auth.router` | User login (`/login`) and self-registration (`/register`) |
| `users.router` | Listing, viewing, and updating user accounts |
| `clusters.router` | Managing organizational clusters (GOLF, ECHO, DELTA, etc.) |
| `locations.router` | Managing office locations (Bangalore, Chennai, Pune, etc.) |
| `skills.router` | Technical skills catalog and categories |
| `resources.router` | Employee resource profiles, allocation status, and searches |
| `certifications.router`| Professional certifications tracking |
| `training.router` | Skill trainings, enrollment, and completion dates |
| `dashboard.router` | Management dashboards, KPI stats, and chart data |

---

## Root Endpoint (`root`)

```python
@app.get("/")
def root():
    return {"message": "Welcome to Resource Portal API"}
```

### What it does
Handles simple `GET` requests to the root URL (`/`) and returns a lightweight JSON greeting message.

### Why it's needed
Acts as a simple health check or sanity endpoint. When deploying or debugging, visiting `http://localhost:8000/` in a web browser instantly verifies that the web server is running properly.

- **HTTP Method & Path**: `GET /`
- **Parameters**: None.
- **Returns**: `dict` containing `{"message": "Welcome to Resource Portal API"}`.

---

## Key Concepts

- **Lifespan Handlers**: Modern FastAPI applications use `@contextlib.asynccontextmanager` on a `lifespan` function instead of legacy `@app.on_event("startup")` and `@app.on_event("shutdown")` decorators. This provides cleaner resource management and error handling across application startup and teardown.
- **Middleware**: Code that runs globally on every request before it reaches an endpoint, and on every response before it is sent back to the client.
- **CORS (Cross-Origin Resource Sharing)**: A browser security mechanism that uses HTTP headers to tell the browser whether a web application running at one origin has permission to access resources from a server at a different origin.
- **Modular Routing (`APIRouter`)**: Breaking down endpoints into separate domain files and attaching them to the main app via `app.include_router()`. Keeps the codebase maintainable, testable, and clean.

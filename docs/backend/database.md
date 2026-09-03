# Database Connection & Session Management (`database.py`)

## Overview

The [`database.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/database.py) file establishes and manages all connections between the Python application and the relational database via SQLAlchemy.

Think of [`database.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/database.py) like the **plumbing and tap system of a building**:
- The **`engine`** is the main water pipeline connecting the building to the municipal water reservoir (the database).
- The **`SessionLocal`** is the valve or tap mechanism capable of dispensing clean water on demand.
- The **`get_db()`** function is a person turning on the tap when an API request arrives to fetch or store data, and guaranteeing the tap is turned off tightly (`db.close()`) once the request finishes so no water (database connections) leaks out.
- The **`Base`** class is the foundation blueprint that all database tables build upon.

---

## Imports and Dependencies

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from resourceportal.config import settings
```

Here is why each import is needed:

- **[`create_engine`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/database.py#L1)**: Core SQLAlchemy function that sets up the database engine. It manages connection pooling, dialect translation (converting Python SQL expressions into SQLite or PostgreSQL syntax), and low-level communication.
- **[`declarative_base`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/database.py#L2)**: Factory function that returns a base class. When your Python models (like `User` or `Resource`) inherit from this class, SQLAlchemy automatically maps them to database tables.
- **[`sessionmaker`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/database.py#L3)**: A factory for creating new `Session` objects. Sessions are the workspace where you stage database queries and transactions.
- **[`settings`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/config.py#L11)**: The application configuration singleton, imported to obtain `DATABASE_URL`.

---

## Database Engine Configuration (`engine`)

```python
engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)
```

### What it does
Creates the central [`engine`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/database.py#L7-L9) object that points to the database specified by `settings.DATABASE_URL`.

### Why it's needed
All database queries, schema migrations, and transactions rely on an underlying connection engine.

### Why `check_same_thread: False`?
By default, SQLite restricts connection usage to the single thread that created it to prevent multithreading issues. However, FastAPI is an asynchronous, multi-threaded framework where different worker threads might handle parts of the same request or concurrent requests. 
- Setting `connect_args={"check_same_thread": False}` allows SQLite to interact safely across multiple threads in FastAPI.
- Notice the conditional check `if "sqlite" in settings.DATABASE_URL else {}`: If you switch to PostgreSQL or MySQL in production, this argument is omitted automatically.

---

## Session Factory (`SessionLocal`)

```python
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### What it does
Creates a customized session class called [`SessionLocal`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/database.py#L10). Calling `SessionLocal()` instantiates an individual database session.

### Why it's needed
In database programming, you don't use raw connections directly. You use **sessions** to track changes, run queries, and wrap operations inside transactions.

### Configuration Parameters Explained
- **`autocommit=False`**: Prevents automatic commits. You must explicitly call `db.commit()` when you want your changes saved. This ensures database transactions remain atomic (either all changes succeed, or none do).
- **`autoflush=False`**: Prevents SQLAlchemy from sending pending changes to the database before every query is executed unless explicitly instructed.
- **`bind=engine`**: Connects all sessions created by this factory to our configured database engine.

---

## Declarative Base (`Base`)

```python
Base = declarative_base()
```

### What it does
Creates the base class [`Base`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/database/database.py#L12) that all database model classes inherit from.

### Why it's needed
SQLAlchemy uses the **Declarative System**. Instead of writing raw `CREATE TABLE` SQL statements, you define Python classes:

```python
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String)
```

`Base` maintains a registry of all such classes and their columns, which allows `Base.metadata.create_all(bind=engine)` to create all tables with a single command.

---

## Database Dependency (`get_db`)

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### What it does
A generator function that creates a new database session, yields it to an endpoint handler, and guarantees the session is closed once the request is complete.

### Why it's needed
Without proper session lifecycle management, database connections can remain hanging open indefinitely (a "connection leak"), eventually exhausting the database connection pool and crashing the server.

### How it works step-by-step
1. **Instantiate**: `db = SessionLocal()` opens a fresh database session for the incoming HTTP request.
2. **Yield**: `yield db` temporarily pauses execution and hands the `db` session to the FastAPI endpoint (via `Depends(get_db)`).
3. **Execute Route**: The endpoint queries or modifies data using `db`.
4. **Cleanup (`finally`)**: Regardless of whether the route executed successfully or crashed with an unhandled exception, Python's `try...finally` block guarantees that `db.close()` runs, safely returning the database connection to the pool.

- **Parameters**: None.
- **Returns**: Yields a SQLAlchemy `Session` instance.

---

## Key Concepts

- **ORM (Object-Relational Mapping)**: A technique that lets you query and manipulate data from a database using object-oriented Python code instead of writing raw SQL strings.
- **Database Session**: An active conversation between the application and the database. It records changes, coordinates SQL queries, and handles rollback if an error occurs.
- **Connection Leak**: A critical bug where database connections are opened but never closed, eventually consuming all available connection slots and causing the server to reject new requests.
- **Generators & `yield` in FastAPI Dependencies**: FastAPI uses generator functions with `yield` to implement setup and teardown logic around HTTP requests. Code before `yield` runs before the endpoint; code after `yield` (or inside `finally`) runs after the response is sent.

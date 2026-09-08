# Database Population (`population.py`)

This file provides tools to automatically insert starter data (often called "seed data") into the database. It also provides a simple way to view the data stored in any table via a web request.

## Imports Explained

- `APIRouter, Depends, HTTPException` from `fastapi`: Tools to create web endpoints (URLs you can visit), handle dependencies, and return error messages.
- `Session` from `sqlalchemy.orm`: Represents a live "conversation" or connection with the database.
- `SessionLocal` from `.database`: A custom factory that creates new database sessions for our app.
- `User, Resource, Cluster, ...` from `.models`: Imports all the database tables we defined in the `models.py` file.
- `get_password_hash` from `.services.auth_service`: A security function used to scramble passwords before saving them, so they aren't stored in plain text.

## Functions

### `get_db()`
- **What it does**: Creates and manages a database connection.
- **Why it's needed**: Whenever the application needs to talk to the database, it needs an open connection. This function opens it, lets the app use it, and safely closes it afterward.
- **How it works**: Uses the `yield` keyword, which pauses the function, hands the database session to the requester, and resumes to close the database once the requester is done. (This is called a Context Manager).

### `populate_database()`
- **What it does**: Checks if the database tables are empty, and if so, fills them with sample data.
- **Why it's needed**: When setting up the application for the first time, developers need sample users, locations, and skills to test the app without having to type them all in manually.
- **How it works**:
  1. It opens a database session (`db = SessionLocal()`).
  2. For each table (like `Cluster`), it checks `db.query(Cluster).count() == 0` (is the table empty?).
  3. If empty, it creates a list of Python objects representing the rows (e.g., `Cluster(name="Oracle", ...)`).
  4. It adds them all to the database using `db.add_all()`.
  5. It saves the changes permanently using `db.commit()`.

### `get_table_data(table_name: str, db: Session)`
- **What it does**: A web endpoint (`GET /data/{table_name}`) that fetches and returns all the data inside a requested table.
- **Why it's needed**: Provides a quick way to inspect what's currently saved in the database without needing a dedicated database viewer tool.
- **How it works**:
  - It looks up the requested `table_name` in a dictionary (`TABLE_MODELS`) to find the corresponding Python class.
  - If the table doesn't exist, it throws a 404 Error (`HTTPException`).
  - If it exists, it fetches all records and formats them into a neat list of dictionaries (JSON) to send back to the user.

## Code Snippet Highlight: Password Hashing
When creating the initial admin user, the code doesn't store "admin123" directly:

```python
User(
    username="admin",
    email="admin@company.com",
    password_hash=get_password_hash("admin123"),
    role="ADMIN",
    resource_id=None,
    is_active=1
)
```
- **Why it matters**: If a hacker ever accessed the database, they wouldn't see the real passwords, only a mathematically scrambled string.

## Key Concepts

- **Database Seeding**: The practice of writing a script (like this one) to populate a database with an initial set of data.
- **Dependency Injection (`Depends`)**: FastAPI uses `Depends(get_db)` to automatically run `get_db()`, grab the database session, and inject it into the `get_table_data` function. The developer doesn't have to manually open and close the database connection every time the endpoint is called.
- **Routing (`APIRouter`)**: A way to group related URLs together. By giving the router a `prefix="/data"`, the endpoint automatically becomes `/data/{table_name}`.
- **Transactions (`commit`)**: Changes made to a database aren't permanent until they are "committed." If something goes wrong halfway through adding data, the system can cancel (or "rollback") the transaction so no partial data is saved.

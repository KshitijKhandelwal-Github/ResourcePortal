# Application Configuration (`config.py`)

## Overview

The [`config.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/config.py) file is responsible for managing all application settings and environment variables for the Resource Management Portal.

Think of [`config.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/config.py) like the **control panel or fuse box of a house**:
- Instead of hardcoding critical values (like your secret security keys or database connection addresses) randomly across dozens of Python files, you centralize them in one secure place.
- If you move from a local laptop to a production cloud server, you don't rewrite your code—you simply change the values in your `.env` file or environment variables, and [`config.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/config.py) automatically reads and validates them.

---

## Imports and Dependencies

```python
from pydantic_settings import BaseSettings
```

Here is why this import is needed:

- **[`BaseSettings`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/config.py#L1)**: A specialized class provided by the `pydantic-settings` library. It extends Pydantic's powerful data validation system to read settings from environment variables, system variables, or `.env` files, converting text values into typed Python variables (like integers, strings, or booleans) automatically.

---

## Classes and Settings Schema

### `Settings` Class

```python
class Settings(BaseSettings):
    SECRET_KEY: str
    DATABASE_URL: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = ".env"
```

### What it does
The [`Settings`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/config.py#L3-L9) class defines the blueprint of all required and optional configuration parameters needed to run the backend application.

### Why it's needed
Without configuration management, sensitive secrets like cryptographic keys might accidentally be committed to public code repositories, or an application might crash silently if a database URL is missing or malformed. Pydantic guarantees that if a required setting (like `SECRET_KEY`) is missing, the application will fail fast at startup with a clear error message explaining what is missing.

### Fields and Attributes

| Attribute | Data Type | Default Value | Description & Purpose |
| :--- | :--- | :--- | :--- |
| `SECRET_KEY` | `str` | *None (Required)* | A high-entropy secret string used to cryptographically sign and verify JSON Web Tokens (JWTs). Keeps authentication tokens tamper-proof. |
| `DATABASE_URL` | `str` | *None (Required)* | The connection string URI directing SQLAlchemy to the database (e.g. `sqlite:///./resource_portal.db` or a PostgreSQL URI like `postgresql://user:pass@localhost:5432/portal`). |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `int` | `1440` (24 Hours) | The duration in minutes for which a generated JWT access token remains valid before the user must log in again. |

### The Inner `Config` Class
- **`env_file = ".env"`**: Tells Pydantic to look for a file named `.env` in the project root directory and read key-value pairs from it if they are not already set in the operating system environment.

---

## Global Settings Instance (`settings`)

```python
settings = Settings()
```

### What it does
Creates a single, globally accessible instance of the [`Settings`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/config.py#L3-L9) class named [`settings`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/config.py#L11).

### Why it's needed
This implements the **Singleton Pattern**. Rather than having each file reload and re-parse the `.env` file from disk repeatedly, the configuration is parsed once when [`config.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/config.py) is imported. Other modules simply import the initialized instance:

```python
from resourceportal.config import settings

# Access settings directly:
print(settings.DATABASE_URL)
print(settings.ACCESS_TOKEN_EXPIRE_MINUTES)
```

---

## Key Concepts

- **Twelve-Factor App Methodology**: A software engineering best practice that advises storing configuration in the environment rather than baking it into the application code. This allows the same codebase to run in development, testing, staging, and production environments without code changes.
- **Fail-Fast Validation**: When the application boots, Pydantic checks all environment variables against their declared types. If `SECRET_KEY` is not provided in your `.env` file or environment, the server immediately stops with a helpful `ValidationError` rather than crashing unexpectedly hours later during user login.
- **Singleton Pattern**: A software design pattern where a class has only one instance throughout the lifetime of the program, providing a unified global point of access.
- **Type Coercion**: Environment variables are always read as raw text (strings) from the operating system. Pydantic automatically converts numeric strings like `"1440"` into Python integers (`1440`), preventing subtle type bugs in calculation logic.

# Authentication & Cryptography Service (`auth_service.py`)

## Overview

The [`auth_service.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/services/auth_service.py) file provides the cryptographic security foundation for the application. It contains helper functions for password hashing, password verification, and generating JSON Web Tokens (JWTs).

Think of [`auth_service.py`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/services/auth_service.py) like a **locksmith and security badge printing office**:
- It doesn't decide *who* is allowed into a room (that is the job of routers and permission dependencies).
- Instead, it creates **tamper-proof keys and digital ID badges** (JWT tokens).
- It also takes secret passwords and transforms them into irreversible cryptographic locks (password hashes) so that even if an attacker steals the database, they cannot read users' real passwords.

---

## Imports and Dependencies

```python
import jwt
from datetime import datetime, timedelta, timezone
from pwdlib import PasswordHash
from resourceportal.config import settings
from typing import Optional
```

Here is why each import is needed:

- **`jwt` (PyJWT)**: A popular library used for encoding and decoding JSON Web Tokens. It signs the payload with a secret key using hashing algorithms (like HS256) so clients cannot alter the token content without detection.
- **`datetime`, `timedelta`, `timezone`**: Standard library tools used to compute accurate, timezone-aware expiration timestamps (in UTC) for generated access tokens.
- **[`PasswordHash`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/services/auth_service.py#L3)**: From `pwdlib`, a modern password-hashing library that implements current industry recommendations (such as Argon2 and bcrypt) with automatic salting.
- **[`settings`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/config.py#L11)**: Application configuration providing `SECRET_KEY` and default `ACCESS_TOKEN_EXPIRE_MINUTES`.
- **`typing.Optional`**: Type hinting used to declare that an argument may either be of a specified type (e.g. `timedelta`) or `None`.

---

## Password Hasher (`hasher`)

```python
hasher = PasswordHash.recommended()
```

### What it does
Initializes a [`PasswordHash`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/src/resourceportal/services/auth_service.py#L7) instance using security-vetted defaults.

### Why it's needed
Using `PasswordHash.recommended()` ensures that passwords are processed using modern, compute-hardened algorithms with built-in random salting, protecting against dictionary and rainbow table attacks.

---

## Functions

### 1. `verify_password`

```python
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hasher.verify(plain_password, hashed_password)
```

- **What it does**: Takes the plain text password typed into a login form by a user and checks if it matches the stored cryptographic hash in the database.
- **Why it's needed**: Cryptographic password hashes are **one-way functions**; you cannot decrypt or reverse a hash back to the original password. Instead, you verify passwords by hashing the candidate password with the salt embedded in the stored hash and comparing the results.
- **Parameters**:
  - `plain_password` (`str`): The plain text password submitted by the user.
  - `hashed_password` (`str`): The stored password hash from the database.
- **Returns**: `bool` - `True` if the password matches the hash, `False` otherwise.

---

### 2. `get_password_hash`

```python
def get_password_hash(password: str) -> str:
    return hasher.hash(password)
```

- **What it does**: Takes a plain text password (such as when a user registers or is created) and converts it into a secure, salted hash string.
- **Why it's needed**: Storing plain text passwords in a database is one of the most critical security vulnerabilities in software engineering. Hashing ensures that even database administrators or compromised database dumps cannot reveal actual passwords.
- **Parameters**:
  - `password` (`str`): The plain text password to hash.
- **Returns**: `str` - The secure hashed representation (e.g., `$argon2id$v=19$m=65536...`).

---

### 3. `create_access_token`

```python
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt
```

- **What it does**: Creates a signed JSON Web Token (JWT) encoding identity information (such as username in the `sub` claim) along with a specific expiration timestamp.
- **Why it's needed**: Modern web applications use **stateless token-based authentication**. After logging in, the client receives this token and includes it in subsequent HTTP requests inside the `Authorization: Bearer <token>` header. The server can verify the user's identity without querying a session database on every single request.
- **Parameters**:
  - `data` (`dict`): The payload dictionary to encode into the token (e.g., `{"sub": "admin"}`).
  - `expires_delta` (`Optional[timedelta]`, default `None`): Optional custom expiration duration. If omitted, defaults to `settings.ACCESS_TOKEN_EXPIRE_MINUTES` (typically 1440 minutes / 24 hours).
- **Returns**: `str` - The encoded, cryptographically signed JWT string.
- **Step-by-Step Logic**:
  1. **Copy Data**: `to_encode = data.copy()` makes a shallow copy so the caller's original dictionary is not accidentally mutated.
  2. **Calculate Expiration Time**: Computes the current time in UTC using `datetime.now(timezone.utc)` and adds either the custom `expires_delta` or the application's default token lifespan.
  3. **Add `exp` Claim**: Adds the `"exp"` (expiration) claim to the dictionary. JWT libraries automatically recognize `"exp"` to invalidate expired tokens.
  4. **Sign and Encode**: Calls `jwt.encode()` using the secret key (`settings.SECRET_KEY`) and the HMAC-SHA256 (`HS256`) symmetric signing algorithm.
  5. **Return Token**: Returns the compact three-part string (`header.payload.signature`).

---

## Key Concepts

- **One-Way Hashing vs. Encryption**: 
  - *Encryption* is two-way: you can decrypt cipher text back into plain text if you possess the decryption key.
  - *Hashing* is one-way: mathematically designed so you cannot reverse the output back into the original input. This is why passwords should always be hashed, never encrypted.
- **Salting**: Adding a unique, random string of bytes to each password before hashing it. This ensures that two users with the exact same password ("password123") will have completely different hashes, preventing rainbow table attacks.
- **JWT (JSON Web Token)**: A compact format consisting of three parts separated by dots (`.`):
  1. *Header*: Specifies the algorithm (e.g., HS256).
  2. *Payload*: Contains claims (e.g., `sub`: username, `exp`: expiration timestamp).
  3. *Signature*: A cryptographic hash of the header, payload, and server's secret key. If a user tries to alter the payload (e.g., changing their username to "admin"), the signature becomes invalid and the server rejects it.
- **Timezone Awareness (UTC)**: Always calculating expiration timestamps using UTC (`timezone.utc`) avoids catastrophic bugs caused by daylight saving time shifts or server clock differences across global hosting providers.

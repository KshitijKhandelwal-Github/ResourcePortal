# Technical Documentation: `frontend/src/api/users.js`

## 1. Overview & Purpose

`users.js` provides client-side API helper functions for user management. It enables fetching the roster of system login accounts, retrieving the currently authenticated user's profile details (`/users/me`), and modifying user attributes such as role or account active status.

### Analogy
Think of this as the **security badging office**. While resources represent employees and their skills on project assignments, `users.js` deals with the computer login accounts, passwords, and security clearance roles (`admin`, `senior_associate`, `user`).

---

## 2. Imports & Dependencies

```javascript
import client from './client';
```

- **`client`**: The Axios HTTP client instance pre-configured with base URL and JWT Bearer token authentication.

---

## 3. Function Explanations & API Endpoints

### 1. `getUsers()`
- **HTTP Method & Path**: `GET /users`
- **What it does**: Fetches the list of all registered system user accounts in the database.
- **Why it's needed**: Renders the User Management table in `AdminPage` where administrators can inspect account emails, roles, and active statuses.
- **Parameters**: None.
- **Returns**: A Promise resolving to an array of user objects:
  ```json
  [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@portal.com",
      "role": "admin",
      "cluster_id": null,
      "is_active": true
    }
  ]
  ```
- **Permissions**: Restricted to users with the `admin` role.

### 2. `getCurrentUser()`
- **HTTP Method & Path**: `GET /users/me`
- **What it does**: Inspects the incoming JWT token from headers and returns the account information of whoever is currently logged in.
- **Why it's needed**: Used when the application initializes or refreshes to verify that the stored JWT token is still valid and fetch the latest role information.
- **Parameters**: None.
- **Returns**: A Promise resolving to the current user's object.

### 3. `updateUser(id, data)`
- **HTTP Method & Path**: `PUT /users/:id`
- **What it does**: Modifies an existing user's attributes (such as changing role or toggling active status).
- **Why it's needed**: Enables administrators to promote a user to `senior_associate`, change their cluster assignment, or deactivate an account when an employee leaves.
- **Parameters**:
  - `id` (*Number*): The user's account ID.
  - `data` (*Object*):
    - `email` (*String, optional*)
    - `role` (*String, optional*): `"admin"` | `"senior_associate"` | `"user"`
    - `cluster_id` (*Number, optional*)
    - `is_active` (*Boolean, optional*)
- **Returns**: A Promise resolving to the updated user object.
- **Permissions**: Restricted to users with the `admin` role.

---

## 4. Key Concepts for Beginners

- **Separation of Concerns: Users vs. Resources**:
  - A **User** represents a login identity (credentials, JWT tokens, RBAC authorization).
  - A **Resource** represents an employee profile (work experience, skills, training, location).
  - They are linked via an optional `user_id` foreign key on the Resource model, allowing an employee to have an account while keeping employee master records independent of software user access.


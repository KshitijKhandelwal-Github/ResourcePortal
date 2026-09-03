# Authentication API Services: `api/auth.js`

Source File: [`frontend/src/api/auth.js`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/auth.js)

---

## 1. Overview & Purpose

The [`api/auth.js`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/auth.js) file encapsulates backend API endpoints related to **user authentication and user registration**. 

Separating network calls into dedicated service modules promotes separation of concerns: React UI components focus on user input and layout, while API modules focus on URL routing, payload formatting, and HTTP transport.

> **Analogy:** Think of `api/auth.js` as the passport control desk's official handbook. It contains the exact standard forms you must submit when verifying your identity (`loginUser`) or applying for new citizenship (`registerUser`).

---

## 2. Imports & Dependencies

```javascript
import client from './client';
```

* **[`client`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/client.js)**: The custom configured Axios instance with base URL `http://localhost:8000/api/v1` and automatic request/response interceptors.

---

## 3. Function Explanations & Specifications

### 1. `loginUser(username, password)`
```javascript
export const loginUser = (username, password) =>
  client.post('/auth/login', { username, password });
```

* **What it does:** Sends an HTTP `POST` request to `/auth/login` containing the credentials entered by the user.
* **Why it's needed:** Validates username/password against the backend database and receives an access token in return.
* **Parameters:**
  * `username` (`string`): The user's registered username.
  * `password` (`string`): The user's plaintext password.
* **Returns:** A Promise that resolves to an Axios response containing:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "is_active": true
    }
  }
  ```

---

### 2. `registerUser(data)`
```javascript
export const registerUser = (data) =>
  client.post('/auth/register', data);
```

* **What it does:** Sends an HTTP `POST` request to `/auth/register` with new user details.
* **Why it's needed:** Used primarily by administrators on the Administration page to create new user accounts with specific roles (`user`, `senior_associate`, `admin`).
* **Parameters:**
  * `data` (`object`): User payload containing:
    * `username` (`string`): Desired username
    * `email` (`string`): User email address
    * `password` (`string`): Initial account password
    * `role` (`string`): Assigned role (`admin`, `senior_associate`, or `user`)
* **Returns:** A Promise resolving to the newly created user record.

---

## 4. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **API Layer Pattern** | Grouping network calls in helper files instead of writing `axios.post` directly inside UI components. |
| **Async / Await & Promises** | Mechanisms for handling asynchronous operations that take time to complete across the network. |
| **HTTP POST Method** | The HTTP method designed for sending data to the server to create a resource or submit credentials securely in the request body. |
| **Payload** | The actual data body transmitted within an HTTP request. |

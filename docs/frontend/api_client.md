# HTTP Client & Interceptors: `api/client.js`

Source File: [`frontend/src/api/client.js`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/client.js)

---

## 1. Overview & Purpose

The [`api/client.js`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/client.js) file creates and exports a centralized, pre-configured **Axios HTTP client** for communicating with the backend REST API.

Rather than making raw `fetch()` calls or unconfigured `axios` calls across dozens of components, all backend requests pass through this single client. It automatically injects the security token into outgoing headers and handles session expiry (401 Unauthorized errors) globally.

> **Analogy:** Think of `client.js` as an executive assistant who mails your letters. Before any letter leaves the office (Request), the assistant attaches an official company security badge (`Authorization: Bearer <token>`). If the mail room sends a letter back saying "Security clearance revoked" (Response 401), the assistant immediately revokes your pass and escorts you to the security desk (`/login`).

---

## 2. Imports & Dependencies

```javascript
import axios from 'axios';
```

* **`axios`**: A widely-used promise-based HTTP client for the browser and node.js, offering request/response interception, automatic JSON conversion, and error handling.

---

## 3. Code Breakdown & Step-by-Step Execution

### 1. Client Configuration
```javascript
const client = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
```
* **`baseURL`**: The root URL prefix for all backend endpoints. When calling `client.get('/resources')`, Axios resolves this to `http://localhost:8000/api/v1/resources`.
* **`headers`**: Specifies standard JSON request payload headers.

---

### 2. Request Interceptor (Attaching JWT Tokens)
```javascript
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### How It Works:
1. Every time any API function initiates an HTTP request, this interceptor runs **before** the request is dispatched over the network.
2. It looks into `localStorage` for a stored `'token'`.
3. If a token exists, it sets the `Authorization` header to `Bearer <token>`.
4. Returns the modified `config` object to proceed with the request.

---

### 3. Response Interceptor (Handling Expired Sessions & Errors)
```javascript
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### How It Works:
1. **Success Handler**: When the backend responds with a 2xx HTTP status, it simply passes the response forward untouched.
2. **Error Handler**:
   - Checks if an HTTP response was received and if the status is **401 Unauthorized** (e.g. invalid token, expired session, or revoked credentials).
   - If status is 401, it wipes out `'token'` and `'user'` from `localStorage`.
   - Forces an immediate full-page browser redirect to `/login`.
   - Still returns `Promise.reject(error)` so calling code can catch or clean up if needed.

---

## 4. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **Axios Instance** | A customized Axios copy with its own dedicated base URL, default headers, and timeouts. |
| **Axios Interceptors** | Middleware functions that sit between your application code and the network, inspecting or mutating requests and responses on the fly. |
| **Bearer Token Authentication** | Standard security protocol where an encrypted token is sent in the `Authorization` header as `Bearer <token>`. |
| **HTTP 401 Unauthorized** | The standard HTTP status code indicating that access is denied because valid authentication credentials are missing or expired. |
| **`Promise.reject`** | A JavaScript promise utility that creates a rejected promise, allowing downstream `catch` blocks or `try/catch` clauses to handle the error. |

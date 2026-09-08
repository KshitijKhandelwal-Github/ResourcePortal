# Technical Documentation: `frontend/src/api/clusters.js`

## 1. Overview & Purpose

`clusters.js` is the frontend API client module responsible for managing business cluster data (e.g., "GOLF", "ECHO", "DELTA", etc.). It abstracts network calls to the backend's `/clusters` REST endpoints, providing clean JavaScript functions for fetching, creating, updating, and deleting clusters.

### Analogy
Think of this file as a **telephone speed dial** for the Clusters department in the backend warehouse. Instead of manually dialing IP addresses, headers, and HTTP verbs, UI components like `AdminPage` or `ResourceFormPage` just press one button like `getClusters()`.

---

## 2. Imports & Dependencies

```javascript
import client from './client';
```

- **`client`**: The pre-configured Axios HTTP client instance from `./client.js`. It already contains the backend base URL (`http://localhost:8000/api/v1`), automatic JSON headers, and request interceptors that attach the user's JWT authorization token.

---

## 3. Function Explanations & API Endpoints

### 1. `getClusters()`
- **HTTP Method & Path**: `GET /clusters`
- **What it does**: Retrieves the list of all business clusters defined in the database.
- **Why it's needed**: Used by dropdown filters in the Dashboard, the Resource Form when creating/editing an employee, and the Admin Page for management.
- **Parameters**: None.
- **Returns**: A Promise resolving to the Axios response object containing an array of cluster objects: `[{ id: 1, name: "GOLF", description: "GOLF Cluster" }, ...]`.

### 2. `createCluster(data)`
- **HTTP Method & Path**: `POST /clusters`
- **What it does**: Sends a new cluster payload to be saved in the database.
- **Why it's needed**: Allows system administrators to define new organizational clusters as company teams expand.
- **Parameters**:
  - `data` (*Object*): `{ name: string, description?: string }`.
- **Returns**: A Promise resolving to the newly created cluster record with its assigned `id`.
- **Permissions**: Requires Admin role.

### 3. `updateCluster(id, data)`
- **HTTP Method & Path**: `PUT /clusters/:id`
- **What it does**: Updates the name or description of an existing cluster by its numeric ID.
- **Why it's needed**: Allows administrators to rename clusters or revise descriptions.
- **Parameters**:
  - `id` (*Number/String*): The unique primary key identifier of the cluster.
  - `data` (*Object*): `{ name?: string, description?: string }`.
- **Returns**: A Promise resolving to the updated cluster object.

### 4. `deleteCluster(id)`
- **HTTP Method & Path**: `DELETE /clusters/:id`
- **What it does**: Deletes a cluster record from the database.
- **Why it's needed**: Allows administrators to retire or clean up obsolete clusters.
- **Parameters**:
  - `id` (*Number/String*): The ID of the cluster to remove.
- **Returns**: A Promise resolving to an HTTP 204 No Content response.

---

## 4. Key Concepts for Beginners

- **RESTful Conventions**: Following standard HTTP verbs (`GET` for reading, `POST` for creating, `PUT` for full update, `DELETE` for removal).
- **Promises & Async/Await**: Every function returns a JavaScript `Promise`. UI components consume them using `async/await` to handle asynchronous network delays gracefully.


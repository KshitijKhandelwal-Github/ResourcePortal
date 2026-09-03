# Resource CRUD API Services: `api/resources.js`

Source File: [`frontend/src/api/resources.js`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/resources.js)

---

## 1. Overview & Purpose

The [`api/resources.js`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/resources.js) module defines the **CRUD (Create, Read, Update, Delete) HTTP operations** for managing employee resource records in the portal.

Every time a user searches for an employee, views an employee profile, registers a new employee, edits details, or removes a resource, the frontend delegates the network request to these helper functions.

> **Analogy:** Think of `api/resources.js` like the filing cabinet clerk in Human Resources. You give the clerk an order—"Show me all Java developers" ([`getResources`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/resources.js)), "Fetch file EMP101" ([`getResource`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/resources.js)), "Add this new hire" ([`createResource`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/resources.js)), "Update this person's address" ([`updateResource`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/resources.js)), or "Shred this file" ([`deleteResource`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/resources.js))—and the clerk handles retrieval from the database.

---

## 2. Imports & Dependencies

```javascript
import client from './client';
```

* **[`client`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/client.js)**: The central Axios instance configured with base URL `http://localhost:8000/api/v1` and automatic JWT auth header injection.

---

## 3. Function Explanations & Specifications

### 1. `getResources(params = {})`
```javascript
export const getResources = (params = {}) =>
  client.get('/resources', { params });
```
* **What it does:** Fetches a paginated, filtered list of resource records via `GET /resources`.
* **Parameters:**
  * `params` (`object`, default `{}`): Query parameters for filtering and pagination. Supported keys include:
    * `skip` (`number`): Offset for pagination.
    * `limit` (`number`): Number of records per page.
    * `search` (`string`): Substring search for name or employee ID.
    * `cluster_id` (`number|string`): Filter by cluster ID.
    * `skill_id` (`number|string`): Filter by primary skill ID.
    * `location_id` (`number|string`): Filter by location ID.
    * `availability_status` (`string`): Filter by status ('Available', 'Allocated', etc.).
    * `min_experience`, `max_experience` (`number`): Experience range filter.
* **Returns:** Promise resolving to `{ items: [...], total: number }`.

---

### 2. `getResource(employeeId)`
```javascript
export const getResource = (employeeId) =>
  client.get(`/resources/${employeeId}`);
```
* **What it does:** Fetches detailed information for a single resource by employee ID via `GET /resources/{employeeId}`.
* **Parameters:**
  * `employeeId` (`string`): The unique identifier of the employee (e.g. `'EMP001'`).
* **Returns:** Promise resolving to the full resource profile object, including linked cluster, skills, and locations.

---

### 3. `createResource(data)`
```javascript
export const createResource = (data) =>
  client.post('/resources', data);
```
* **What it does:** Registers a brand new resource in the database via `POST /resources`.
* **Parameters:**
  * `data` (`object`): Resource fields including `employee_id`, `name`, `email`, `cluster_id`, `designation`, `years_of_experience`, `current_location_id`, `preferred_location_id`, `availability_status`, `primary_skill_id`, `secondary_skill_ids`.
* **Returns:** Promise resolving to the newly created resource record.

---

### 4. `updateResource(employeeId, data)`
```javascript
export const updateResource = (employeeId, data) =>
  client.put(`/resources/${employeeId}`, data);
```
* **What it does:** Modifies attributes of an existing resource record via `PUT /resources/{employeeId}`.
* **Parameters:**
  * `employeeId` (`string`): The identifier of the resource being modified.
  * `data` (`object`): Updated field values.
* **Returns:** Promise resolving to the updated resource record.

---

### 5. `deleteResource(employeeId)`
```javascript
export const deleteResource = (employeeId) =>
  client.delete(`/resources/${employeeId}`);
```
* **What it does:** Permanently deletes a resource from the portal via `DELETE /resources/{employeeId}`.
* **Parameters:**
  * `employeeId` (`string`): The identifier of the resource to be deleted.
* **Returns:** Promise resolving to confirmation status.

---

## 4. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **RESTful API Design** | Architectural standard using standard HTTP verbs: `GET` (read), `POST` (create), `PUT` (replace/update), and `DELETE` (remove). |
| **Query Parameters** | Key-value pairs appended to URLs after `?` (e.g. `?limit=15&skip=0&search=john`) used for filtering and pagination. |
| **Path Parameters** | Dynamic segments built into the URL path (e.g. `/resources/EMP001`) that specify a target entity by ID. |
| **Pagination** | Splitting large datasets into digestible chunks (pages) using `skip` and `limit` to prevent slow page load times. |

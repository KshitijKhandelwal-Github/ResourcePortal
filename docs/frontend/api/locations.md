# Technical Documentation: `frontend/src/api/locations.js`

## 1. Overview & Purpose

`locations.js` provides client-side API helper functions for interacting with office location data (e.g., Bangalore, Hyderabad, Chennai, Pune, Mumbai). It manages standard CRUD operations against the backend `/locations` endpoints.

### Analogy
Imagine a corporate directory of office campuses. `locations.js` is the **front-desk directory service** that lets forms and admin panels look up available offices or add a new office branch.

---

## 2. Imports & Dependencies

```javascript
import client from './client';
```

- **`client`**: The central Axios client from `./client.js` with base URL and JWT token headers automatically attached.

---

## 3. Function Explanations & API Endpoints

### 1. `getLocations()`
- **HTTP Method & Path**: `GET /locations`
- **What it does**: Fetches the complete list of company office locations.
- **Why it's needed**: Populates "Current Location" and "Preferred Location" dropdown menus across Resource creation/edit forms, filter bars in the Dashboard and Resources list, and the Admin Page location table.
- **Parameters**: None.
- **Returns**: A Promise resolving to an array of location objects: `[{ id: 1, city: "Bangalore", state: "Karnataka", country: "India" }, ...]`.

### 2. `createLocation(data)`
- **HTTP Method & Path**: `POST /locations`
- **What it does**: Registers a new geographic office location.
- **Why it's needed**: Enables administrators to add new office cities or branch offices.
- **Parameters**:
  - `data` (*Object*): `{ city: string, state: string, country: string }`.
- **Returns**: A Promise resolving to the newly created location record with its assigned `id`.
- **Permissions**: Requires Admin role.

### 3. `updateLocation(id, data)`
- **HTTP Method & Path**: `PUT /locations/:id`
- **What it does**: Modifies the city, state, or country of an existing location.
- **Why it's needed**: Corrects typos or updates jurisdiction details.
- **Parameters**:
  - `id` (*Number/String*): The location's ID.
  - `data` (*Object*): `{ city?: string, state?: string, country?: string }`.
- **Returns**: A Promise resolving to the updated location object.

### 4. `deleteLocation(id)`
- **HTTP Method & Path**: `DELETE /locations/:id`
- **What it does**: Deletes an office location by ID.
- **Why it's needed**: Enables admins to remove closed or invalid branch locations.
- **Parameters**:
  - `id` (*Number/String*): The location ID to remove.
- **Returns**: A Promise resolving to an HTTP 204 No Content response.

---

## 4. Key Concepts for Beginners

- **Normalized Entities**: Rather than saving free-text strings like `"Bangalore"` repeatedly in every employee row (which causes spelling inconsistencies like `"BLR"`, `"Bangalore"`, `"bengaluru"`), locations are stored as unique IDs referencing this master table.


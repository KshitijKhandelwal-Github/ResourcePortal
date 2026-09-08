# Technical Documentation: `frontend/src/api/skills.js`

## 1. Overview & Purpose

`skills.js` is the API communication module for technical skill catalog operations (e.g., "Python", "React", "DevOps", "AI/ML"). It encapsulates all network calls to the `/skills` backend router.

### Analogy
Think of this as the **master skills menu** in a cafeteria. Before a chef (manager) can assign a skill to a candidate's tray, that skill item must exist on the master menu. This file provides the menu querying and editing tools.

---

## 2. Imports & Dependencies

```javascript
import client from './client';
```

- **`client`**: The configured Axios instance with base URL `http://localhost:8000/api/v1` and automatic Bearer JWT injection.

---

## 3. Function Explanations & API Endpoints

### 1. `getSkills()`
- **HTTP Method & Path**: `GET /skills`
- **What it does**: Retrieves the full catalog of registered technical skills.
- **Why it's needed**: Feeds the primary skill and secondary skill selector dropdowns on `ResourceFormPage`, skill filter chips on `ResourcesPage`, skill assignment modals on `ProfilePage`, and the skills inventory on `AdminPage`.
- **Parameters**: None.
- **Returns**: A Promise resolving to an array of skill objects: `[{ id: 1, name: "Python", category: "Backend" }, ...]`.

### 2. `createSkill(data)`
- **HTTP Method & Path**: `POST /skills`
- **What it does**: Inserts a new technical skill name and category.
- **Why it's needed**: Allows system administrators to expand the technology taxonomy as new frameworks or languages become relevant to client projects.
- **Parameters**:
  - `data` (*Object*): `{ name: string, category: string }`.
- **Returns**: A Promise resolving to the newly created skill.
- **Permissions**: Requires Admin role.

### 3. `updateSkill(id, data)`
- **HTTP Method & Path**: `PUT /skills/:id`
- **What it does**: Updates the title or category of an existing skill.
- **Why it's needed**: Enables admins to recategorize skills (e.g., moving "Docker" from "DevOps" to "Infrastructure") or rename them.
- **Parameters**:
  - `id` (*Number/String*): The skill ID.
  - `data` (*Object*): `{ name?: string, category?: string }`.
- **Returns**: A Promise resolving to the updated skill record.

### 4. `deleteSkill(id)`
- **HTTP Method & Path**: `DELETE /skills/:id`
- **What it does**: Removes a skill from the system.
- **Why it's needed**: Retires obsolete technologies from selection lists.
- **Parameters**:
  - `id` (*Number/String*): The skill ID.
- **Returns**: A Promise resolving to an HTTP 204 No Content response.

---

## 4. Key Concepts for Beginners

- **Categorized Catalogs**: Grouping skills into categories (Backend, Frontend, Cloud/DevOps, Database, Data Science) allows the dashboard and forms to provide structured filtering and analytics.


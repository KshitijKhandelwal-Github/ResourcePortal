# System Administration & Master Data: `AdminPage.jsx`

Source File: [`frontend/src/pages/AdminPage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/AdminPage.jsx)

---

## 1. Overview & Purpose

The [`AdminPage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/AdminPage.jsx) component provides an **all-in-one administration console** restricted exclusively to users with the `admin` role.

It centralizes two primary administrative responsibilities:
1. **User Management**: Creating user accounts, altering permissions/roles (`admin`, `senior_associate`, `user`), and toggling account activation statuses.
2. **Master Data CRUD Management**: Creating, editing, listing, and deleting domain taxonomies—specifically **Clusters**, **Office Locations**, and **Technical Skills**—using an elegant, generic reusable component pattern.

> **Analogy:** Think of `AdminPage` as the backstage control room of a stadium. The stage manager can issue security badges to new staff members (`UsersTab`), build new dressing rooms (`Locations`), add musical instruments to inventory (`Skills`), or reconfigure stage sections (`Clusters`).

---

## 2. Imports & Dependencies

```javascript
import React, { useState, useEffect } from 'react';
import { getUsers, updateUser } from '../api/users';
import { getClusters, createCluster, updateCluster, deleteCluster } from '../api/clusters';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../api/locations';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../api/skills';
import { registerUser } from '../api/auth';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
```

### Explanation of Imports:
* **User Management APIs (`getUsers`, `updateUser`, `registerUser`)**: Operations to fetch, update, and register accounts.
* **Master Data APIs (`clusters`, `locations`, `skills`)**: Standard CRUD functions for each domain entity.
* **UI Primitives ([`Modal`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Modal.jsx), [`Toast`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Toast.jsx), [`LoadingSpinner`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/LoadingSpinner.jsx))**: Reusable modal dialogs, status toasts, and loading indicators.

---

## 3. Architecture & Tab Switching

The main component acts as an orchestrator, switching between 4 functional tabs:

```javascript
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [toast, setToast] = useState(null);

  const tabs = [
    { key: 'users', label: 'Users' },
    { key: 'clusters', label: 'Clusters' },
    { key: 'locations', label: 'Locations' },
    { key: 'skills', label: 'Skills' },
  ];

  return (
    <div>
      {/* Toast Alert Notification */}
      {/* Header and Tab Buttons */}
      {activeTab === 'users' && <UsersTab setToast={setToast} />}
      {activeTab === 'clusters' && <CrudTab entity="cluster" ... />}
      {activeTab === 'locations' && <CrudTab entity="location" ... />}
      {activeTab === 'skills' && <CrudTab entity="skill" ... />}
    </div>
  );
};
```

---

## 4. Sub-Component 1: `UsersTab`

Manages portal login accounts and role assignments:

### Key Functions:
* **`loadUsers()`**: Fetches user accounts from `GET /users`.
* **`handleCreate(e)`**: Submits `registerUser(form)` inside a popup modal to create a new user account.
* **`toggleActive(u)`**: Calls `updateUser(u.id, { is_active: !u.is_active })` to immediately lock or unlock an account.
* **`changeRole(u, role)`**: Modifies an account's role instantly via a table dropdown:
  ```javascript
  <select value={u.role} onChange={e => changeRole(u, e.target.value)}>
    <option value="admin">Admin</option>
    <option value="senior_associate">Senior Associate</option>
    <option value="user">User</option>
  </select>
  ```

---

## 5. Sub-Component 2: Generic `CrudTab` Pattern

Instead of duplicating identical tables, forms, and modals for Clusters, Locations, and Skills, `AdminPage.jsx` implements a **reusable generic CRUD component**:

```javascript
const CrudTab = ({ entity, fetchFn, createFn, updateFn, deleteFn, fields, displayCols, setToast }) => {
  // Generic state management for any entity
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(() => fields.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {}));
  ...
};
```

### Parameters Passed to `CrudTab`:
| Prop | Description |
| :--- | :--- |
| `entity` | Name of the resource being managed (e.g. `'cluster'`, `'location'`, `'skill'`). |
| `fetchFn` | Asynchronous API function to fetch all items. |
| `createFn` | Asynchronous API function to create a new item. |
| `updateFn` | Asynchronous API function to update an item by ID. |
| `deleteFn` | Asynchronous API function to delete an item by ID. |
| `fields` | Array defining form inputs (`[{ key: 'city', label: 'City', required: true }, ...]`). |
| `displayCols` | Array of keys defining which columns appear in the table. |
| `setToast` | Callback to trigger notification alerts. |

### Why This Architecture is Powerful:
Adding an entire new master-data tab (e.g., "Certifications Catalog") takes only **3 lines of JSX** by reusing `<CrudTab />`, eliminating hundreds of lines of boilerplate code.

---

## 6. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **Generic UI Component** | Designing a component that accepts data schemas and function delegates as props, making it capable of managing any entity type. |
| **In-Place Table State Updates** | Triggering API updates directly from table controls (e.g. changing a role dropdown) without forcing the user to navigate to an edit screen. |
| **Tab-Based Navigation** | Using local state (`activeTab`) to switch which sub-view renders on the screen without altering the browser URL. |
| **Dynamic Form Generation** | Generating form `<input>` elements dynamically by mapping over a configuration array (`fields.map(...)`). |
| **Optimistic vs. Refetched Updates** | Invoking `loadUsers()` / `loadItems()` immediately after mutations to ensure the UI always stays in sync with the database. |

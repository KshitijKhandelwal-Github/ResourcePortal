# Workforce Directory & Search: `ResourcesPage.jsx`

Source File: [`frontend/src/pages/ResourcesPage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/ResourcesPage.jsx)

---

## 1. Overview & Purpose

The [`ResourcesPage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/ResourcesPage.jsx) component is the **primary workforce directory** in the Resource Portal.

It allows team leads and administrators to search, filter, paginate, view, and manage employees across the organization. It integrates multi-faceted search criteria (keyword search, cluster, skill, office location, status, and years of experience), supports fast server-side pagination, and enables direct navigation to create, edit, view, or delete resource records.

> **Analogy:** Think of `ResourcesPage` like an e-commerce catalog page (e.g. Amazon search results), but for human talent instead of products. You can search by keywords, filter by category/brand (cluster/skill), filter by price range (experience), flip through pages of results, and click on an item to see the detailed product page.

---

## 2. Imports & Dependencies

```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResources, deleteResource } from '../api/resources';
import { getClusters } from '../api/clusters';
import { getSkills } from '../api/skills';
import { getLocations } from '../api/locations';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
```

### Explanation of Imports:
* **`useCallback`**: React hook that memorizes a function definition between renders so it is not recreated unless its specified dependencies change.
* **`useNavigate`**: Allows programmatic navigation to details (`/resources/:id`), creation (`/resources/new`), and edit (`/resources/:id/edit`) screens.
* **[`api/resources.js`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/resources.js)**: API functions for fetching (`getResources`) and deleting (`deleteResource`).
* **[`useAuth`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx)**: Identifies the active user's permissions (`admin` can delete, `senior_associate` can edit/add).

---

## 3. State Management & Filter Variables

```javascript
const [resources, setResources] = useState([]);
const [total, setTotal] = useState(0);
const [loading, setLoading] = useState(true);
const [toast, setToast] = useState(null);

// Filters
const [search, setSearch] = useState('');
const [clusterId, setClusterId] = useState('');
const [skillId, setSkillId] = useState('');
const [locationId, setLocationId] = useState('');
const [availabilityStatus, setAvailabilityStatus] = useState('');
const [minExp, setMinExp] = useState('');
const [maxExp, setMaxExp] = useState('');

// Filter dropdown datasets
const [clusters, setClusters] = useState([]);
const [skills, setSkills] = useState([]);
const [locations, setLocations] = useState([]);

// Pagination State
const [page, setPage] = useState(0);
const limit = 15;
```

---

## 4. Step-by-Step Logic & Data Flow

### 1. Loading Filter Dropdowns
Runs once on mount:
```javascript
useEffect(() => {
  const loadFilterOptions = async () => {
    try {
      const [c, s, l] = await Promise.all([getClusters(), getSkills(), getLocations()]);
      setClusters(c.data);
      setSkills(s.data);
      setLocations(l.data);
    } catch (err) {
      console.error('Failed to load filter options', err);
    }
  };
  loadFilterOptions();
}, []);
```

### 2. Loading Resources with `useCallback`
```javascript
const loadResources = useCallback(async () => {
  setLoading(true);
  try {
    const params = { skip: page * limit, limit };
    if (search) params.search = search;
    if (clusterId) params.cluster_id = clusterId;
    if (skillId) params.skill_id = skillId;
    if (locationId) params.location_id = locationId;
    if (availabilityStatus) params.availability_status = availabilityStatus;
    if (minExp) params.min_experience = minExp;
    if (maxExp) params.max_experience = maxExp;

    const res = await getResources(params);
    setResources(res.data.items || res.data);
    setTotal(res.data.total || (res.data.items ? res.data.items.length : res.data.length));
  } catch (err) {
    console.error('Failed to load resources', err);
  } finally {
    setLoading(false);
  }
}, [page, search, clusterId, skillId, locationId, availabilityStatus, minExp, maxExp]);

useEffect(() => {
  loadResources();
}, [loadResources]);
```

#### Why use `useCallback`?
Every time `page` or any filter changes, React triggers `loadResources`. By wrapping it in `useCallback` with exact dependencies, `useEffect` can safely track `loadResources` without causing infinite re-rendering loops.

### 3. Deleting a Resource (`handleDelete`)
```javascript
const handleDelete = async (employeeId, name) => {
  if (!window.confirm(`Are you sure you want to delete resource "${name}" (${employeeId})?`)) return;
  try {
    await deleteResource(employeeId);
    setToast({ message: `Resource ${employeeId} deleted`, type: 'success' });
    loadResources();
  } catch (err) {
    setToast({ message: 'Failed to delete resource', type: 'error' });
  }
};
```
* Asks for native browser confirmation to prevent accidental deletion.
* Calls `deleteResource(employeeId)`.
* Triggers a toast alert notification and re-fetches the current page of results.

### 4. Row Click vs. Button Click Event Handling
Clicking anywhere on a row navigates to the detail page:
```javascript
<tr className="clickable" onClick={() => navigate(`/resources/${r.employee_id}`)}>
```
Inside the actions column, buttons stop event propagation so clicking "Edit" or "Delete" doesn't also trigger the row's navigation click:
```javascript
<td onClick={e => e.stopPropagation()}>
  <button onClick={() => navigate(`/resources/${r.employee_id}/edit`)}>Edit</button>
  ...
</td>
```

---

## 5. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **`useCallback` Hook** | Caches a function instance between renders to prevent unnecessary re-executions and child re-renders. |
| **Server-Side Pagination** | Sending offset (`skip`) and page size (`limit`) to the database so only 15 records travel across the network at a time. |
| **Event Propagation Prevention** | Using `e.stopPropagation()` on nested interactive elements (buttons inside clickable rows) to prevent parent click events from triggering. |
| **Batch Filter Reset** | Resetting multiple state variables and setting `page = 0` simultaneously to revert to the default catalog view. |
| **Defensive Fallback Attributes** | Using `r.cluster?.name || r.cluster_name || '—'` to ensure the table displays gracefully whether the backend returns nested objects or flat strings. |

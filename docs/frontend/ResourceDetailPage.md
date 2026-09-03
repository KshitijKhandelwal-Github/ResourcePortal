# Resource Profile & History: `ResourceDetailPage.jsx`

Source File: [`frontend/src/pages/ResourceDetailPage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/ResourceDetailPage.jsx)

---

## 1. Overview & Purpose

The [`ResourceDetailPage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/ResourceDetailPage.jsx) component provides a **comprehensive 360-degree view of an individual employee**.

It reads the employee identifier directly from the URL route parameter (`:employeeId`), queries the backend for the employee's core attributes, and concurrently retrieves all associated skill proficiencies, historical training records, and professional certifications. It also provides administrative controls to edit or delete the employee record.

> **Analogy:** Think of `ResourceDetailPage` as an employee's comprehensive personnel dossier. Opening the folder reveals their job contract details, technical skill certifications, training course completions, and current office assignment.

---

## 2. Imports & Dependencies

```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResource, deleteResource } from '../api/resources';
import { getTraining } from '../api/training';
import { getCertifications } from '../api/certifications';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
```

### Explanation of Imports:
* **`useParams` from `'react-router-dom'`**: Hook that reads dynamic path parameters from the current URL (e.g. extracts `EMP101` from `/resources/EMP101`).
* **`useNavigate`**: Allows programmatic navigation back to the directory list or forward to the edit form.
* **API services (`getResource`, `deleteResource`, `getTraining`, `getCertifications`)**: Encapsulated network functions.
* **[`useAuth`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx)**: Determines whether the current user is authorized to see "Edit" and "Delete" buttons.

---

## 3. State Management & Lifecycle

```javascript
const { employeeId } = useParams();
const navigate = useNavigate();
const { user } = useAuth();

const [resource, setResource] = useState(null);
const [training, setTraining] = useState([]);
const [certifications, setCertifications] = useState([]);
const [loading, setLoading] = useState(true);
const [toast, setToast] = useState(null);
```

### Step-by-Step Data Fetching:
```javascript
useEffect(() => {
  loadResource();
}, [employeeId]);

const loadResource = async () => {
  setLoading(true);
  try {
    const res = await getResource(employeeId);
    setResource(res.data);
    
    // Concurrent fetch for secondary records
    try {
      const [trainRes, certRes] = await Promise.all([
        getTraining(employeeId),
        getCertifications(employeeId),
      ]);
      setTraining(trainRes.data);
      setCertifications(certRes.data);
    } catch (e) {
      // Gracefully handles empty training/certifications without failing the page
    }
  } catch (err) {
    setToast({ message: 'Failed to load resource', type: 'error' });
  } finally {
    setLoading(false);
  }
};
```

#### Nested Error Handling Strategy:
Notice the nested `try...catch` block. If an employee has no training or certification records (or if those secondary endpoints return 404/empty), the inner catch absorbs the error. The main resource profile still displays successfully rather than breaking the entire page view.

---

## 4. UI Structure & Data Presentation

### 1. Header & Actions
* Displays employee's full name.
* Includes "← Back" button.
* Renders "Edit" button if user is `admin` or `senior_associate`.
* Renders "Delete" button if user is `admin`.

### 2. Resource Information Card
A 3-column responsive grid detailing:
* Employee ID & Email
* Job Designation & Business Cluster
* Total Years of Experience
* Current Availability Status (with color badge)
* Current Office Location & Preferred Relocation Location

### 3. Skills Card
* Highlights the **Primary Skill** in a solid green pill tag.
* Dynamically filters and displays **Secondary Skills**:
  ```javascript
  const secondarySkills = (resource.skills || resource.secondary_skills || []).filter(s =>
    s.id !== resource.primary_skill_id && s.id !== resource.primary_skill?.id
  );
  ```
  *(Prevents the primary skill from appearing twice in both sections).*

### 4. Training Records & Certifications Tables
* Displays historical courses with start/completion dates and progress badges (`Planned`, `In Progress`, `Completed`).
* Displays external accreditations with issuing organizations and expiration dates.
* Employs `.empty-state` placeholders when no records exist.

---

## 5. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **`useParams` URL Parameter Extraction** | Reading dynamic parameters defined in the route pattern (such as `/resources/:employeeId`). |
| **Fault-Tolerant (Graceful) Fetching** | Structuring try/catch blocks so failures in non-critical data (training history) do not prevent vital data (employee profile) from loading. |
| **Array Filtering (`.filter()`)** | Using JavaScript's `.filter()` method to strip duplicate items from UI lists on the fly. |
| **Delayed Redirect with `setTimeout`** | Displaying a success toast and delaying redirection by 1,000ms (`setTimeout(() => navigate('/resources'), 1000)`) so the user can read the confirmation before being redirected. |

# User Profile & Self-Service: `ProfilePage.jsx`

Source File: [`frontend/src/pages/ProfilePage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/ProfilePage.jsx)

---

## 1. Overview & Purpose

The [`ProfilePage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/ProfilePage.jsx) component provides an **employee self-service portal** accessible to all authenticated users (including basic `user` accounts, `senior_associate`s, and `admin`s).

It allows logged-in individuals to:
1. Inspect their authentication account details (username, email, role).
2. Review their linked corporate resource record (cluster, designation, experience, current and preferred locations, primary skill).
3. Track and self-report new **Training Courses** (Planned, In Progress, Completed).
4. Register newly acquired professional **Certifications** (with issuing organization and validity dates).

> **Analogy:** Think of `ProfilePage` as your personal online employee portal (like Workday). You can view your employment records and upload proof of new credentials or training programs you've completed to keep your professional resume up-to-date in company records.

---

## 2. Imports & Dependencies

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUser } from '../api/users';
import { getResources } from '../api/resources';
import { getTraining, addTraining } from '../api/training';
import { getCertifications, addCertification } from '../api/certifications';
import { getSkills } from '../api/skills';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
```

### Explanation of Imports:
* **[`useAuth`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx)**: Retrieves active user session data.
* **API services**:
  * [`getResources`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/resources.js): Searches for the resource profile linked to the logged-in user.
  * `training` & `certifications`: Endpoints to fetch and record professional development milestones.
  * `skills`: Populates the related skill dropdown when logging a training record.
* **Components ([`LoadingSpinner`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/LoadingSpinner.jsx), [`Toast`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Toast.jsx), [`Modal`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Modal.jsx))**: Provides async feedback and interactive dialog windows.

---

## 3. State Management

```javascript
const { user } = useAuth();
const [resource, setResource] = useState(null);
const [training, setTraining] = useState([]);
const [certifications, setCertifications] = useState([]);
const [skills, setSkills] = useState([]);
const [loading, setLoading] = useState(true);
const [toast, setToast] = useState(null);

// Modal visibility & form states
const [showTrainingModal, setShowTrainingModal] = useState(false);
const [showCertModal, setShowCertModal] = useState(false);
const [trainingForm, setTrainingForm] = useState({
  training_name: '',
  skill_id: '',
  status: 'Planned',
  start_date: '',
  completion_date: '',
});
const [certForm, setCertForm] = useState({
  name: '',
  issuing_organization: '',
  issue_date: '',
  expiry_date: '',
});
```

---

## 4. Step-by-Step Logic & Self-Service Workflows

### 1. Linking User Accounts to Resource Records (`loadProfile`)
```javascript
const loadProfile = async () => {
  setLoading(true);
  try {
    const res = await getResources({ search: user?.username || '', limit: 100 });
    const items = res.data.items || res.data;
    const myResource = items.find(r => r.user_id === user?.id) || items[0];

    if (myResource) {
      setResource(myResource);
      try {
        const [trainRes, certRes] = await Promise.all([
          getTraining(myResource.employee_id),
          getCertifications(myResource.employee_id),
        ]);
        setTraining(trainRes.data);
        setCertifications(certRes.data);
      } catch (e) { /* empty */ }
    }
  } catch (err) {
    console.error('Failed to load profile', err);
  } finally {
    setLoading(false);
  }
};
```
* Queries `/resources` using the current username as search keyword.
* Matches the record where `r.user_id === user?.id`.
* If a linked resource is found, loads that employee's associated trainings and certifications.
* If no resource profile is linked (e.g. newly created standalone user), the UI renders a graceful informational notice instructing the user to contact an administrator.

### 2. Adding Training (`handleAddTraining`)
```javascript
const handleAddTraining = async (e) => {
  e.preventDefault();
  if (!resource) return;
  try {
    const payload = { ...trainingForm };
    if (payload.skill_id) payload.skill_id = parseInt(payload.skill_id);
    else delete payload.skill_id;
    if (!payload.start_date) delete payload.start_date;
    if (!payload.completion_date) delete payload.completion_date;
    
    await addTraining(resource.employee_id, payload);
    setToast({ message: 'Training added', type: 'success' });
    setShowTrainingModal(false);
    setTrainingForm({ training_name: '', skill_id: '', status: 'Planned', start_date: '', completion_date: '' });
    
    // Refresh training records
    const trainRes = await getTraining(resource.employee_id);
    setTraining(trainRes.data);
  } catch (err) {
    setToast({ message: 'Failed to add training', type: 'error' });
  }
};
```
1. Strips empty dates and formats `skill_id` as an integer.
2. Posts the training record to `POST /resources/{employeeId}/training`.
3. Closes modal, resets form state, and re-fetches the training table.

### 3. Adding Certifications (`handleAddCert`)
* Similar flow to training: sanitizes dates, calls `POST /resources/{employeeId}/certifications`, notifies user, and reloads certifications table.

---

## 5. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **Self-Service Architecture** | Enabling non-admin end users to view their own records and submit incremental updates (training, certs) directly. |
| **Payload Pruning (`delete payload.key`)** | Removing empty optional fields before submission so the backend doesn't receive invalid empty string dates (`""`). |
| **Relational Record Association** | Linking authentication login identities (`users` table) with business HR profiles (`resources` table). |
| **Modal Form Reset** | Clearing form input states back to defaults upon successful submission so the next modal popup opens with clean fields. |

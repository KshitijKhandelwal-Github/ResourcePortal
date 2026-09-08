# Resource Creator & Editor: `ResourceFormPage.jsx`

Source File: [`frontend/src/pages/ResourceFormPage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/ResourceFormPage.jsx)

---

## 1. Overview & Purpose

The [`ResourceFormPage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/ResourceFormPage.jsx) component is a **dual-purpose form interface** used both for onboarding new employee records (**Create mode**) and updating existing employee attributes (**Edit mode**).

By inspecting the URL route parameters (`:employeeId`), the component dynamically switches between creation and update semantics. It handles complex form inputs, asynchronous option population (clusters, skills, locations), client-side field validation, multi-select secondary skills, and payload data type sanitization before submitting to the backend.

> **Analogy:** Think of `ResourceFormPage` like an electronic passport application form. If you are a new citizen, you get a blank form where you pick your ID number (Create mode). If you are renewing your passport, your ID is permanently locked and the form pre-populates with your existing records so you only change what has updated (Edit mode).

---

## 2. Imports & Dependencies

```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResource, createResource, updateResource } from '../api/resources';
import { getClusters } from '../api/clusters';
import { getSkills } from '../api/skills';
import { getLocations } from '../api/locations';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
```

### Explanation of Imports:
* **`useParams`**: Checks for the presence of `employeeId` in the URL to determine mode.
* **`useNavigate`**: Redirects to the resource detail or directory page upon successful form submission.
* **Resource CRUD APIs (`getResource`, `createResource`, `updateResource`)**: Handles data persistence.
* **Lookup APIs (`getClusters`, `getSkills`, `getLocations`)**: Populates the select dropdown menus.
* **Feedback Components (`LoadingSpinner`, `Toast`)**: Provide user loading states and toast notifications.

---

## 3. State Management & Form Structure

```javascript
const { employeeId } = useParams();
const navigate = useNavigate();
const isEdit = !!employeeId; // true if editing, false if creating

const [form, setForm] = useState({
  employee_id: '',
  name: '',
  email: '',
  cluster_id: '',
  designation: '',
  years_of_experience: '',
  current_location_id: '',
  preferred_location_id: '',
  availability_status: 'Available',
  primary_skill_id: '',
  secondary_skill_ids: [],
});

const [clusters, setClusters] = useState([]);
const [skills, setSkills] = useState([]);
const [locations, setLocations] = useState([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [toast, setToast] = useState(null);
const [errors, setErrors] = useState({});
```

---

## 4. Step-by-Step Execution Lifecycle

### 1. Pre-population & Option Loading (`loadOptions`)
```javascript
useEffect(() => {
  loadOptions();
}, []);
```
1. Concurrently fetches dropdown options (`clusters`, `skills`, `locations`).
2. If `isEdit` is true:
   - Fetches the current employee record using `getResource(employeeId)`.
   - Filters out the primary skill from secondary skills list.
   - Populates the `form` state with existing employee values.
3. Sets `loading = false`.

### 2. Multi-Select Handling (`handleSecondarySkills`)
```javascript
const handleSecondarySkills = (e) => {
  const options = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
  setForm(prev => ({ ...prev, secondary_skill_ids: options }));
};
```
* Converts native HTML `<select multiple>` selected options into an array of integer skill IDs.

### 3. Client-Side Validation (`validate`)
```javascript
const validate = () => {
  const errs = {};
  if (!form.employee_id.trim()) errs.employee_id = 'Employee ID is required';
  if (!form.name.trim()) errs.name = 'Name is required';
  if (!form.email.trim()) errs.email = 'Email is required';
  if (!form.cluster_id) errs.cluster_id = 'Cluster is required';
  setErrors(errs);
  return Object.keys(errs).length === 0;
};
```
* Checks all mandatory fields. If invalid, injects error messages beneath each input field and aborts submission.

### 4. Payload Sanitization & Submission (`handleSubmit`)
```javascript
const payload = {
  ...form,
  cluster_id: parseInt(form.cluster_id) || null,
  current_location_id: form.current_location_id ? parseInt(form.current_location_id) : null,
  preferred_location_id: form.preferred_location_id ? parseInt(form.preferred_location_id) : null,
  primary_skill_id: form.primary_skill_id ? parseInt(form.primary_skill_id) : null,
  years_of_experience: form.years_of_experience !== '' ? parseFloat(form.years_of_experience) : null,
  secondary_skill_ids: form.secondary_skill_ids.map(Number),
};
```
* **Type Conversion:** HTML form inputs yield strings by default. The sanitization logic converts foreign key IDs to integers and years of experience to floating-point numbers (`parseFloat`), converting empty strings to `null` to satisfy strict backend schema validation.
* Dispatches `updateResource` or `createResource` depending on `isEdit`.

---

## 5. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **Dual-Mode Component Pattern** | Reusing the same form component for both Creation and Editing by toggling based on the presence of a route parameter. |
| **Data Type Coercion / Sanitization** | Converting string values from HTML `<input>` and `<select>` tags into integers, floats, or `null` before sending to a typed REST API. |
| **Field-Level Form Validation** | Storing validation errors in an object (`errors.name`) and rendering targeted feedback messages directly below invalid fields. |
| **Immutable Primary Keys in UI** | Setting `disabled={isEdit}` on `employee_id` to prevent modifying unique primary identifiers during edit sessions. |

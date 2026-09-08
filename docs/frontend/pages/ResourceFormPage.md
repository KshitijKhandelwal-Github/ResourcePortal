# Resource Form Page (`ResourceFormPage.jsx`)

The Resource Form Page provides a single interface that is used for both **creating** a brand new resource and **editing** an existing one. 

## Imports

```javascript
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResource, createResource, updateResource } from '../api/resources';
import { getClusters, getSkills, getLocations } from '../api/...';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
```

- **React Hooks**: `useState`, `useEffect`, `useCallback`.
- **Router Hooks**: `useParams` (to check if we are editing) and `useNavigate` (to redirect after saving).
- **API Functions**: To submit the form data and to populate the dropdown menus (Clusters, Skills, Locations).

## Components and Logic

### `ResourceFormPage` (Main Component)
- **What it does**: Renders a large form for employee data, validates the inputs, and submits them to the backend.
- **How it works**:

  **1. Determining Create vs. Edit (`isEdit`)**:
  ```javascript
  const { employeeId } = useParams();
  const isEdit = !!employeeId;
  ```
  If the URL has an `employeeId` (e.g., `/resources/EMP123/edit`), `isEdit` becomes `true`. If the URL is just `/resources/new`, `employeeId` is undefined, and `isEdit` becomes `false`.

  **2. Form State**:
  The `form` state object holds every single input field. It defaults to empty strings. 
  The `errors` state object holds validation error messages.

  **3. Loading Options & Pre-filling Data (`loadOptions`)**:
  - It first fetches all Clusters, Skills, and Locations to populate the `<select>` dropdowns.
  - *If in Edit Mode*: It fetches the specific resource's data and uses `setForm` to overwrite the empty defaults with the existing data.

  **4. Handling Input (`handleChange` & `handleSecondarySkills`)**:
  - `handleChange` updates the specific field in the state while clearing any validation error for that field.
  - `handleSecondarySkills` specifically handles the multi-select dropdown for secondary skills, converting the selected HTML options into an array of IDs.

  **5. Validation (`validate`)**:
  - Checks if required fields (like Employee ID, Name, Email, Cluster) are filled out. If not, it sets an error message and prevents submission.

  **6. Submission (`handleSubmit`)**:
  - Prevents default form submission.
  - Formats the data (e.g., converting strings like "3.5" to actual floating-point numbers).
  - Calls either `updateResource` (if editing) or `createResource` (if creating).
  - Redirects the user on success.

## Key Concepts

- **Controlled Forms**: Every input's `value` is tied to React state, and updates to the input go through an `onChange` handler.
- **Dual-Purpose Components**: Using the same component for both creating and editing saves a lot of code duplication. It relies on the presence of a URL parameter to switch its behavior.
- **Client-Side Validation**: Checking the data in the browser *before* sending it to the server provides immediate feedback to the user and reduces unnecessary network traffic.

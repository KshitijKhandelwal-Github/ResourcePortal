# Resource Detail Page (`ResourceDetailPage.jsx`)

The Resource Detail Page shows in-depth information about a specific employee (resource) in the system. It lists their basic details, primary and secondary skills, training records, and certifications.

## Imports

```javascript
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResource, deleteResource } from '../api/resources';
import { getTraining } from '../api/training';
import { getCertifications } from '../api/certifications';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
```

- **`useParams` & `useNavigate`**: Hooks from React Router. `useParams` extracts data from the URL (like the employee ID), and `useNavigate` handles page transitions.
- **`useAuth`**: Used to check the current user's role to determine if they should see "Edit" or "Delete" buttons.
- **API Functions**: To fetch the specific resource data and their related training/certifications.

## Components and Logic

### `statusBadge(status)`
- **What it does**: Similar to other pages, this helper converts a status string into a color-coded visual badge.

### `ResourceDetailPage` (Main Component)
- **What it does**: Extracts the employee ID from the URL, fetches all data related to that employee, and displays it in categorized cards.
- **How it works**:

  **1. URL Parameters (`useParams`)**:
  - The URL will look something like `/resources/EMP123`.
  - `const { employeeId } = useParams();` pulls "EMP123" out of the URL so it can be used to query the database.

  **2. Fetching Data (`loadResource`)**:
  - It fetches the main resource details using `getResource(employeeId)`.
  - Once successful, it tries to fetch Training and Certifications using `Promise.all()`. If these fail (e.g., they don't exist yet), it gracefully ignores the error and just leaves those tables empty.

  **3. Permissions**:
  - `const canEdit = user?.role === 'admin' || user?.role === 'senior_associate';`
  - This line checks if the logged-in user has permission to edit. If so, an "Edit Resource" button is displayed. Only "admin" users see the "Delete" button.

  **4. Deleting (`handleDelete`)**:
  - Asks for confirmation using a browser popup `window.confirm`.
  - Calls the delete API.
  - Redirects the user back to the main `/resources` list using `navigate('/resources')`.

## UI Structure
The page is organized into visual "cards":
1. **Resource Information**: Basic data (Email, Designation, Cluster, Experience).
2. **Skills Breakdown**: Lists the Primary Skill prominently, followed by a list of Secondary Skills.
3. **Training Records**: A table displaying the user's training history.
4. **Certifications**: A table displaying the user's certifications.

## Key Concepts

- **Dynamic Routing**: Using variables in the URL (`useParams`) to determine what data to load. This means one component can render the details for any employee in the database.
- **Role-Based UI**: Selectively hiding or showing buttons based on the user's permissions, ensuring security and a cleaner interface for standard users.

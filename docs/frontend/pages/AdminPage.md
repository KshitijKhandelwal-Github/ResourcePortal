# Admin Page (`AdminPage.jsx`)

The Admin Page provides a centralized administration dashboard to manage core data entities of the application: Users, Clusters, Locations, and Skills. It uses a tabbed interface to organize these different sections.

## Imports

```javascript
import { useState, useEffect } from 'react';
import { getUsers, updateUser } from '../api/users';
import { getClusters, createCluster, updateCluster, deleteCluster } from '../api/clusters';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../api/locations';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../api/skills';
import { registerUser } from '../api/auth';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
```

- **`useState`, `useEffect`**: React hooks for managing state and lifecycle events.
- **API Functions**: Specific functions imported from the `../api/` directory to handle networking (getting, creating, updating, and deleting data).
- **UI Components (`Modal`, `Toast`, `LoadingSpinner`)**: Reusable components used to show popups, success/error messages, and loading states.

## Components and Logic

### `AdminPage` (Main Component)
- **What it does**: This is the top-level component that displays the administration header and the navigation tabs (Users, Clusters, Locations, Skills).
- **How it works**: It maintains an `activeTab` state. Depending on which tab is clicked, it conditionally renders either the `UsersTab` component or a configured `CrudTab` component.

### `UsersTab`
- **What it does**: Displays a table of all registered users and allows administrators to add new users, change a user's role, or activate/deactivate an account.
- **Why it's needed**: User management is unique compared to generic data like locations. It requires specific fields (passwords, roles) and a different API endpoint for creation (`registerUser`).
- **Key Functions**:
  - `loadUsers()`: Fetches the list of users from the server.
  - `handleCreate(e)`: Takes the form data from the "Add User" modal and creates a new account.
  - `toggleActive(u)`: Flips a user's `is_active` status (e.g., from active to inactive).
  - `changeRole(u, role)`: Updates the user's access level (admin, senior_associate, or user).

### `CrudTab` (Generic Component)
- **What it does**: A highly reusable component that creates a full "Create, Read, Update, Delete" (CRUD) interface for simple data entities (like Clusters, Locations, or Skills).
- **Why it's needed**: Since Clusters, Locations, and Skills all behave similarly (they just have different fields like `name` vs `city`), creating one generic component saves hundreds of lines of duplicate code.
- **Parameters (Props)**:
  - `entity`: The name of the item (e.g., "cluster").
  - `fetchFn`, `createFn`, `updateFn`, `deleteFn`: The specific API functions to use.
  - `fields`: An array defining what inputs the form should have.
  - `displayCols`: Which columns to show in the table.
- **How it works**: 
  - On load, it calls `fetchFn()` to get the data and displays it in a table.
  - Clicking "Add" or "Edit" opens a `Modal` with a dynamic form built from the `fields` array.
  - Submitting the form calls either `createFn()` or `updateFn()`.

## Key Concepts

- **State Management**: Using `useState` to keep track of what data is currently being viewed or edited.
- **Reusable/Generic Components**: The `CrudTab` is a great example of DRY (Don't Repeat Yourself) programming. Instead of writing three separate tab components, one flexible component is configured via props.
- **Conditional Rendering**: Using `{activeTab === 'users' && <UsersTab />}` to only show the content that matches the currently selected tab.

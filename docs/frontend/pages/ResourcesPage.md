# Resources Page (`ResourcesPage.jsx`)

The Resources Page is the main directory of all employees in the system. It displays a tabular list of resources and features a robust search, filtering, and pagination system.

## Imports

```javascript
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResources, deleteResource } from '../api/resources';
import { getClusters, getSkills, getLocations } from '../api/...';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
```

- **Router**: `useNavigate` for jumping to the detail or edit pages.
- **API Functions**: To fetch the list of resources and the dropdown options for the filters.
- **Auth Context**: Used to determine if the logged-in user is allowed to see the "Add", "Edit", or "Delete" actions.

## Components and Logic

### `ResourcesPage` (Main Component)
- **What it does**: Renders a filter bar, a data table containing the list of resources, and pagination controls.
- **How it works**:

  **1. State Management**:
  - **Data**: `resources` (the array of people) and `total` (how many exist in total).
  - **Filters**: State for `search`, `clusterId`, `skillId`, `locationId`, `availabilityStatus`, `minExp`, and `maxExp`.
  - **Pagination**: `page` (current page number, starting at 0) and `limit` (fixed at 15 items per page).

  **2. Loading Data (`loadResources`)**:
  - This function runs every time a filter changes or the page number changes.
  - It builds a `params` object containing only the filters that the user has actually filled out.
  - It sends these parameters to the API, which returns only the 15 resources for the current page.

  **3. Handlers**:
  - `handleSearch(e)`: Updates the search text and immediately resets the page back to 0.
  - `clearFilters()`: Resets all filter states to empty and returns to page 0.
  - `handleDelete()`: Confirms and deletes a resource directly from the list.

## UI Structure

1. **Header**: Contains the page title and an "+ Add Resource" button (if the user has permission).
2. **Filter Bar**: A row of inputs and dropdowns. Changing any of these immediately triggers a new API call to filter the list below.
3. **Data Table**:
   - Displays the fetched `resources`.
   - Clicking anywhere on a row (`onClick={() => navigate(...) }`) takes the user to that employee's Detail Page.
   - The "Actions" column contains Edit/Delete buttons. `e.stopPropagation()` is used here so clicking an action button doesn't accidentally trigger the row click.
4. **Pagination**: "Previous" and "Next" buttons that increment or decrement the `page` state.

## Key Concepts

- **Server-side Pagination and Filtering**: Instead of downloading all 10,000 employees and filtering them in the browser, the front-end sends parameters to the server, and the server only sends back the exactly 15 records needed. This makes the app incredibly fast regardless of database size.
- **Event Propagation (`e.stopPropagation`)**: When you have a button inside a clickable row, clicking the button also clicks the row underneath it (bubbling). Stopping propagation prevents the row click from firing when interacting with the actions column.
- **Role-based Access Control (RBAC)**: Only admins and senior associates see the UI controls to modify data, protecting the integrity of the system.

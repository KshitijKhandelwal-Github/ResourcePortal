# Profile Page (`ProfilePage.jsx`)

The Profile Page displays the personal dashboard for the currently logged-in user. It shows their basic account information, their linked "Resource" profile (employee details), and allows them to view and add training records and certifications.

## Imports

```javascript
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getResources } from '../api/resources';
import { getTraining, addTraining } from '../api/training';
import { getCertifications, addCertification } from '../api/certifications';
import { getSkills } from '../api/skills';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
```

- **API Functions**: Endpoints to fetch the user's resource profile, training, certifications, and skills.
- **`useAuth`**: To get the identity of the currently logged-in user.
- **UI Components**: Used for loading indicators, pop-up notifications (`Toast`), and dialog boxes (`Modal`).

## Components and Logic

### `statusBadge(status)`
- **What it does**: A helper function that takes a status string (e.g., "Available", "On Leave") and returns a styled HTML `<span>` badge with the appropriate CSS color class.

### `ProfilePage` (Main Component)
- **What it does**: Fetches and displays all information related to the logged-in user.
- **How it works**:

  **1. Fetching Profile Data (`loadProfile`)**:
  - The application needs to find the "Resource" (employee record) that belongs to the current "User" (login account). 
  - It searches the resources API using the user's username.
  - If a matching resource is found, it saves it to the `resource` state.
  - It then immediately fetches any Training and Certification records linked to that resource's `employee_id`.

  **2. Modals and Forms**:
  - The page contains two hidden modals: one for Adding Training and one for Adding Certifications.
  - State variables (`showTrainingModal`, `showCertModal`) control whether these are visible.
  - Form state (`trainingForm`, `certForm`) holds the data the user types in.

  **3. Handlers (`handleAddTraining`, `handleAddCert`)**:
  - These functions format the form data (e.g., ensuring numbers are integers, removing empty dates).
  - They submit the data to the API.
  - On success, they close the modal, show a success toast, clear the form, and re-fetch the data so the UI updates instantly.

## UI Structure
1. **Account Information**: Shows the basic user data (Username, Email, Role) derived directly from the AuthContext.
2. **Resource Profile**: Shows the detailed employee data (Designation, Location, Primary Skill, etc.). If no resource is linked to the user account, an empty state message is shown.
3. **Training Records**: A table listing the user's training history, with an "+ Add Training" button that opens a modal.
4. **Certifications**: A table listing the user's certifications, with an "+ Add Certification" button that opens a modal.

## Key Concepts

- **Relational Data Mapping**: The logic in `loadProfile` demonstrates how a front-end might map an authentication entity (the User) to a business entity (the Resource) using identifiers like User ID or Username.
- **Pop-up Modals**: A common UI pattern where supplementary actions (like filling out a form) happen over the main screen in a dialog box, avoiding the need to navigate to a completely different page.

# Navigation Header: `Navbar.jsx`

Source File: [`frontend/src/components/Navbar.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Navbar.jsx)

---

## 1. Overview & Purpose

The [`Navbar.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Navbar.jsx) component renders the **top sticky header bar** spanning across the main content area.

It provides persistent branding, indicates the currently logged-in user's identity and privilege tier, and houses the primary session termination action (**Logout** button).

> **Analogy:** Think of the navbar as your conference lanyard and badge. It clearly states your organization title, displays your name and clearance level so everyone knows who is performing actions, and gives you the clip to unfasten your badge when you leave the venue.

---

## 2. Imports & Dependencies

```javascript
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
```

* **`React`**: Core library.
* **[`useAuth`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx)**: Retrieves the active user profile (`user`) and the `logout` handler.
* **`useNavigate` from `'react-router-dom'`**: A React Router hook that returns a navigation function to redirect users programmatically.

---

## 3. Component Breakdown & Implementation

```javascript
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    admin: 'Admin',
    senior_associate: 'Senior Associate',
    user: 'User',
  };

  return (
    <div className="navbar">
      <h2>Resource Management & Skill Tracking Portal</h2>
      <div className="navbar-right">
        <span className="navbar-role">{roleLabel[user?.role] || user?.role}</span>
        <span style={{ fontSize: '14px' }}>{user?.username}</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
```

### Key Elements:

1. **Role Label Formatter (`roleLabel`)**:
   - Maps raw database role strings (`'senior_associate'`) into human-readable titles (`'Senior Associate'`).
   - If an unexpected role appears, fallback syntax (`|| user?.role`) prevents blank labels.

2. **Logout Event Handler (`handleLogout`)**:
   - Calls `logout()` from [`AuthContext`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx), which empties `localStorage` tokens and resets React auth state.
   - Programmatically forwards the browser to `/login` via `navigate('/login')`.

3. **User Profile Display**:
   - Employs a green pill badge (`.navbar-role`) and displays the username next to the logout button.

---

## 4. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **`useNavigate` Hook** | React Router hook that returns an imperative function to redirect users through code (e.g. after clicking a button or completing an API call). |
| **Lookup Dictionary (Object Mapping)** | Using a JavaScript object like `{ admin: 'Admin' }` as a fast dictionary lookup instead of complex `if/else` statements. |
| **Event Handling (`onClick`)** | Attaching callback functions to DOM elements so user interactions trigger JavaScript logic. |
| **State Consumption** | Reading global context values without having to pass them down via props from parent components. |

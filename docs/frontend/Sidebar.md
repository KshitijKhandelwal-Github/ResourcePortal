# Navigation Sidebar: `Sidebar.jsx`

Source File: [`frontend/src/components/Sidebar.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Sidebar.jsx)

---

## 1. Overview & Purpose

The [`Sidebar.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Sidebar.jsx) component provides the **fixed vertical navigation panel** on the left side of the screen.

It implements **Role-Based Access Control (RBAC) UI filtering**, dynamically revealing or concealing navigation menu items depending on whether the current user is an `admin`, `senior_associate`, or standard `user`.

> **Analogy:** Think of the sidebar like an elevator panel in a corporate building. Everyone sees the lobby and their personal floor (`My Profile`), but the keycard sensor ([`useAuth`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx)) determines whether buttons for the Executive Suite (`Administration`) or Operations Room (`Dashboard`) light up.

---

## 2. Imports & Dependencies

```javascript
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
```

* **`React`**: Core library.
* **`NavLink` from `'react-router-dom'`**: A specialized version of `<Link>` that knows whether its target URL is currently active, allowing automatic application of an `active` CSS class.
* **[`useAuth`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx)**: Custom authentication hook used to retrieve the logged-in `user` profile and their assigned `role`.

---

## 3. Code Breakdown & Role Logic

```javascript
const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        ⬡ Resource Portal
      </div>
      <nav className="sidebar-nav">
        {(role === 'admin' || role === 'senior_associate') && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              📊 Dashboard
            </NavLink>
            <NavLink to="/resources" className={({ isActive }) => isActive ? 'active' : ''}>
              👥 Resources
            </NavLink>
          </>
        )}
        {role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
            ⚙️ Administration
          </NavLink>
        )}
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
          👤 My Profile
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
```

### Role Visibility Matrix

| Menu Item | Path | `admin` | `senior_associate` | `user` |
| :--- | :--- | :---: | :---: | :---: |
| 📊 **Dashboard** | `/dashboard` | Visible | Visible | Hidden |
| 👥 **Resources** | `/resources` | Visible | Visible | Hidden |
| ⚙️ **Administration** | `/admin` | Visible | Hidden | Hidden |
| 👤 **My Profile** | `/profile` | Visible | Visible | Visible |

### Highlighting the Active Route:
`NavLink` receives a function in `className`:
```javascript
className={({ isActive }) => isActive ? 'active' : ''}
```
When the browser URL matches `/dashboard`, `isActive` becomes `true`, attaching the `.active` CSS class (which paints a light green accent border and background highlight).

---

## 4. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **`NavLink` vs `Link`** | Both navigate without page reload, but `NavLink` provides built-in awareness of whether it is currently active. |
| **Conditional Rendering (`&&`)** | Using JavaScript short-circuit evaluation (`condition && <Element />`) to show elements only when conditions are met. |
| **React Fragment (`<> ... </>`)** | An invisible wrapper that allows grouping multiple adjacent JSX elements without adding unwanted extra `<div>` nodes to the HTML. |
| **Optional Chaining (`user?.role`)** | Safely reading nested properties without throwing errors if `user` is temporarily `null` or `undefined`. |

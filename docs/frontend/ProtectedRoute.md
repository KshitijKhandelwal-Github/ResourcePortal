# Route Security Guard: `ProtectedRoute.jsx`

Source File: [`frontend/src/components/ProtectedRoute.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/ProtectedRoute.jsx)

---

## 1. Overview & Purpose

The [`ProtectedRoute.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/ProtectedRoute.jsx) component is a **higher-order security wrapper (route guard)**. 

In a single-page application, users could theoretically attempt to type any URL (such as `/admin` or `/dashboard`) into their browser's location bar. [`ProtectedRoute`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/ProtectedRoute.jsx) intercepts such navigation attempts, validating that:
1. The user has an active session (logged in).
2. The user's role has permission to access the target page.

If either check fails, the user is safely redirected away before the sensitive page ever mounts.

> **Analogy:** Think of `ProtectedRoute` as a security checkpoint before an airport gate. First, the guard checks if you have a valid boarding pass (logged in). If not, you are sent to check-in (`/login`). Second, if you attempt to walk into the VIP First-Class lounge without a VIP pass (role check), you are politely redirected to the general passenger terminal (`/profile`).

---

## 2. Imports & Dependencies

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
```

* **`React`**: Core library.
* **`Navigate` from `'react-router-dom'`**: Declarative redirect component.
* **[`useAuth`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx)**: Hook to read the current authentication state and user details.

---

## 3. Component Breakdown & Logic Flow

```javascript
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // Check 1: Authentication
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check 2: Authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/profile" replace />;
  }

  // Access Granted
  return children;
};

export default ProtectedRoute;
```

### Parameters:
* **`children` (`ReactNode`)**: The protected page component that should be displayed if validation passes (e.g. `<AdminPage />`).
* **`allowedRoles` (`Array<string>`, optional)**: List of role strings allowed to access the route (e.g. `['admin']` or `['admin', 'senior_associate']`).

### Step-by-Step Flow:

```
                  +--------------------------------+
                  | User requests protected route  |
                  +---------------+----------------+
                                  |
                                  v
                        Is user logged in?
                        (user != null)
                             /  \
                       No   /    \  Yes
                           v      v
             Redirect to /login   Are allowedRoles defined
                                  and is user.role included?
                                      /  \
                                No   /    \  Yes
                                    v      v
                      Redirect to /profile  Render children (Page)
```

1. **Authentication Check**:
   - If `!user`, redirects immediately to `/login` with `replace` mode (preventing the back-button from looping into an unauthorized page).
2. **Authorization Check**:
   - If `allowedRoles` was passed and `!allowedRoles.includes(user.role)`, redirects to `/profile` (the fallback page that any authenticated user can view).
3. **Pass-Through**:
   - If all criteria are met, it renders `children` normally.

---

## 4. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **Route Guard / Wrapper Pattern** | A design pattern where routes are wrapped in a gatekeeper component that inspects conditions before rendering child views. |
| **Authentication vs. Authorization** | *Authentication* verifies *who* you are (logged in). *Authorization* verifies *what* you are allowed to do (roles and permissions). |
| **The `replace` Prop in `<Navigate>`** | Replaces the current entry in the browser's history stack instead of adding a new one, ensuring clean back-button navigation. |
| **Component Props (`children`)** | Special React prop that represents whatever elements are placed between a component's opening and closing tags. |

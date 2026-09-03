# Root Application Component: `App.jsx`

Source File: [`frontend/src/App.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/App.jsx)

---

## 1. Overview & Purpose

The [`App.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/App.jsx) file acts as the **central router and root orchestrator** of the Resource Portal frontend. 

It organizes the application into distinct URLs (routes), enforces role-based security barriers around private pages, and provides global authentication context to every component.

> **Analogy:** If our web app is an office building, [`App.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/App.jsx) is the floor plan and security desk. It determines which hallway (route) leads to which office (page), and ensures security checkpoints ([`ProtectedRoute`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/ProtectedRoute.jsx)) check your clearance card (role) before letting you in.

---

## 2. Imports & Dependencies

```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ResourcesPage from './pages/ResourcesPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import ResourceFormPage from './pages/ResourceFormPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

import './App.css';
```

### Explanation of Imports:

* **`React`**: Base library for writing components and JSX.
* **`react-router-dom` tools**:
  * `BrowserRouter`: Keeps the UI in sync with the browser's URL address bar using HTML5 History API.
  * `Routes`: A container that matches the current browser location against a list of child `<Route>` definitions.
  * `Route`: Maps a specific URL path (e.g., `/dashboard`) to a React element/page.
  * `Navigate`: A declarative redirect component that automatically forwards the user to another route.
* **[`AuthProvider`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx)**: Context provider wrapping the app, broadcasting the current user session and authentication actions (`login`, `logout`) everywhere.
* **[`Layout`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Layout.jsx)**: Persistent structural shell holding the navigation sidebar, top navbar, and an outlet for page content.
* **[`ProtectedRoute`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/ProtectedRoute.jsx)**: Route guard that verifies whether a user is logged in and possesses the required permissions.
* **Pages (`LoginPage`, `DashboardPage`, `ResourcesPage`, `ResourceDetailPage`, `ResourceFormPage`, `AdminPage`, `ProfilePage`)**: The primary view screens.

---

## 3. Component Architecture & Routes

```javascript
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'senior_associate']}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            {/* Additional Protected Routes */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### Route Map & Access Control Table

| URL Route | Rendered Page | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `/login` | [`LoginPage`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/LoginPage.jsx) | Public / Unauthenticated | Login screen for user authentication |
| `/` (root) | Redirection | `admin`, `senior_associate` | Automatically redirects to `/dashboard` |
| `/dashboard` | [`DashboardPage`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/DashboardPage.jsx) | `admin`, `senior_associate` | High-level analytics, statistics, and charts |
| `/resources` | [`ResourcesPage`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/ResourcesPage.jsx) | `admin`, `senior_associate` | Filterable list of all employees and resources |
| `/resources/new` | [`ResourceFormPage`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/ResourceFormPage.jsx) | `admin`, `senior_associate` | Form to register a new employee/resource |
| `/resources/:employeeId` | [`ResourceDetailPage`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/ResourceDetailPage.jsx) | `admin`, `senior_associate` | Detailed view of a single resource |
| `/resources/:employeeId/edit`| [`ResourceFormPage`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/ResourceFormPage.jsx) | `admin`, `senior_associate` | Edit form for an existing resource |
| `/admin` | [`AdminPage`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/AdminPage.jsx) | `admin` | User management and CRUD for master data |
| `/profile` | [`ProfilePage`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/ProfilePage.jsx) | `user`, `admin`, `senior_associate` | Personal profile, trainings, and certifications |

---

## 4. How It Works (Step-by-Step)

1. **Context Initialization**:
   - `<AuthProvider>` initializes state from local storage and makes authentication data available to all child components.
2. **URL Evaluation**:
   - `<BrowserRouter>` listens to changes in browser history. When a user navigates to a URL, `<Routes>` evaluates the path.
3. **Layout Rendering**:
   - For all paths under `/`, the `<Layout />` component is mounted once. It displays the persistent [`Sidebar`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Sidebar.jsx) and [`Navbar`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Navbar.jsx).
4. **Child Route Rendering via Outlet**:
   - The matching sub-route replaces `<Outlet />` inside `Layout`.
5. **Security Check**:
   - Before the page element renders, [`ProtectedRoute`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/ProtectedRoute.jsx) checks if `user` exists and if `allowedRoles.includes(user.role)`. If not, it redirects to `/login` or `/profile`.

---

## 5. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **Client-Side Routing** | Navigating between pages without asking the server for new HTML pages; JavaScript updates the screen instantly. |
| **Nested Routing** | Nesting `<Route>` components inside another `<Route>` so parent layouts (sidebar/header) persist while only child views change. |
| **Dynamic Segments (`:employeeId`)** | A route wildcard that captures whatever value is in that part of the URL (e.g. `/resources/EMP101`) for the component to read. |
| **Declarative Redirects (`<Navigate />`)** | Directing users from one path to another declaratively in JSX instead of writing imperative code. |
| **Component Hierarchy** | Tree structure of components where data flows down and context wraps surrounding branches. |

# Application Shell: `Layout.jsx`

Source File: [`frontend/src/components/Layout.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Layout.jsx)

---

## 1. Overview & Purpose

The [`Layout.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Layout.jsx) component defines the **structural master template (app shell)** for all authenticated pages in the portal.

Instead of duplicating the navigation sidebar and top bar on every single page file (Dashboard, Resources, Admin, Profile), [`Layout`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Layout.jsx) wraps around them. When a user navigates between routes, the sidebar and navbar remain mounted without reloading, and only the inner content updates.

> **Analogy:** Think of a newspaper where the masthead at the top and the index on the left are printed on every page, while only the articles in the center column change as you flip through the sections.

---

## 2. Imports & Dependencies

```javascript
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
```

* **`React`**: Core React library.
* **`Outlet` from `'react-router-dom'`**: A placeholder component provided by React Router. It renders whichever child route is currently active (e.g. `<DashboardPage />` or `<ResourcesPage />`).
* **[`Navbar`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Navbar.jsx)**: The top navigation header component displaying title, user details, and logout button.
* **[`Sidebar`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Sidebar.jsx)**: The left navigation bar component with menu links.

---

## 3. Component Breakdown & JSX Structure

```javascript
const Layout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
```

### Visual Structure Diagram:

```
+-------------------------------------------------------------+
| .layout                                                     |
| +-----------+ +-------------------------------------------+ |
| |           | | .main-content                             | |
| |           | | +---------------------------------------+ | |
| |           | | | <Navbar />                            | | |
| | <Sidebar> | | +---------------------------------------+ | |
| |           | | | .content                              | | |
| |           | | |                                       | | |
| |           | | |   <Outlet />                          | | |
| |           | | |   (Active Page Component Renders Here)| | |
| |           | | |                                       | | |
| |           | | +---------------------------------------+ | |
| +-----------+ +-------------------------------------------+ |
+-------------------------------------------------------------+
```

### How It Works:
1. **`.layout` Wrapper**: Establishes a flex row with `min-height: 100vh`.
2. **`<Sidebar />`**: Rendered on the left side with fixed positioning.
3. **`.main-content` Area**: Takes up the remaining horizontal space (`flex: 1`) with an offset margin (`margin-left: 220px`).
4. **`<Navbar />`**: Sticks to the top of `.main-content`.
5. **`<Outlet />`**: Injected inside `.content`. When the URL is `/dashboard`, `<DashboardPage />` renders here; when the URL is `/resources`, `<ResourcesPage />` renders here.

---

## 4. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **React Router `<Outlet />`** | Acts as a dynamic "slot" or placeholder in a parent route layout where matched child routes are rendered. |
| **App Shell Architecture** | A design pattern where static navigation elements persist across page transitions, improving perceived performance. |
| **Component Composition** | Building complex UIs by combining smaller, specialized components (`Sidebar`, `Navbar`, `Outlet`). |
| **DRY Principle (Don't Repeat Yourself)** | Avoiding copy-pasting navigation chrome into 7 different page files. |

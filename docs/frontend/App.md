# Main App Component & Routing (`App.jsx`)

## Overview
The `App.jsx` file is the master blueprint for the user interface. It acts as the traffic controller (Router) for the application, deciding which page to show the user based on the URL in their browser's address bar. It also enforces security by checking if a user is allowed to see a certain page.

## Imports
- **Routing Tools (`react-router-dom`):** `BrowserRouter`, `Routes`, `Route`, `Navigate`. These are used to create the navigation system.
- **Context (`AuthProvider`):** A wrapper that provides user login state to the entire app.
- **Components:** `Layout` (the structural shell of the app like sidebars and headers) and `ProtectedRoute` (a security checkpoint).
- **Pages:** Various screen components like `LoginPage`, `DashboardPage`, `ResourcesPage`, etc.
- **Styles:** `'./App.css'`

## How it works

The `App` component returns a tree of routing instructions.

1. **`AuthProvider`**: Wraps the whole app so that any page can check if the user is logged in.
2. **`BrowserRouter`**: Enables client-side routing (changing the URL without refreshing the whole webpage).
3. **`Routes` & `Route`**: Defines the map. "If the URL is X, show component Y".

### The Routing Map

- **Public Route:** 
  - URL `/login` shows the `LoginPage`.
- **Protected Layout:** 
  - URL `/` shows the `Layout` component. All routes nested inside this one will appear *inside* the layout (e.g., next to the sidebar).
  - If a user just goes to `/`, they are instantly redirected (`Navigate`) to `/dashboard`.
- **Nested Protected Routes:**
  - To view the dashboard (`/dashboard`), the resources list (`/resources`), or resource details, the app uses a custom component called `<ProtectedRoute>`.
  - `<ProtectedRoute>` checks what "role" the logged-in user has.
  - For example, only an `'admin'` or `'senior_associate'` is allowed to see the `DashboardPage`.
  - Only an `'admin'` can see the `AdminPage`.

## Code Snippet Example

```jsx
<Route path="dashboard" element={
  <ProtectedRoute allowedRoles={['admin', 'senior_associate']}>
    <DashboardPage />
  </ProtectedRoute>
} />
```
*Translation: "If the URL ends in /dashboard, check if the user is an admin or senior_associate. If yes, show the DashboardPage. If no, kick them out."*

## Key Concepts
- **Client-Side Routing:** In traditional websites, clicking a link asks the server for a whole new HTML page. In React apps, routing is handled in the browser. The browser's URL changes, and React simply swaps out which components are visible on the screen instantly, making the app feel much faster.
- **Context Providers:** A way to share data (like "who is logged in right now") across hundreds of components without having to pass that data down manually level by level.
- **Protected Routes / Authorization:** The concept of restricting access to certain parts of an application based on whether a user is authenticated (logged in) and authorized (has the correct permissions/role).
- **Nested Routes:** Routes placed inside other routes, allowing you to share UI elements (like a navigation bar) across multiple pages.

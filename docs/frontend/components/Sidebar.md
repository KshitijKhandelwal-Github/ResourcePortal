# Sidebar Component Documentation

The `Sidebar` component creates the vertical navigation menu on the left side of the screen. It displays different links based on the role of the user who is currently logged in.

## Imports

- `NavLink` from `react-router-dom`: A special type of link for routing. It automatically knows if it is the "active" page, making it easy to highlight the current page the user is looking at.
- `useAuth` from `../contexts/AuthContext`: A hook to get the current user's information, specifically their role (e.g., admin, user).

## Component: `Sidebar`

### What it does
It renders a vertical menu containing links to various pages in the application, such as Dashboard, Resources, Administration, and Profile. It intelligently hides or shows links depending on whether the user has permission to see them.

### Why it's needed
A sidebar is a standard way to let users navigate between different sections of a large application. Hiding links that a user doesn't have permission to use provides a cleaner, less confusing experience and adds a layer of visual security.

### How it works
1. It fetches the current user's `role` from the authentication context.
2. It renders the top header ("❖ Resource Portal").
3. It renders a navigation area (`nav`).
4. It uses conditional logic (`&&`) to decide which links to show:
   - If the user is an 'admin' or 'senior_associate', they see the "Dashboard" and "Resources" links.
   - If the user is strictly an 'admin', they see the "Administration" link.
   - Everyone always sees the "My Profile" link.
5. It uses `NavLink` components which apply an `active` CSS class if the user is currently on that page's URL.

### Parameters and Return Value
- **Parameters:** None.
- **Returns:** JSX representing the left-hand navigation sidebar.

### Code Snippet Highlight
```jsx
{role === 'admin' && (
  <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
    <span>⚙️</span> Administration
  </NavLink>
)}
```
*This snippet uses a JavaScript trick called "Logical AND" (`&&`). It reads as: "If the role is exactly 'admin', THEN render this link. Otherwise, render nothing."*

## Key Concepts

- **Conditional Rendering:** Showing different UI elements based on the current state (in this case, the user's role).
- **Role-Based Access Control (RBAC) in UI:** Adjusting the user interface to only show actions and areas that the specific user is authorized to use.
- **Active State Styling:** Using `NavLink`'s `isActive` property to give visual feedback to the user about which page they are currently on (usually by highlighting the text or background).

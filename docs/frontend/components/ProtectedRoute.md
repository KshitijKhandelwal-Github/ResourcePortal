# ProtectedRoute Component Documentation

The `ProtectedRoute` component acts as a security guard for certain pages in the application. It wraps around other pages and ensures that only logged-in users with the correct permissions can view them.

## Imports

- `Navigate` from `react-router-dom`: A component that immediately redirects the user to a different page when it is rendered on the screen.
- `useAuth` from `../contexts/AuthContext`: A hook that lets this component check if there is a logged-in user and what their role is.

## Component: `ProtectedRoute`

### What it does
It intercepts a user trying to view a page. If the user is not logged in, they are sent to the login page. If the page requires a specific role (like 'admin') and the user doesn't have it, they are sent back to their profile page. If everything is okay, it lets them see the page.

### Why it's needed
Without it, anyone could type the URL of an admin dashboard or a private profile into their browser and see sensitive information. The `ProtectedRoute` ensures your application remains secure.

### How it works
The component takes two things: the page the user wants to see (`children`), and a list of roles allowed to see it (`allowedRoles`). 
1. It gets the current `user` from the authentication system.
2. If `user` is missing (not logged in), it immediately redirects to `/login`.
3. If `allowedRoles` was provided, it checks if the user's role is in that list. If it isn't, it redirects the user to `/profile`.
4. If both checks pass, it returns the `children`, allowing the protected page to be displayed.

### Parameters
- **`children` (React Node):** The actual page or component the user is trying to access (e.g., the Dashboard).
- **`allowedRoles` (Array of Strings):** *Optional.* A list of roles that are permitted to view this page (e.g., `['admin', 'senior_associate']`).

### Return Value
Returns either a redirect component (`<Navigate />`) or the requested page (`children`).

### Code Snippet Highlight
```jsx
if (!user) {
  return <Navigate to="/login" replace />;
}
```
*This is the core security check. If there is no user, return the `Navigate` component instead of the page. The `replace` word means the browser won't remember the failed attempt in its "Back" button history.*

## Key Concepts

- **Route Guards / Protected Routes:** A common pattern in web development where a wrapper component evaluates conditions (like authentication status) before allowing the user to access a specific URL.
- **Children Prop:** Used here as a "wrapper". The `ProtectedRoute` surrounds the page, and `children` represents the page inside the wrapper.

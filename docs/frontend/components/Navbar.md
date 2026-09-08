# Navbar Component Documentation

The `Navbar` component creates the top navigation bar of the application. It acts as the header, displaying the application's title, the current user's role and username, and a logout button.

## Imports

- `useAuth` from `../contexts/AuthContext`: A custom hook that gives the component access to the user's information and authentication actions (like logging out).
- `useNavigate` from `react-router-dom`: A hook that allows the code to programmatically change the current page URL, effectively redirecting the user to a different page.

## Component: `Navbar`

### What it does
It renders a horizontal bar at the top of the screen. On the left side, it shows the portal's name. On the right side, it shows who is currently logged in and provides a way for them to log out.

### Why it's needed
Users need a constant point of reference to know what application they are using, who they are logged in as, and an easy, always-accessible way to log out for security purposes.

### How it works
1. It retrieves the `user` object and the `logout` function from the `AuthContext`.
2. It sets up a `handleLogout` function. When called, it logs the user out and then redirects them to the `/login` page.
3. It uses a dictionary (`roleLabel`) to convert technical role names (like `senior_associate`) into nicely formatted, human-readable labels (like `Senior Associate`).
4. It displays the application title, the formatted role, the username, and the logout button.

### Parameters and Return Value
- **Parameters:** None.
- **Returns:** JSX representing the top navigation bar.

### Code Snippet Highlight
```jsx
const handleLogout = () => {
  logout();
  navigate('/login');
};
```
*This function runs when the logout button is clicked. It first tells the authentication system to clear the user's data (`logout()`), and then it forcefully redirects the user back to the login screen (`navigate('/login')`).*

## Key Concepts

- **Context (`useAuth`):** A way to share data (like the logged-in user) across the entire application without having to pass it down manually through every single component. Think of it like a global bulletin board that any component can read from.
- **Routing/Navigation (`useNavigate`):** The ability to move users between different pages in a single-page application without actually refreshing the web browser.
- **Optional Chaining (`?.`):** In the code `user?.role`, the `?.` ensures that if the `user` is currently empty or hasn't loaded yet, the application won't crash when trying to read the `role`. It will simply return `undefined`.

# Login Page (`LoginPage.jsx`)

The Login Page is the entry point for the application. It provides a simple form where users can enter their credentials to authenticate and access the system.

## Imports

```javascript
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
```

- **`useState`**: To manage the input fields (username/password), loading state, and error messages.
- **`useAuth`**: A custom React Hook that taps into the application's global Authentication Context. This provides the `login` function and the current `user` object.
- **`useNavigate`, `Navigate`**: Functions and components from React Router to handle redirecting the user to different pages.

## Components and Logic

### `LoginPage` (Main Component)
- **What it does**: Renders the sign-in form, validates input, and attempts to authenticate the user against the backend.
- **How it works**:
  
  **1. Initial Check**:
  ```javascript
  if (user) {
    const dest = user.role === 'user' ? '/profile' : '/dashboard';
    return <Navigate to={dest} replace />;
  }
  ```
  Before rendering the form, the component checks if a `user` is already logged in (via the `useAuth` context). If they are, it redirects them away from the login page to their appropriate destination based on their role.

  **2. Form State**:
  The component tracks the `username` and `password` typed by the user, as well as a boolean `loading` state to disable the button during the API call, and an `error` string to display any login failures.

  **3. `handleSubmit(e)`**:
  Triggered when the user clicks "Sign In" or presses Enter.
  - `e.preventDefault()`: Stops the browser from refreshing the page (the default HTML form behavior).
  - Validates that both fields are filled.
  - Calls the `login(username, password)` function from the AuthContext.
  - If successful, it navigates the user to the `/dashboard`.
  - If it fails, it catches the error and displays the message to the user.

## Key Concepts

- **Controlled Inputs**: The `<input>` fields have their `value` tied directly to the React state (`username` and `password`), and they update that state via the `onChange` event. This means React acts as the "single source of truth" for what is in the form.
- **Context API (`useAuth`)**: Instead of passing login functions down through multiple layers of components, Context allows the Login Page to directly grab global authentication logic and state.
- **Client-Side Routing**: Using `useNavigate` to instantly swap the screen to the Dashboard upon a successful login, without requiring a full browser page load.

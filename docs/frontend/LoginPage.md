# User Authentication View: `LoginPage.jsx`

Source File: [`frontend/src/pages/LoginPage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/LoginPage.jsx)

---

## 1. Overview & Purpose

The [`LoginPage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/LoginPage.jsx) component provides the **user login screen** for authenticating into the Resource Portal.

It captures user credentials (username and password), performs client-side validation, submits the credentials to the backend via the authentication context, handles error feedback, and redirects authenticated users to their appropriate landing page based on their role.

> **Analogy:** Think of `LoginPage` as the front gate of a corporate building. You present your employee badge credentials at the gate. If valid, the security system routes you inside to your designated workstation (managers to the Dashboard, employees to their Personal Profile).

---

## 2. Imports & Dependencies

```javascript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
```

* **`React`, `useState`**: Core React library and state management hook.
* **[`useAuth`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx)**: Accesses the global `login(username, password)` function and the `user` state.
* **`useNavigate`, `Navigate` from `'react-router-dom'`**:
  * `useNavigate`: Programmatic navigation hook.
  * `Navigate`: Declarative redirect component.

---

## 3. State Management & Form Handling

### Component State:
```javascript
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```
* **`username`**: Controlled input state tracking characters typed into the username box.
* **`password`**: Controlled input state tracking characters typed into the password box.
* **`error`**: Error message string displayed in red banner if authentication fails.
* **`loading`**: Boolean indicator disabling the submit button and showing "Signing in..." while the network request is pending.

---

## 4. Step-by-Step Logic Flow

### 1. Already Authenticated Check
```javascript
if (user) {
  const dest = user.role === 'user' ? '/profile' : '/dashboard';
  return <Navigate to={dest} replace />;
}
```
* If a logged-in user navigates to `/login`, they are immediately redirected:
  * Regular `'user'` role -> redirected to `/profile`.
  * `'admin'` or `'senior_associate'` roles -> redirected to `/dashboard`.

### 2. Form Submission Handler (`handleSubmit`)
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  if (!username || !password) {
    setError('Please enter both username and password');
    return;
  }
  setLoading(true);
  try {
    await login(username, password);
    navigate('/dashboard');
  } catch (err) {
    const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
    setError(msg);
  } finally {
    setLoading(false);
  }
};
```
1. `e.preventDefault()` stops default browser form submission (which would refresh the page).
2. Clears previous errors and validates that neither field is empty.
3. Sets `loading = true` to prevent double-submissions.
4. Invokes `login(username, password)`.
5. If successful, redirects to `/dashboard` via `navigate('/dashboard')`.
6. If the backend returns an error (such as 400 or 401 with invalid credentials), extracts the `detail` message and displays it in the `.login-error` container.
7. Finally resets `loading = false`.

---

## 5. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **Controlled Components** | Form inputs whose value is bound to React state (`value={username}`) and updated via an `onChange` handler (`setUsername(e.target.value)`). |
| **`e.preventDefault()`** | Standard browser method that halts default actions (such as form submission refreshing the webpage). |
| **Declarative vs. Imperative Redirect** | `<Navigate to="..." replace />` is declarative (React handles it as part of rendering); `navigate('/dashboard')` is imperative (a JavaScript function called inside a callback). |
| **Conditional Rendering of Errors** | `{error && <div className="login-error">{error}</div>}` renders the alert box only when `error` has a non-empty string value. |
| **Disabling Form Inputs During Async Calls** | Disabling `<button disabled={loading}>` prevents users from accidentally clicking multiple times while waiting for the network. |

# Authentication Context: `AuthContext.jsx`

Source File: [`frontend/src/contexts/AuthContext.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx)

---

## 1. Overview & Purpose

The [`AuthContext.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx) file provides **global authentication state management** across the frontend using React's Context API. 

In a typical React app, passing data from a parent to deeply nested children requires passing props through every intermediate component—a frustrating problem known as **"prop drilling"**. [`AuthContext`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx) solves this by broadcasting the logged-in user's profile and authentication functions (`login`, `logout`) everywhere in the component tree.

> **Analogy:** Think of React Context like a Wi-Fi router in a house. Rather than running a physical ethernet cable (props) to every single device in every room, the Wi-Fi router ([`AuthProvider`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx)) broadcasts an invisible signal that any approved device ([`useAuth`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx)) can connect to immediately.

---

## 2. Imports & Dependencies

```javascript
import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';
```

* **`createContext`**: React factory function that produces a Context object with `Provider` and `Consumer` components.
* **`useState`**: Hook to preserve and update reactive state (`user`) across re-renders.
* **`useContext`**: Hook that allows child components to subscribe and read context values directly.
* **[`client`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/client.js)**: Pre-configured Axios instance that handles network communication with the backend API.

---

## 3. Component & Hook Breakdown

### 1. The Context Instance
```javascript
const AuthContext = createContext();
```
* Creates the communication channel. Unexported directly to encapsulate access through the custom hook [`useAuth`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/contexts/AuthContext.jsx).

---

### 2. The Provider Component: `AuthProvider`
```javascript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  
  const login = async (username, password) => {
    const res = await client.post('/auth/login', { username, password });
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Parameters:
* **`children` (`ReactNode`)**: All descendant components wrapped inside `<AuthProvider>` (e.g. the entire `<App />` tree).

#### State:
* **`user`**: Holds the current logged-in user object (`{ id, username, email, role, is_active }`) or `null` if unauthenticated.
* **Initial State Strategy**: It synchronously reads `localStorage.getItem('user')` on initial page load so refreshing the browser keeps the user logged in without flashing a login screen.

#### Functions:
* **`login(username, password)`**:
  1. Issues an asynchronous `POST /auth/login` request to the backend.
  2. Receives `{ access_token, user }`.
  3. Writes the JWT token to `localStorage` under the key `'token'`.
  4. Serializes and writes user details to `localStorage` under the key `'user'`.
  5. Updates `user` state via `setUser(...)`, causing dependent components to re-render.
* **`logout()`**:
  1. Clears `'token'` and `'user'` keys from `localStorage`.
  2. Resets `user` state to `null`.

---

### 3. The Custom Hook: `useAuth`
```javascript
export const useAuth = () => useContext(AuthContext);
```
* **Why it's needed:** Prevents consumers from having to import both `useContext` and `AuthContext` in every file.
* **Usage in components:**
  ```javascript
  const { user, login, logout } = useAuth();
  ```

---

## 4. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **React Context API** | Built-in React feature to share data across an entire component tree without manual prop drilling. |
| **`localStorage`** | Browser web storage API that saves key-value pairs persistently even when the browser tab is closed or reloaded. |
| **Custom React Hooks** | JavaScript functions whose names start with `use` and can call other React hooks (e.g., `useAuth` wrapping `useContext`). |
| **Prop Drilling** | The tedious anti-pattern of passing props through intermediary components that have no need for that data other than forwarding it. |
| **JWT Token Storage** | Saving authentication tokens in the browser so subsequent API requests can identify who is making the request. |

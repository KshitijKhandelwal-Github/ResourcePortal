# AuthContext Documentation

The `AuthContext` file creates the central authentication system for the application. It acts as the "brain" that remembers who is currently logged in, handles the process of logging in, handles logging out, and makes this information available to any part of the app that needs it.

## Imports

- `createContext`, `useState`, `useContext` from `react`: React tools used to create shared data, manage changing data, and access shared data, respectively.
- `client` from `../api/client`: A custom tool (likely an Axios instance) used to make network requests to the backend server.

## Helper Function: `normalizeUser`

### What it does
It takes a user object and standardizes the role names.
### Why it's needed
Sometimes a backend database might use a messy name like `'regular_user'`, but our frontend sidebar and routing expect the simple word `'user'`. This function cleans up that data so the rest of the app doesn't break.

## Component: `AuthProvider`

### What it does
This is a wrapper component that holds the actual state (memory) of the logged-in user. It provides the `login` and `logout` functions.

### How it works
1. **Initial State:** When the app starts, `useState` checks the browser's `localStorage` (a small hard drive in the browser) to see if a user was already logged in from a previous visit. If so, it loads them up; otherwise, the user is `null`.
2. **Login Function:** When called, it sends the username and password to the server using `client.post`. If successful, the server sends back a `token` (a digital ID card) and the user's details. It saves these in `localStorage` so they survive a page refresh, and then updates the app's memory (`setUser`).
3. **Logout Function:** It wipes the token and user data from `localStorage` and resets the app's memory to `null`.
4. **Providing Context:** It uses `<AuthContext.Provider>` to wrap its children (which will be the entire application). It passes down the `user`, `login`, and `logout` data so everything inside can reach up and grab it.

### Parameters
- **`children` (React Node):** The entire application that needs access to authentication.

## Hook: `useAuth`

### What it does
A custom, shortcut hook that other files use to access the AuthContext.

### How it works
Instead of every file importing `AuthContext` and `useContext` and writing `useContext(AuthContext)`, they just import `useAuth` and write `useAuth()`.

### Code Snippet Highlight
```jsx
const [user, setUser] = useState(() => {
  try {
    const saved = localStorage.getItem('user');
    return saved ? normalizeUser(JSON.parse(saved)) : null;
  } catch {
    return null;
  }
});
```
*This is called "lazy initialization". Instead of just passing a simple starting value to `useState`, we pass a function. This function checks local storage. Because checking local storage can be slightly slow, doing it inside this function ensures it only happens once when the app first loads, not every time the screen updates.*

## Key Concepts

- **Context API:** A React feature that allows you to share state globally across your application, avoiding "prop drilling" (the tedious process of passing data down through 10 levels of parent-child components).
- **LocalStorage:** A feature built into web browsers that allows web applications to save data locally on the user's computer. It persists even if the browser tab is closed.
- **Custom Hooks:** Creating a new function (like `useAuth`) that bundles up existing React hooks to make them easier to reuse across your codebase.

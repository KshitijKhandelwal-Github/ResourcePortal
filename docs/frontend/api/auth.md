# Authentication API (`auth.js`)

## Overview
This file handles the communication between the frontend application and the backend server for everything related to user authentication. It provides specific functions for logging in and registering users.

## Imports
- `client` from `./client`: This is our custom configured HTTP client (built using a tool called Axios). We use it instead of the standard `fetch` command because it already knows the base URL of our server and automatically attaches security tokens to our requests.

## Functions

### `loginUser(username, password)`
- **What it does:** Sends a request to the server to log a user in.
- **Why it's needed:** When a user types their username and password into the login form, the app needs a way to verify those credentials with the database.
- **How it works:** It takes the username and password provided, packages them into an object, and sends them to the `/auth/login` endpoint using an HTTP POST request.
- **Parameters:**
  - `username` (string): The user's username.
  - `password` (string): The user's password.
- **Returns:** A Promise that resolves with the server's response (typically containing user data and a security token) if successful, or rejects with an error if the login fails.

```javascript
export const loginUser = (username, password) =>
  client.post('/auth/login', { username, password });
```

### `registerUser(data)`
- **What it does:** Sends a request to create a new user account.
- **Why it's needed:** Allows new users to sign up for the application.
- **How it works:** Takes an object containing user details (like username, password, email, etc.) and sends it to the `/auth/register` endpoint via an HTTP POST request.
- **Parameters:**
  - `data` (object): The information for the new user.
- **Returns:** A Promise that resolves with the server's response upon successful registration.

```javascript
export const registerUser = (data) =>
  client.post('/auth/register', data);
```

## Key Concepts
- **API Request:** Sending a message over the internet to a server to get data or perform an action.
- **HTTP POST Method:** A specific type of API request used when you are sending *new* data to the server (like a new set of login credentials or a new user registration form).
- **Promises:** In JavaScript, network requests take time. A Promise is like an IOU; it says, "I don't have the data right now, but I promise to let you know when I do (or if an error happens)."

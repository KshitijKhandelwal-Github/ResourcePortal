# API Client Configuration (`client.js`)

## Overview
This file is the foundation for all network requests in our frontend application. Instead of configuring the server URL and security headers every single time we want to ask the server for data, we configure a single "client" here and reuse it everywhere.

## Imports
- `axios` from `'axios'`: Axios is a popular third-party library for making HTTP requests from the browser. It's easier to use and has more features than the built-in browser `fetch` tool.

## Variables

### `client`
- **What it does:** It creates a customized version of Axios tailored for our specific backend.
- **How it works:** 
  - `baseURL`: It sets the default starting URL for all requests (`http://127.0.0.1:8000/api/v1`). If we say `client.get('/users')`, it knows to actually go to `http://127.0.0.1:8000/api/v1/users`.
  - `headers`: It tells the server we are sending data in JSON format (`application/json`).

```javascript
const client = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Interceptors

Interceptors are like security checkpoints that every single network request or response must pass through.

### Request Interceptor
- **What it does:** Automatically attaches a security "token" to every outgoing request.
- **Why it's needed:** After you log in, the server gives you a secret token. To prove you are logged in for future requests, you must show this token. Doing this manually for every request is tedious.
- **How it works:** Before a request leaves the browser, it looks in the browser's `localStorage` (a place to save data) for a `token`. If it finds one, it adds it to the request's `Authorization` header.

```javascript
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor
- **What it does:** Checks every response coming back from the server for authentication errors.
- **Why it's needed:** If your session expires or your token becomes invalid, the server will reject your requests with a `401 Unauthorized` error. The app needs to know to log you out when this happens.
- **How it works:** 
  - If the request is successful, it just passes the response along.
  - If there is an error, it checks if the status code is `401`. If so, it deletes your saved token and user data from `localStorage`, and redirects you back to the `/login` page.

```javascript
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Key Concepts
- **Axios Instance:** A pre-configured tool for making network requests.
- **Interceptors:** Functions that run automatically before a request is sent or after a response is received, acting like a middleman.
- **JWT (JSON Web Tokens) / Bearer Token:** A secure string of characters used to prove your identity to the server after you've logged in.
- **localStorage:** A small database inside your web browser where websites can save data (like your login token) so it survives even if you close the tab.

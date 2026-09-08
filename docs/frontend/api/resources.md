# Resources API (`resources.js`)

## Overview
This file manages all the communication with the server regarding "Resources" (which, in this portal, usually refers to employees or team members). It provides functions for the complete set of CRUD operations: Create, Read, Update, and Delete.

## Imports
- `client` from `./client`: Our custom network request tool that handles the base URL and authentication tokens.

## Functions

### `getResources(params)`
- **What it does:** Fetches a list of multiple resources.
- **Why it's needed:** Used to populate the main table or list on the Resources page.
- **Parameters:** `params` (optional object) - Used for filtering, sorting, or pagination (e.g., getting page 2 of results).
- **How it works:** Sends an HTTP GET request to `/resources`.

### `getResource(employeeId)`
- **What it does:** Fetches the details of one specific resource.
- **Why it's needed:** Used when you click on a specific employee to view their full profile.
- **Parameters:** `employeeId` (string/number) - The unique ID of the employee.
- **How it works:** Sends an HTTP GET request to `/resources/123` (if the ID is 123).

### `createResource(data)`
- **What it does:** Adds a brand new resource to the system.
- **Why it's needed:** Used when filling out the "Add New Employee" form.
- **Parameters:** `data` (object) - The details of the new resource (name, skills, etc.).
- **How it works:** Sends an HTTP POST request to `/resources` with the new data.

### `updateResource(employeeId, data)`
- **What it does:** Modifies the details of an existing resource.
- **Why it's needed:** Used when you edit an employee's profile to change their location, skills, or status.
- **Parameters:** 
  - `employeeId` (string/number): The ID of the employee to update.
  - `data` (object): The new, updated information.
- **How it works:** Sends an HTTP PUT request to `/resources/{employeeId}`.

### `deleteResource(employeeId)`
- **What it does:** Removes a resource from the system entirely.
- **Why it's needed:** Used for terminating or removing records.
- **Parameters:** `employeeId` (string/number): The ID of the employee to remove.
- **How it works:** Sends an HTTP DELETE request to `/resources/{employeeId}`.

## Code Snippet Example
```javascript
export const updateResource = (employeeId, data) =>
  client.put(`/resources/${employeeId}`, data);
```

## Key Concepts
- **CRUD Operations:** An acronym for Create, Read, Update, and Delete—the four basic functions needed to manage data in almost any software application.
- **RESTful API:** A standard way of designing APIs where the URL indicates *what* you are talking about (e.g., `/resources`) and the HTTP method indicates *what you want to do* with it (GET to read, POST to create, PUT to update, DELETE to remove).
- **URL Parameters:** Dynamic parts of a URL path. In `/resources/${employeeId}`, the `${employeeId}` part changes depending on which employee you are dealing with.

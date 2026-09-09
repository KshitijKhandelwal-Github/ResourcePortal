# Dashboard API (`dashboard.js`)

## Overview
This file contains all the network request functions specifically related to fetching data for the application's dashboard. It organizes these requests into neat, easy-to-use functions.

## Imports
- `client` from `./client`: The pre-configured Axios client that automatically handles our base URL and security tokens.

## Functions

All functions in this file follow the exact same pattern. They send an HTTP GET request to the server to fetch data, and they optionally accept a `params` object to filter or modify the results.

### `getDashboardSummary(params)`
- **What it does:** Fetches the top-level summary statistics for the dashboard (e.g., total resources, total available, etc.).
- **Parameters:** `params` (optional object) - Query parameters to filter the data (like date ranges).
- **Returns:** A Promise with the summary data.

### `getDashboardSkills(params)`
- **What it does:** Fetches data about the distribution of different skills across the workforce.

### `getDashboardLocation(params)`
- **What it does:** Fetches data regarding where resources/employees are geographically located.

### `getDashboardExperience(params)`
- **What it does:** Fetches data breaking down the workforce by their years of experience.

### `getDashboardTraining(params)`
- **What it does:** Fetches data on employees currently undergoing or scheduled for training.

### `getDashboardAvailability(params)`
- **What it does:** Fetches a breakdown of resource availability (who is available, busy, on leave, etc.).

## Example Snippet

```javascript
export const getDashboardSummary = (params = {}) =>
  client.get('/dashboard/summary', { params });
```
*(Notice how `{ params }` is passed as the second argument. This translates into the URL looking something like `/dashboard/summary?department=engineering` if `params` was `{ department: 'engineering' }`)*

## Key Concepts
- **HTTP GET Method:** A type of API request used strictly for *retrieving* data from the server without changing anything.
- **Query Parameters (`params`):** Extra pieces of information tacked onto the end of a URL to filter or organize the requested data.
- **Modularity:** Grouping related code together. By putting all dashboard APIs in one file, it's easier to find and maintain them.

# Dashboard Page (`DashboardPage.jsx`)

The Dashboard Page gives users a high-level, visual overview of the resources in the system. It displays key statistics (like total resources or those on leave) and renders several charts to break down resources by technology, location, experience, and availability.

## Imports

```javascript
import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardSummary, getDashboardSkills, getDashboardLocation, getDashboardExperience, getDashboardTraining, getDashboardAvailability } from '../api/dashboard';
import { getClusters } from '../api/clusters';
import { getSkills } from '../api/skills';
import { getLocations } from '../api/locations';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
```

- **React Hooks**: `useState`, `useEffect`, and `useCallback` manage state and side effects.
- **Recharts**: A charting library for React used to draw the bar charts and pie charts.
- **API Functions**: Functions to fetch the statistical data for the charts and dropdown options for the filters.
- **UI Components**: `StatCard` for the summary numbers and `LoadingSpinner` for the loading state.

## Components and Logic

### `CustomTooltip`
- **What it does**: A small helper component that formats the pop-up box you see when you hover over a chart element.
- **Why it's needed**: Recharts provides a default tooltip, but building a custom one ensures it matches the dark-themed styling of the application.

### `DashboardPage` (Main Component)
- **What it does**: Retrieves dashboard data from the backend, handles user filtering, and renders the charts and summary cards.
- **How it works**:
  - **State**: Maintains several state variables for different charts (`skillsData`, `locationData`, etc.) and a `filters` state object that keeps track of the currently selected dropdown options.
  - **`loadFilters()`**: Runs once when the page loads to fetch the available clusters, skills, and locations to populate the filter dropdowns.
  - **`loadDashboard()`**: Wrapped in a `useCallback`, this function gathers the current `filters` and makes multiple API calls in parallel using `Promise.all()`. This fetches the specific data needed for the summary cards and each individual chart.
  - **`handleFilterChange(key, value)`**: Updates the filter state whenever the user changes a dropdown. Because `loadDashboard` depends on `filters`, the data automatically refreshes when a filter is changed.

## UI Structure
1. **Filter Bar**: Dropdowns allowing the user to narrow down the dashboard data.
2. **Summary Cards**: Quick numbers showing Total Resources, Available, Allocated, etc., using the `StatCard` component.
3. **Chart Grid**: Displays multiple `Recharts` components:
   - A Bar Chart for Technology Distribution (Skills).
   - A Bar Chart for Location Distribution.
   - A Bar Chart for Experience Distribution.
   - A Pie Chart for Availability Status.
   - A horizontal Bar Chart for Training Status.

## Key Concepts

- **Data Visualization**: Utilizing third-party libraries (like `recharts`) to translate raw data arrays into visual graphs.
- **Parallel Asynchronous Fetching**: `Promise.all([...])` is used to trigger multiple network requests at the exact same time, rather than waiting for one to finish before starting the next. This drastically reduces the page's loading time.
- **Derived/Filtered State**: The charts react and re-fetch data based on the parameters set in the `filters` state object.
- **`useCallback` Hook**: Caches the `loadDashboard` function so it isn't recreated on every render, preventing unnecessary infinite loops when used inside the `useEffect` dependency array.

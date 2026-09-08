# Executive Analytics Dashboard: `DashboardPage.jsx`

Source File: [`frontend/src/pages/DashboardPage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/DashboardPage.jsx)

---

## 1. Overview & Purpose

The [`DashboardPage.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/pages/DashboardPage.jsx) component provides an **executive analytics dashboard** offering real-time visibility into organization resources, technology competencies, geographic distribution, and staffing availability.

It features interactive filters, high-level KPI cards, and multiple charts (bar charts, pie charts, and horizontal progress charts) powered by the **Recharts** visualization library. Whenever filters change, all analytical metrics re-aggregate concurrently.

> **Analogy:** Think of `DashboardPage` as the mission control room in a space center. Huge digital video walls display satellite telemetry, fuel status, and trajectory charts. Operators can flip switches (filters) to narrow down the view to a specific rocket or launchpad, and all the screens update simultaneously.

---

## 2. Imports & Dependencies

```javascript
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardSummary, getDashboardSkills, getDashboardLocation, getDashboardExperience, getDashboardTraining, getDashboardAvailability } from '../api/dashboard';
import { getClusters } from '../api/clusters';
import { getSkills } from '../api/skills';
import { getLocations } from '../api/locations';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
```

### Explanation of Imports:
* **`recharts` components**:
  * `ResponsiveContainer`: Automatically resizes charts to fit parent container widths.
  * `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`: Components that draw coordinate axes, gridlines, hover tooltips, and rectangular vertical/horizontal bars.
  * `PieChart`, `Pie`, `Cell`: Draws circular pie slices with custom color fills.
* **Dashboard & Filter API modules**:
  * [`api/dashboard.js`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/dashboard.js): Endpoints returning aggregated metrics.
  * `clusters`, `skills`, `locations`: Master lookup endpoints populating the filter dropdowns.
* **[`StatCard`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/StatCard.jsx)**: Component rendering individual KPI numbers.
* **[`LoadingSpinner`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/LoadingSpinner.jsx)**: Centered spinner shown during initial data loads.

---

## 3. State Management

```javascript
const [summary, setSummary] = useState(null);
const [skillsData, setSkillsData] = useState([]);
const [locationData, setLocationData] = useState([]);
const [experienceData, setExperienceData] = useState([]);
const [trainingData, setTrainingData] = useState([]);
const [availabilityData, setAvailabilityData] = useState([]);
const [clusters, setClusters] = useState([]);
const [skills, setSkills] = useState([]);
const [locations, setLocations] = useState([]);
const [loading, setLoading] = useState(true);

const [filters, setFilters] = useState({
  cluster_id: '',
  skill_id: '',
  location_id: '',
  availability_status: '',
});
```

* **Data States**: Hold JSON arrays returned by the dashboard API for charts and KPI cards.
* **Dropdown Option States**: Hold list of clusters, skills, and locations for `<select>` menus.
* **`filters` State**: Holds currently selected filter criteria.

---

## 4. Lifecycle & Data Fetching Flow

### 1. Initial Load: Filter Options
```javascript
useEffect(() => {
  loadFilters();
}, []);
```
* Runs once when the component mounts. Uses `Promise.all([getClusters(), getSkills(), getLocations()])` to fetch all dropdown options in parallel.

### 2. Reactive Data Loading: `loadDashboard`
```javascript
useEffect(() => {
  loadDashboard();
}, [filters]);
```
* **Dependency Array `[filters]`**: Whenever any filter dropdown changes, `useEffect` triggers `loadDashboard()`.

```javascript
const loadDashboard = async () => {
  setLoading(true);
  try {
    const params = {};
    if (filters.cluster_id) params.cluster_id = filters.cluster_id;
    if (filters.skill_id) params.skill_id = filters.skill_id;
    if (filters.location_id) params.location_id = filters.location_id;
    if (filters.availability_status) params.availability_status = filters.availability_status;

    const [sumRes, skillRes, locRes, expRes, trainRes, availRes] = await Promise.all([
      getDashboardSummary(params),
      getDashboardSkills(params),
      getDashboardLocation(params),
      getDashboardExperience(params),
      getDashboardTraining(params),
      getDashboardAvailability(params),
    ]);

    setSummary(sumRes.data);
    setSkillsData(skillRes.data);
    setLocationData(locRes.data);
    setExperienceData(expRes.data);
    setTrainingData(trainRes.data);
    setAvailabilityData(availRes.data);
  } catch (err) {
    console.error('Failed to load dashboard', err);
  } finally {
    setLoading(false);
  }
};
```
* **Parallel Optimization (`Promise.all`)**: Issues all 6 analytical API calls concurrently, dramatically reducing wait times compared to calling them one by one sequentially (`await` chaining).

---

## 5. Visual Dashboard Sections

### A. Summary KPI Cards
Renders 5 metric cards across a responsive grid:
1. **Total Resources** (Black)
2. **Available** (Forest Green)
3. **Allocated** (Blue)
4. **On Training** (Orange)
5. **On Leave** (Red)

### B. Interactive Charts
1. **Technology Distribution**: Vertical bar chart showing employee counts per technology skill (`XAxis` labels angled at -30°).
2. **Location Distribution**: Bar chart displaying headcount grouped by office city.
3. **Experience Distribution**: Bar chart categorizing workforce by years of experience.
4. **Availability Status**: Pie chart showing proportional allocation breakdown with colored slices via `<Cell />`.
5. **Training Status Overview**: Horizontal bar chart (`layout="vertical"`) showing status of ongoing learning courses.

---

## 6. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **`Promise.all` Concurrent Fetching** | Executing multiple asynchronous operations simultaneously and waiting for all to resolve, speeding up page load times. |
| **Declarative Charting (Recharts)** | Constructing complex SVG charts using composable React components (`<BarChart>`, `<Bar>`, `<Pie>`) instead of drawing on HTML canvas manually. |
| **Reactive Filter Pattern** | Storing filter criteria in state and placing that state into `useEffect`'s dependency array so data re-fetches automatically whenever filters change. |
| **Responsive Containers** | Components like `<ResponsiveContainer>` that measure parent element dimensions and resize visualizations dynamically. |
| **Dynamic Form State Immutability** | Updating state using functional updates (`setFilters(prev => ({ ...prev, [key]: value }))`) to avoid mutating previous state directly. |

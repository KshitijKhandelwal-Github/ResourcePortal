# Dashboard & Analytics API Services: `api/dashboard.js`

Source File: [`frontend/src/api/dashboard.js`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/dashboard.js)

---

## 1. Overview & Purpose

The [`api/dashboard.js`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/dashboard.js) module provides functions to fetch **aggregated analytical and statistical data** for the visual dashboard.

Rather than sending thousands of raw records to the browser and requiring the frontend to count, bucket, and group them, the backend performs high-speed database aggregations and returns pre-computed datasets. These endpoints power the KPI summary cards, bar charts, and pie charts rendered on the Dashboard page.

> **Analogy:** Think of `api/dashboard.js` as an executive briefing dashboard. Instead of bringing the CEO a box containing 5,000 employee personnel files to read through, it delivers concise charts: "Here is the head count, here is the technology distribution, and here is how many people are on leave."

---

## 2. Imports & Dependencies

```javascript
import client from './client';
```

* **[`client`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/api/client.js)**: Configured Axios instance with authentication interceptors and the API base URL.

---

## 3. Function Explanations & Specifications

Each function in this file accepts an optional `params` object containing global dashboard filters (`cluster_id`, `skill_id`, `location_id`, `availability_status`), allowing users to slice and dice metrics dynamically.

### 1. `getDashboardSummary(params = {})`
* **Route:** `GET /dashboard/summary`
* **What it does:** Returns total headcount numbers broken down by availability status.
* **Returns:** Promise resolving to:
  ```json
  {
    "total": 120,
    "available": 45,
    "allocated": 60,
    "on_training": 10,
    "on_leave": 5
  }
  ```

---

### 2. `getDashboardSkills(params = {})`
* **Route:** `GET /dashboard/skills`
* **What it does:** Aggregates employee counts across primary technologies/skills for the technology distribution bar chart.
* **Returns:** Promise resolving to an array of objects:
  ```json
  [
    { "skill_name": "Python", "count": 28 },
    { "skill_name": "React", "count": 24 },
    { "skill_name": "Java", "count": 18 }
  ]
  ```

---

### 3. `getDashboardLocation(params = {})`
* **Route:** `GET /dashboard/location`
* **What it does:** Aggregates resource counts grouped by geographic cities/offices.
* **Returns:** Promise resolving to:
  ```json
  [
    { "location_name": "Bangalore", "count": 55 },
    { "location_name": "Hyderabad", "count": 40 },
    { "location_name": "Pune", "count": 25 }
  ]
  ```

---

### 4. `getDashboardExperience(params = {})`
* **Route:** `GET /dashboard/experience`
* **What it does:** Buckets resources into seniority bands (e.g., "0-2 yrs", "3-5 yrs", "5-8 yrs", "8+ yrs").
* **Returns:** Promise resolving to:
  ```json
  [
    { "range": "0-2 years", "count": 30 },
    { "range": "3-5 years", "count": 45 },
    { "range": "5+ years", "count": 45 }
  ]
  ```

---

### 5. `getDashboardTraining(params = {})`
* **Route:** `GET /dashboard/training`
* **What it does:** Summarizes training initiatives by status (`Planned`, `In Progress`, `Completed`).
* **Returns:** Promise resolving to training statistics used in the horizontal training bar chart.

---

### 6. `getDashboardAvailability(params = {})`
* **Route:** `GET /dashboard/availability`
* **What it does:** Formats allocation numbers specifically for pie chart visualization.
* **Returns:** Promise resolving to status-to-count objects:
  ```json
  [
    { "status": "Available", "count": 45 },
    { "status": "Allocated", "count": 60 },
    { "status": "On Training", "count": 10 },
    { "status": "On Leave", "count": 5 }
  ]
  ```

---

## 4. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **Server-Side Aggregation** | Computing sums, averages, and group counts in the SQL database rather than looping over all raw rows in JavaScript on the client. |
| **Data Visualization Pipelines** | Transforming raw database counts into structured JSON arrays designed specifically to feed charting libraries like Recharts. |
| **Filtered Analytics** | Passing filter arguments in API parameters so all chart endpoints reflect identical filtering criteria simultaneously. |

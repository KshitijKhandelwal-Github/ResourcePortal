# Metric Display Card: `StatCard.jsx`

Source File: [`frontend/src/components/StatCard.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/StatCard.jsx)

---

## 1. Overview & Purpose

The [`StatCard.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/StatCard.jsx) component is a **reusable metric presentation card** used primarily across dashboards and summaries.

It renders a clean KPI (Key Performance Indicator) card featuring an uppercase category title, an eye-catching numerical metric, and an accent-colored vertical stripe on the left border.

> **Analogy:** Think of `StatCard` as an instrument gauge on a car's dashboard (speedometer, fuel gauge, odometer). Each gauge presents a single critical measurement in large, clear numbers with a color-coded indicator.

---

## 2. Imports & Dependencies

```javascript
import React from 'react';
```

* **`React`**: Core React library.

---

## 3. Component Breakdown & Props

```javascript
const StatCard = ({ title, value, color = 'var(--primary)' }) => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      padding: '20px 24px',
      borderLeft: `4px solid ${color}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      minWidth: '160px',
      flex: '1',
    }}>
      <div style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
        {value}
      </div>
    </div>
  );
};

export default StatCard;
```

### Parameters / Props:

| Prop | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | *(Required)* | Label displayed at the top in uppercase (e.g. `'Total Resources'`). |
| `value` | `number \| string` | *(Required)* | Primary metric number to emphasize (e.g. `120`, `45`). |
| `color` | `string` | `'var(--primary)'` | Accent color for the 4px vertical bar on the left edge. |

### Styling Features:
* **`borderLeft: 4px solid ${color}`**: Dynamically applies a color-coded identity (e.g. green for available, blue for allocated, orange for training, red for on-leave).
* **`boxShadow: 0 1px 3px rgba(0,0,0,0.08)`**: Provides subtle depth separation against the light gray background.
* **`flex: 1; minWidth: 160px`**: Ensures cards stretch evenly across grid rows while preserving readability on smaller screen widths.

---

## 4. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **Reusable UI Component** | Creating a single component with props so the exact same card layout can be used dozens of times without repeating code. |
| **Default Prop Values** | Assigning fallback values in function arguments (e.g. `color = 'var(--primary)'`) in case the caller doesn't specify one. |
| **Inline Styles in React** | Applying styles via a JavaScript object (`style={{ ... }}`) where CSS properties are written in camelCase. |

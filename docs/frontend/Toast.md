# Ephemeral Alert Notification: `Toast.jsx`

Source File: [`frontend/src/components/Toast.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Toast.jsx)

---

## 1. Overview & Purpose

The [`Toast.jsx`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/components/Toast.jsx) component provides a **floating, self-dismissing notification banner** in the top-right corner of the browser window.

It communicates status updates to users (e.g. "Resource updated successfully", "Failed to delete resource", "User created") without obstructing the main user workflow or requiring modal confirmations.

> **Analogy:** Like a slice of bread that pops up from a toaster, a toast notification pops up onto the screen, announces that an action has completed, and automatically disappears after a few seconds if you don't dismiss it manually.

---

## 2. Imports & Dependencies

```javascript
import React, { useEffect } from 'react';
```

* **`React`**: Base library.
* **`useEffect`**: React lifecycle hook used to set up the 3-second automatic dismissal timer and clean it up when unmounting.

---

## 3. Component Breakdown & Props

```javascript
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? '#d32f2f' : type === 'warning' ? '#f57c00' : '#2E7D32';

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: bgColor,
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      zIndex: 10000,
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '400px',
    }}>
      <span>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', color: '#fff',
        cursor: 'pointer', fontSize: '18px', padding: '0', lineHeight: '1',
      }}>×</button>
    </div>
  );
};

export default Toast;
```

### Parameters / Props:

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `message` | `string` | *(Required)* | The textual status message displayed inside the alert. |
| `type` | `string` | `'success'` | Category of alert: `'success'` (green), `'warning'` (orange), or `'error'` (red). |
| `onClose` | `function` | *(Required)* | Callback function invoked to hide or remove the toast. |

---

## 4. Lifecycle & Timer Mechanics

### Auto-Dismissal with `useEffect`:
1. When `<Toast>` mounts, `useEffect` executes `setTimeout(onClose, 3000)`.
2. This schedules the `onClose` callback to run after **3,000 milliseconds (3 seconds)**.
3. **Timer Cleanup:** The return function `() => clearTimeout(timer)` ensures that if the user manually clicks the `×` close button before 3 seconds elapse, the pending timer is cancelled immediately. This prevents memory leaks and avoids attempting to close a component that has already unmounted.

---

## 5. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **`useEffect` Hook** | Lets you perform side effects (timers, data fetching, event listeners) in functional components. |
| **Cleanup Functions in `useEffect`** | Functions returned by `useEffect` that run when the component unmounts or before re-running the effect, preventing memory leaks (`clearTimeout`). |
| **Fixed Overlay Positioning** | Using `position: fixed` with coordinates (`top: 20px, right: 20px`) and high `zIndex` to float above all other page content. |
| **Ternary Operator Chains** | Concise conditional syntax (`condition ? val1 : condition2 ? val2 : val3`) to choose colors based on `type`. |

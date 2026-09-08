# Toast Component Documentation

The `Toast` component is a small, temporary notification popup that appears on the screen to inform the user about the result of an action (like "Profile saved successfully!" or "Error: password incorrect"). 

*Note: It gets its name because it traditionally pops up from the bottom of the screen, like toast popping out of a toaster.*

## Imports

- `useEffect` from `react`: A hook that allows the component to perform "side effects"—in this case, setting up a timer as soon as the component appears on the screen.

## Component: `Toast`

### What it does
It displays a small colored notification box in the top-right corner of the screen. After a few seconds, it automatically disappears. It also includes an "X" button so the user can close it manually before the timer runs out.

### Why it's needed
When a user performs an action (like clicking "Save"), they need immediate feedback to know if it worked or failed. A toast provides this feedback without interrupting their workflow or forcing them to click "OK" on an annoying popup alert.

### How it works
1. **Auto-dismiss:** When the Toast is created, `useEffect` starts a timer using `setTimeout`. After 3.2 seconds (3200 milliseconds), the timer automatically triggers the `onClose` function to hide the toast. 
2. **Cleanup:** If the user manually clicks the "X" button before the timer finishes, the toast disappears, and a cleanup function (`clearTimeout`) stops the timer so it doesn't cause errors behind the scenes.
3. **Styling:** It checks the `type` parameter (error, warning, or success) and sets a specific accent color (red, orange, or green). It then renders a floating box using absolute positioning (`position: 'fixed'`).

### Parameters
- **`message` (String):** The text to display inside the notification.
- **`type` (String):** *Optional.* The category of the message (`'success'`, `'error'`, or `'warning'`). Defaults to `'success'`.
- **`onClose` (Function):** The function that hides the toast. It gets called by the timer or when the "X" button is clicked.

### Return Value
Returns JSX representing the floating notification box.

### Code Snippet Highlight
```jsx
useEffect(() => {
  const timer = setTimeout(onClose, 3200);
  return () => clearTimeout(timer);
}, [onClose]);
```
*This is the heart of the auto-close feature. The `setTimeout` says "Wait 3.2 seconds, then run `onClose`". The `return () => clearTimeout(timer)` is a cleanup rule that says "If this toast is removed from the screen early, cancel the timer so it doesn't try to close a toast that's already gone."*

## Key Concepts

- **`useEffect` Hook:** A React tool used for running code when a component is born (mounts), changes, or dies (unmounts). Managing timers is one of its most common uses.
- **SetTimeout / ClearTimeout:** Standard JavaScript functions for delaying the execution of code.
- **Fixed Positioning:** A CSS technique (`position: 'fixed'`) that allows you to attach an element to a specific place on the screen (like the top right) so it stays there even if the user scrolls down the page.

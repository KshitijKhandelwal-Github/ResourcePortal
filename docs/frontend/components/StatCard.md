# StatCard Component Documentation

The `StatCard` component is a small, reusable visual block used to display a single, important piece of data or statistic. You might use several of these side-by-side on a dashboard.

## Imports

*There are no external imports in this file.*

## Component: `StatCard`

### What it does
It takes a title and a numerical value (or short text) and displays them inside a cleanly styled, rectangular card. The card features a colored strip on its left edge to help categorize or highlight the statistic.

### Why it's needed
Dashboards need to present complex data quickly and clearly. Stat cards isolate key metrics (like "Total Users", "Active Projects", or "Revenue") and make them highly visible and easy to read at a glance.

### How it works
The component is a simple presentational block. It accepts the text to display and a color. It applies inline CSS styles to create a white box with a shadow, rounded corners, and a left border matching the provided color. Inside the box, it formats the title to be small and gray, and the value to be large and bold.

### Parameters
- **`title` (String):** The small text label describing what the statistic is (e.g., "Total Employees").
- **`value` (String or Number):** The large text representing the actual data (e.g., "1,240").
- **`color` (String):** *Optional.* The color of the left border accent. If not provided, it defaults to a greenish color (`#10b981`).

### Return Value
Returns JSX representing the styled rectangular card.

### Code Snippet Highlight
```jsx
const StatCard = ({ title, value, color = '#10b981' }) => {
// ...
      borderLeft: `4px solid ${color}`,
```
*Here, we see the use of a "default parameter". If the programmer forgets to pass a `color` when using `<StatCard>`, it automatically uses `#10b981`. We also see "string interpolation" (`${color}`), which injects that color variable directly into the CSS rule.*

## Key Concepts

- **Presentational Component:** This component has no complicated logic or state; its only job is to take data and make it look pretty on the screen.
- **Default Props / Default Parameters:** A safety net feature in JavaScript that allows you to provide a fallback value if a specific piece of information isn't provided.
- **Flexbox (`display: 'flex'`):** A CSS layout system used here to ensure the card expands or shrinks appropriately to fill available space (`flex: '1'`) and vertically centers its internal text (`flexDirection: 'column'`, `justifyContent: 'center'`).

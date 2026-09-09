# Global Styles (`index.css`)

## Overview
This file contains the global CSS (Cascading Style Sheets) for the entire application. It acts as the design system, defining the colors, typography, structural layout, and reusable styles for common elements like buttons, forms, and cards.

## Key Sections and How They Work

### CSS Variables (`:root`)
At the very top, you will see a block inside `:root`. These are custom CSS variables.
- **What they do:** They define a central color palette. For example, `--primary: #10b981;` defines the main green color.
- **Why it's needed:** Instead of typing `#10b981` hundreds of times, we type `var(--primary)`. If we ever want to change the company color to blue, we only have to change it in this one spot, and the entire app updates instantly.

```css
:root {
  --primary: #10b981;
  --black: #09090b;
  --bg: #fafafa;
  /* ... */
}
```

### Global Reset (`*` and `body`)
- The `*` rule removes default margins and padding from all HTML elements so we have a clean slate.
- The `body` rule sets the default font family, text color, and background color for the entire webpage.

### Layout (`.layout`, `.sidebar`, `.main-content`)
These classes dictate how the main pieces of the app fit on the screen.
- The app uses **Flexbox** (`display: flex`) to arrange items.
- The `.sidebar` is fixed (`position: fixed`) to the left side of the screen, meaning it won't move when you scroll.
- The `.main-content` is given a margin on the left (`margin-left: 240px;`) exactly equal to the width of the sidebar so they don't overlap.

### Reusable Components

Instead of writing unique styles for every single button or table, this file defines reusable "classes".

- **Buttons (`.btn`, `.btn-primary`, `.btn-secondary`):** Defines standard padding, rounded corners, and hover effects. To make a primary button anywhere in the app, a developer just adds `className="btn btn-primary"`.
- **Forms (`input`, `select`):** Ensures all text boxes look uniform with standardized borders and focus rings (when you click into them).
- **Tables (`.data-table`):** Defines clean, lined tables for displaying data grids.
- **Cards (`.card`):** Creates white boxes with slight shadows, used to group related information together nicely on the dashboard.
- **Badges (`.badge`):** Small, colorful pills used to show status (like "Available", "In Progress", or "On Leave").

### Specific Pages
Towards the bottom, there are specific styles for complex pages, like the `.login-page` which includes centering content vertically and horizontally, and a decorative radial gradient background effect.

## Key Concepts
- **CSS Variables (Custom Properties):** A way to store values (like colors or sizes) in one place and reuse them throughout your stylesheet.
- **Flexbox & Grid:** Modern CSS layout systems used to align elements in rows (Flexbox) or complex grids (CSS Grid) easily.
- **Pseudo-classes (`:hover`, `:focus`, `:disabled`):** Styles that only apply when a user interacts with an element (e.g., hovering the mouse over a button, or clicking into a text field).

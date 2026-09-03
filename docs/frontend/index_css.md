# Global Stylesheet: `index.css`

Source File: [`frontend/src/index.css`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/index.css)

---

## 1. Overview & Purpose

The [`index.css`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/index.css) file is the **central design system and global stylesheet** of the frontend application. 

Instead of relying on heavy third-party CSS frameworks (like Bootstrap or Tailwind), this project implements a clean, tailored, and lightweight CSS architecture using modern CSS custom properties (variables), CSS Grid, and Flexbox. It ensures visual consistency across buttons, navigation bars, tables, form fields, badges, and layout structures.

> **Analogy:** If HTML and React components are the bare concrete walls, doors, and furniture in a building, [`index.css`](file:///Users/kshitijkhandelwal_1/VSCode/ResourcePortal/ResourcePortal/frontend/src/index.css) is the interior design manual—specifying the exact paint palette, typography, door handle shapes, and hallway widths.

---

## 2. CSS Custom Properties (Theme Variables)

At the very top of the file, `:root` declares reusable variables accessible across the entire stylesheet:

```css
:root {
  --primary: #2E7D32;           /* Primary brand green */
  --primary-dark: #1B5E20;      /* Dark green for sidebar and hover states */
  --primary-light: #4CAF50;     /* Accent green for chart bars and highlights */
  --primary-very-light: #C8E6C9;/* Mint tint for badges and skill tags */
  --black: #1a1a1a;             /* Dark text and top navbar */
  --dark-gray: #333;            /* Form labels and subtitles */
  --gray: #666;                 /* Secondary text and icons */
  --light-gray: #999;           /* Placeholder text and subtle hints */
  --border: #e0e0e0;            /* Clean borders for cards and tables */
  --bg: #f5f5f5;                /* Neutral light gray page background */
  --white: #ffffff;             /* Card and input background */
  --danger: #d32f2f;            /* Red for delete actions and errors */
  --warning: #f57c00;           /* Orange for alerts and training status */
  --info: #1976d2;              /* Blue for allocations and info badges */
}
```

### Why Use Variables?
* **Single Source of Truth:** Changing the green `--primary` hue here immediately updates buttons, navigation highlights, tags, and focus borders everywhere.
* **Consistency:** Prevents arbitrary hex codes from being scattered throughout the application.

---

## 3. Core Architectural Sections

### A. Box Sizing & Body Resets
```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--black);
  line-height: 1.5;
}
```
* `box-sizing: border-box`: Guarantees padding and borders are included in an element's total width and height, preventing accidental layout overflows.
* System font stack provides crisp native typography across macOS, Windows, and Linux.

### B. Shell Layout & Navigation
* **`.layout`**: A flexbox wrapper occupying `min-height: 100vh`.
* **`.sidebar`**: A fixed `220px` side panel anchored to the left (`position: fixed; top: 0; bottom: 0; left: 0; z-index: 100`).
* **`.main-content`**: Pushed right by `margin-left: 220px` to avoid clipping beneath the fixed sidebar.
* **`.navbar`**: Sticky header (`position: sticky; top: 0; z-index: 50`) that remains in view when scrolling.
* **`.content`**: Inner padding (`24px`) around page views.

### C. Reusable Buttons (`.btn-*`)
```css
button, .btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
```
* `.btn-primary`: Forest green fill for affirmative primary actions (Submit, Save, Add).
* `.btn-secondary`: White fill with subtle gray border for secondary actions (Cancel, Back, Filter).
* `.btn-danger`: Red fill for destructive actions (Delete, Remove).
* `.btn-sm`: Compact padding for table row actions.
* `.btn-logout`: Ghost-style button with transparent background for the dark navbar.

### D. Form Elements & Grids
* `input`, `select`, `textarea`: Full-width inputs with 1px border and custom green outline on `:focus` (`box-shadow: 0 0 0 2px var(--primary-very-light)`).
* `.form-group`: Standard vertical spacing (`margin-bottom: 16px`).
* `.form-row`: A two-column responsive grid (`grid-template-columns: 1fr 1fr; gap: 16px`) for side-by-side inputs.

### E. Tables & Data Display
* `.data-table`: Clean white background, collapsed borders, subtle drop shadow, and uppercase column headers.
* `.data-table tr:hover td`: Subtle hover highlight (`#fafafa`) for readability.
* `.data-table tr.clickable`: Displays cursor pointer for rows that navigate to details on click.

### F. Status Badges & Skill Tags
* `.badge`: Rounded pill badge (`border-radius: 12px`) used for status display.
  * `.badge-available`: Light green background with dark green text.
  * `.badge-allocated`: Light blue background with blue text.
  * `.badge-training`: Light orange background with orange text.
  * `.badge-leave`: Light pink background with red text.
* `.skill-tag`: Small chip used for displaying employee competencies; `.primary` receives a solid green fill.

### G. Dashboard & Analytical Grids
* `.stat-grid`: Responsive grid utilizing `repeat(auto-fill, minmax(180px, 1fr))` to automatically adapt metric cards across mobile, tablet, and desktop screens.
* `.chart-grid`: Two-column grid (`grid-template-columns: 1fr 1fr`) for analytics charts.

### H. Modals, Tabs, and Authentication Views
* `.login-page`: Full viewport height centered container with dark green backdrop.
* `.login-card`: Elevated floating white card with deep shadow (`0 8px 32px rgba(0,0,0,0.3)`).
* `.tabs` & `.tab.active`: Clean underline-style tab switching bar.

---

## 4. Key Concepts for Beginners

| Concept | Explanation |
| :--- | :--- |
| **CSS Custom Properties (Variables)** | Values defined once using `--name` and referenced with `var(--name)`. |
| **CSS Flexbox (`display: flex`)** | One-dimensional layout model ideal for aligning items in rows or columns (e.g. navbars, button groups). |
| **CSS Grid (`display: grid`)** | Two-dimensional layout system that handles both rows and columns simultaneously (e.g. form fields, dashboard cards). |
| **Sticky vs Fixed Positioning** | `fixed` remains pinned relative to the viewport at all times (sidebar); `sticky` behaves normally until scrolled past its threshold (navbar). |
| **Z-Index Layering** | Determines which elements sit on top of others along the screen depth (e.g. Modals > Navbar > Content). |

# Layout Component Documentation

The `Layout` component serves as the main structural container for the application's user interface. It acts like a picture frame, holding the navigation menus (Sidebar and Navbar) while displaying different "pictures" (pages) in the center based on where the user navigates.

## Imports

- `Outlet` from `react-router-dom`: This acts as a placeholder or a "window". When a user goes to a specific route (like `/dashboard`), the component for that route gets displayed exactly where `<Outlet />` is placed.
- `Navbar` from `./Navbar`: This brings in the top navigation bar component, which typically contains user information and actions like logout.
- `Sidebar` from `./Sidebar`: This brings in the side navigation menu component, which lets users click links to switch between different pages.

## Component: `Layout`

### What it does
It builds the visual skeleton of the application by putting the Sidebar on the left, the Navbar at the top, and leaving a designated space in the middle for the page content.

### Why it's needed
Without a layout component, you would have to manually add the Sidebar and Navbar to every single page of your app (Dashboard, Profile, Settings, etc.). The Layout component allows you to write this structure once and reuse it across all pages.

### How it works
The `Layout` is a functional component that returns a structured set of HTML `div` tags. It organizes the components using CSS classes (like `layout`, `main-content`, and `content`) to style and position them correctly on the screen.

### Parameters and Return Value
- **Parameters:** None.
- **Returns:** JSX (React's HTML-like code) containing the full structure of the app's shell.

### Code Snippet Highlight
```jsx
<div className="main-content">
  <Navbar />
  <div className="content">
    <Outlet />
  </div>
</div>
```
*In this snippet, you can see how the `Navbar` is placed at the top of the main content area, while the `<Outlet />` sits directly below it to display whatever specific page the user is currently visiting.*

## Key Concepts

- **Nested Routing (`<Outlet />`):** In React Router, an `Outlet` renders the child routes of a parent component. Think of it like a picture frame (the Layout) where you can easily swap out the picture (the Outlet) without changing the frame.
- **Functional Components:** A fundamental building block in React. It's a simple JavaScript function that returns what the screen should look like.

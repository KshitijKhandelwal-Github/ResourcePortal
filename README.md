# Resource Portal

The Resource Management & Skill Tracking Portal is a full-stack web application designed for teams to manage resources, track skills, certifications, and training. It uses FastAPI and SQLite for the backend, and React + Vite for the frontend.

## 🚀 Quick Setup Guide

Follow these steps to get the project up and running locally. You can copy and paste these commands directly into your terminal.

### 1. Prerequisites
Ensure you have the following installed:
- Python 3.10+ (Recommended: 3.14)
- [uv](https://github.com/astral-sh/uv) (for ultra-fast Python package management)
- Node.js (v18+) and npm

### 2. Clone the Repository
```bash
git clone https://github.com/kshitijj-khandelwal/ResourcePortal.git
cd ResourcePortal
```

### 3. Backend Setup

First, create the environment configuration file:
```bash
cp .env.example .env
```
*(Optional: Open `.env` and configure your `SECRET_KEY` for production, though the default is fine for local development).*

Next, start the FastAPI backend server:
```bash
uv run python run.py
```
*The API will start at `http://127.0.0.1:8000`. The database will be automatically seeded with dummy data if it's empty.*

Keep this terminal open!

### 4. Frontend Setup

Open a **new** terminal window, navigate to the frontend directory, and start the React app:
```bash
cd ResourcePortal/frontend
npm install
npm run dev
```
*The frontend will be available at `http://localhost:5173`.*

---

## 🎯 Example Walkthrough

Once both servers are running, follow this quick walkthrough to explore the portal:

### Step 1: Log in
1. Open your browser and go to `http://localhost:5173`.
2. You will be greeted by the login screen.
3. Use the following seeded Admin credentials to log in:
   - **Username**: `admin`
   - **Password**: `admin123`
*(Other available accounts: `manager1`/`manager123` for senior associate view, `user1`/`user123` for standard user view).*

### Step 2: Explore the Dashboard
After logging in, you'll land on the **Dashboard**:
- **Summary Cards**: View total resources, available, allocated, on training, and on leave statuses.
- **Charts**: See the distribution of skills, locations, and experience ranges across the team.

### Step 3: Manage Resources
1. Navigate to **Resources** using the sidebar.
2. Here you can see a paginated list of all employees.
3. **Filter**: Use the filters at the top to search for a specific skill (e.g., "Python") or location (e.g., "Bangalore").
4. **View Details**: Click "View" on any resource to see their detailed profile, including their primary/secondary skills, training records, and certifications.

### Step 4: Add a New Resource (Admin/Manager only)
1. On the Resources page, click **"Add Resource"**.
2. Fill out the form with sample data:
   - Employee ID: `EMP999`
   - Name: `Jane Doe`
   - Email: `jane@example.com`
   - Cluster: `AI/ML`
   - Experience: `4` years
3. Click **Save**. The new resource will now appear in your portal!

### Step 5: Test the API Docs (Swagger UI)
1. Navigate to `http://127.0.0.1:8000/docs` in your browser.
2. This is the interactive Swagger API documentation.
3. You can click "Authorize" (top right), paste your bearer token from the frontend, and test API routes directly from the browser!

---

## 📚 Documentation

Detailed documentation for the codebase is available in the `docs/` directory, broken down into:
- **`docs/backend/`**: Covers API routers, database models, schemas, and services.
- **`docs/frontend/`**: Covers React components, pages, API clients, and contexts.

## Project Structure
```
ResourcePortal/
├── src/resourceportal/       # FastAPI Backend Source
│   ├── models/               # SQLAlchemy Models
│   ├── routers/              # API Endpoints
│   ├── schemas/              # Pydantic Validation Schemas
│   ├── services/             # Business Logic
│   └── database/             # SQLite Configuration & Seeding
├── frontend/                 # React + Vite Frontend
│   ├── src/components/       # Reusable UI Components
│   ├── src/pages/            # Main Views (Dashboard, Resources, etc)
│   ├── src/api/              # Axios API Clients
│   └── src/contexts/         # React Context (Auth)
├── docs/                     # Generated Documentation
├── .env                      # Environment Variables
├── pyproject.toml            # Python Dependencies
└── run.py                    # Backend Entry Point
```

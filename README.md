# Resource Portal

## Prerequisites

- Python 3.14 or later
- `uv`
- Node.js and npm for the React frontend

## Configuration

Create a `.env` file in the project root, beside `pyproject.toml` and `run.py`:

```env
SECRET_KEY=development-only-resourceportal-key
DATABASE_URL=sqlite:///./resource_portal.db
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Use a long, randomly generated value for `SECRET_KEY` outside local development.

## Run the Backend

From the project root:

```cmd
uv run python run.py
```

The API runs at `http://127.0.0.1:8000`. Interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

Keep this terminal open while using the application.

## Run the Frontend

Open a second terminal and run:

```cmd
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Register a New User

The current frontend provides sign-in, while new accounts are created through the API documentation. Open `http://127.0.0.1:8000/docs`, expand `POST /api/v1/auth/register`, select **Try it out**, and submit:

```json
{
	"username": "newuser",
	"email": "newuser@example.com",
	"password": "choose-a-strong-password",
	"role": "user",
	"cluster_id": null
}
```

The `role` defaults to `user` and `cluster_id` is optional. A successful request returns HTTP `201 Created`. Usernames and email addresses must be unique. After registration, sign in through the frontend or the login endpoint using the new username and password.

## Authenticate

When the database is empty, the backend seeds these development accounts automatically:

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `admin123` | Administrator |
| `manager1` | `manager123` | Senior associate |
| `user1` | `user123` | Standard user |

Sign in through the frontend using one of these accounts. To authenticate through the API, open `/docs`, expand `POST /api/v1/auth/login`, select **Try it out**, and submit:

```json
{
	"username": "admin",
	"password": "admin123"
}
```

The response contains an access token. For protected API endpoints, send it in the header:

```text
Authorization: Bearer <access_token>
```

These seeded credentials are for local development only. Change or remove them before deploying the application.

## API Endpoint Reference

All API endpoints use the base URL `http://127.0.0.1:8000`. Use the **Authorize** button in `/docs` and enter `Bearer <access_token>` before calling protected endpoints. Unless noted otherwise, protected endpoints require an authenticated user.

### General

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Returns the API welcome message. |

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/login` | Public | Login with `{ "username", "password" }`; returns a JWT and user details. |
| `POST` | `/api/v1/auth/register` | Public | Create a user with `{ "username", "email", "password", "role?", "cluster_id?" }`. |

### Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/users` | Admin | List all users. |
| `GET` | `/api/v1/users/me` | Authenticated | Return the currently logged-in user. |
| `PUT` | `/api/v1/users/{user_id}` | Admin | Update `email`, `role`, `cluster_id`, or `is_active`. The path value is the numeric user ID. |

### Reference Data

Clusters, locations, and skills use the same CRUD pattern. List endpoints are public; create, update, and delete require the `admin` role.

| Method | Endpoint | Request body |
| --- | --- | --- |
| `GET` | `/api/v1/clusters` | None |
| `POST` | `/api/v1/clusters` | `{ "name", "description?" }` |
| `PUT` | `/api/v1/clusters/{cluster_id}` | `{ "name", "description?" }` |
| `DELETE` | `/api/v1/clusters/{cluster_id}` | None |
| `GET` | `/api/v1/locations` | None |
| `POST` | `/api/v1/locations` | `{ "city", "state", "country" }` |
| `PUT` | `/api/v1/locations/{location_id}` | `{ "city", "state", "country" }` |
| `DELETE` | `/api/v1/locations/{location_id}` | None |
| `GET` | `/api/v1/skills` | None |
| `POST` | `/api/v1/skills` | `{ "name", "category" }` |
| `PUT` | `/api/v1/skills/{skill_id}` | Any of `{ "name?", "category?" }` |
| `DELETE` | `/api/v1/skills/{skill_id}` | None |

For cluster and location updates, send the fields shown for creation; the endpoint accepts the same schema.

### Resources

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/resources` | Admin or senior associate | List resources. Supports `skip`, `limit`, `cluster_id`, `skill_id`, `availability_status`, `location_id`, `min_experience`, `max_experience`, and `search` query parameters. |
| `GET` | `/api/v1/resources/{employee_id}` | Authenticated | Get one resource by employee ID, such as `EMP001`. |
| `POST` | `/api/v1/resources` | Admin or senior associate | Create a resource. Required fields: `employee_id`, `name`, `email`, and `cluster_id`. Optional fields include `designation`, `years_of_experience`, location IDs, `availability_status`, `primary_skill_id`, `user_id`, and `secondary_skill_ids`. |
| `PUT` | `/api/v1/resources/{employee_id}` | Authenticated | Update resource fields. Standard users can update only their own linked resource; administrators and senior associates can update resources. |
| `DELETE` | `/api/v1/resources/{employee_id}` | Admin | Delete a resource by employee ID. |

Example resource creation body:

```json
{
	"employee_id": "EMP013",
	"name": "New Employee",
	"email": "new.employee@example.com",
	"cluster_id": 1,
	"designation": "Software Engineer",
	"years_of_experience": 3,
	"current_location_id": 1,
	"preferred_location_id": 1,
	"availability_status": "Available",
	"primary_skill_id": 1,
	"secondary_skill_ids": [8]
}
```

### Certifications and Training

These endpoints use the resource employee ID in the URL. Authenticated users can view records; standard users can create or update records only for their own linked resource.

| Method | Endpoint | Request body |
| --- | --- | --- |
| `GET` | `/api/v1/resources/{employee_id}/certifications` | None |
| `POST` | `/api/v1/resources/{employee_id}/certifications` | `{ "name", "issuing_organization?", "issue_date?", "expiry_date?" }` |
| `PUT` | `/api/v1/certifications/{certification_id}` | Any certification fields to update |
| `GET` | `/api/v1/resources/{employee_id}/training` | None |
| `POST` | `/api/v1/resources/{employee_id}/training` | `{ "training_name", "skill_id?", "status?", "start_date?", "completion_date?", "description?" }` |
| `PUT` | `/api/v1/training/{training_id}` | Any training fields to update |

Training `status` defaults to `Planned`. Certification and training IDs are numeric IDs returned by their respective endpoints.

### Dashboard

All dashboard endpoints require the `admin` or `senior_associate` role. They accept the optional filters `cluster_id`, `skill_id`, `location_id`, and `availability_status` as query parameters.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/dashboard/summary` | Summary resource metrics. |
| `GET` | `/api/v1/dashboard/skills` | Resource distribution by skill. |
| `GET` | `/api/v1/dashboard/location` | Resource distribution by location. |
| `GET` | `/api/v1/dashboard/experience` | Resource distribution by experience range. |
| `GET` | `/api/v1/dashboard/training` | Training metrics. |
| `GET` | `/api/v1/dashboard/availability` | Availability metrics. |

Example filtered request:

```text
GET /api/v1/dashboard/summary?cluster_id=1&availability_status=Available
```

For interactive request fields, response models, status codes, and a **Try it out** button, use the generated documentation at `http://127.0.0.1:8000/docs`.

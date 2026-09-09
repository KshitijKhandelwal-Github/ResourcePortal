# Technical Documentation: `frontend/src/api/training.js`

## 1. Overview & Purpose

`training.js` manages API requests relating to employee upskilling and training programs. It allows querying an employee's enrolled or completed training courses, logging new training courses, and updating training progress status ("Planned", "In Progress", "Completed").

### Analogy
Think of this as an employee's **digital training passport**. Whenever they attend a course on "Advanced FastAPI" or "React Performance", this file records entry stamps, checks what courses are underway, and updates completion status.

---

## 2. Imports & Dependencies

```javascript
import client from './client';
```

- **`client`**: The configured Axios HTTP client with JWT interceptor.

---

## 3. Function Explanations & API Endpoints

### 1. `getTraining(employeeId)`
- **HTTP Method & Path**: `GET /resources/:employeeId/training`
- **What it does**: Retrieves all training records linked to a specific employee identified by their unique `employee_id` (e.g., `"EMP001"`).
- **Why it's needed**: Rendered inside the Training section table on `ResourceDetailPage` and the personal training table on `ProfilePage`.
- **Parameters**:
  - `employeeId` (*String*): The unique employee ID code.
- **Returns**: A Promise resolving to an array of training records:
  ```json
  [
    {
      "id": 1,
      "resource_id": 1,
      "training_name": "Advanced Python",
      "skill_id": 1,
      "status": "Completed",
      "start_date": "2025-01-15",
      "completion_date": "2025-03-15",
      "description": "In-depth course on async and design patterns"
    }
  ]
  ```

### 2. `addTraining(employeeId, data)`
- **HTTP Method & Path**: `POST /resources/:employeeId/training`
- **What it does**: Attaches a new training record to an employee profile.
- **Why it's needed**: Enables managers to enroll team members into upskilling initiatives or allows employees to self-report training on their Profile page.
- **Parameters**:
  - `employeeId` (*String*): The target employee ID.
  - `data` (*Object*):
    - `training_name` (*String, required*): Title of the course.
    - `skill_id` (*Number, optional*): ID of the associated skill.
    - `status` (*String*): `"Planned"` | `"In Progress"` | `"Completed"`.
    - `start_date` (*String, optional*): Date string (`YYYY-MM-DD`).
    - `completion_date` (*String, optional*): Date string (`YYYY-MM-DD`).
    - `description` (*String, optional*): Details about the training.
- **Returns**: A Promise resolving to the newly created training record.

### 3. `updateTraining(trainingId, data)`
- **HTTP Method & Path**: `PUT /training/:trainingId`
- **What it does**: Modifies status, dates, or details for an existing training record.
- **Why it's needed**: Used when moving a course status from `"In Progress"` to `"Completed"` once an employee finishes the coursework.
- **Parameters**:
  - `trainingId` (*Number*): The primary key ID of the training record.
  - `data` (*Object*): Partial object containing fields to update.
- **Returns**: A Promise resolving to the updated training record.

---

## 4. Key Concepts for Beginners

- **Nested Resource Routing**: Following REST conventions, sub-resources that belong directly to an employee (like their training logs) are queried at `/resources/:employeeId/training`. Updating an individual training record by its specific ID is done cleanly at `/training/:trainingId`.


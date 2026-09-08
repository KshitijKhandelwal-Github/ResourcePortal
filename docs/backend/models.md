# Database Models (`models.py`)

This file defines the structure of the database for the Resource Portal. It acts as a blueprint, describing what kind of data the application will store (like users, skills, and locations) and how different pieces of data relate to one another.

## Imports Explained

- `Column, Integer, String, Float, ForeignKey, CheckConstraint, UniqueConstraint, Index` from `sqlalchemy`: These are building blocks used to define the columns and rules for our database tables.
- `datetime` from `datetime`: Provides tools to work with dates and times, mainly to record when data is created or updated.
- `Column, DateTime` from `sqlalchemy`: `DateTime` is used specifically for storing dates and times in the database.
- `relationship` from `sqlalchemy.orm`: Creates a virtual connection between different tables so they can easily access each other's data (e.g., linking a user to their skills).
- `Base` from `.database`: This is a foundational class that all our models inherit from. It tells SQLAlchemy (our database toolkit) that these classes are database tables.

## Classes (Database Tables)

Here is a breakdown of all the models defined in the file. Each class corresponds to a table in the database.

### 1. `Cluster`
- **What it does**: Represents a technology group or department (like "AI/ML", "Frontend", or "Cloud").
- **Why it's needed**: Helps group resources (employees) into logical departments based on their area of expertise.
- **Key Columns**:
  - `id`: A unique number identifying the cluster.
  - `name`: The name of the cluster (must be unique).
  - `description`: A short explanation of what the cluster is about.
- **Relationships**: A cluster can have many `resources`.

### 2. `Location`
- **What it does**: Represents a physical location or city (like "Chennai" or "Bangalore").
- **Why it's needed**: Allows us to track where employees are currently located and where they would prefer to be.
- **Key Columns**:
  - `id`: A unique number.
  - `name`: The city or location name.
- **Relationships**: Connects to resources as their `current_resources` and `preferred_resources`.

### 3. `Skill`
- **What it does**: A dictionary of all possible skills an employee can have (e.g., "Python", "React", "AWS").
- **Why it's needed**: Ensures standard naming for skills across the company.
- **Key Columns**:
  - `id`: Unique identifier.
  - `name`: The name of the skill.
  - `category`: The type of skill (e.g., "Programming", "Cloud").
- **Relationships**: Connects to `ResourceSkill` and `Training`.

### 4. `Resource`
- **What it does**: This is the core table representing an employee or contractor in the system.
- **Why it's needed**: Stores all personal, professional, and availability details for the staff.
- **Key Columns**:
  - `employee_id`, `name`, `email`, `designation`: Basic employee information.
  - `years_experience`: Total professional experience.
  - `cluster_id`, `current_location_id`, `preferred_location_id`: Links to the `Cluster` and `Location` tables.
  - `availability_status`: Tells us if they are "Available", "Allocated", etc.
- **Relationships**: Connects to skills, training, certifications, their assigned cluster, locations, and user account.

### 5. `User`
- **What it does**: Represents a login account for the application.
- **Why it's needed**: To handle authentication and authorization (roles).
- **Key Columns**:
  - `username`, `email`: Used for logging in.
  - `password_hash`: A secure, scrambled version of their password.
  - `role`: Their permission level (e.g., "ADMIN", "REGULAR_USER").
  - `resource_id`: Links a user account to a specific `Resource` (employee).

### 6. `ResourceSkill`
- **What it does**: A "junction table" that connects a `Resource` to a `Skill`.
- **Why it's needed**: Since an employee can have many skills, and a skill can belong to many employees, this table stores the specifics of that connection—like how proficient they are at it.
- **Key Columns**:
  - `resource_id`, `skill_id`: The employee and the skill being linked.
  - `skill_type`: Whether it's a primary or secondary skill.
  - `proficiency_level`: E.g., "BEGINNER", "EXPERT".

### 7. `Training`
- **What it does**: Tracks training programs an employee has taken or is taking.
- **Why it's needed**: To keep a record of employee upskilling and ongoing education.
- **Key Columns**:
  - `resource_id`, `skill_id`: The employee and the skill being trained.
  - `status`: E.g., "COMPLETED", "IN_PROGRESS".
  - `start_date`, `completion_date`: Timeline of the training.

### 8. `Certification`
- **What it does**: Stores official certifications earned by an employee.
- **Why it's needed**: To validate professional credentials (like an AWS Cloud Architect certificate).
- **Key Columns**:
  - `resource_id`: The employee who earned it.
  - `certification_name`, `issuing_organization`: Details of the certificate.
  - `issue_date`, `expiry_date`: Validity period.

## Code Snippet Highlight: Table Constraints
In the `Resource` table, you'll see a section called `__table_args__`. This ensures bad data can't be saved to the database.

```python
__table_args__ = (
    CheckConstraint(
        "years_experience >= 0",
        name="check_years_experience"
    ),
    CheckConstraint(
        "availability_status IN ('Available', 'Allocated', 'On Training', 'On Leave')",
        name="check_availability_status"
    ),
    # ...
)
```
- **How it works**: The database will reject any resource with negative `years_experience` or an `availability_status` that isn't one of the approved options.

## Key Concepts

- **Object-Relational Mapping (ORM)**: This code uses SQLAlchemy as an ORM. An ORM allows developers to interact with a database using standard Python code (classes and objects) instead of writing raw SQL queries.
- **Foreign Keys (`ForeignKey`)**: A way to link tables together. For example, `cluster_id` in the `Resource` table is a foreign key that points to the `id` column in the `Cluster` table.
- **Cascading Deletes (`ondelete="CASCADE"`)**: If an employee (Resource) is deleted from the database, all their associated skills, trainings, and certifications will automatically be deleted too, keeping the database clean.
- **Constraints**: Rules applied to columns (like `nullable=False` or `unique=True`) to maintain data integrity.

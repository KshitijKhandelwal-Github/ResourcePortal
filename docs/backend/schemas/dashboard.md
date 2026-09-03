# Dashboard Schemas (`dashboard.py`)

## Overview

The `dashboard.py` schema file defines data models for serializing analytical summaries and chart data in the Resource Portal. 

When presenting dashboards to managers and executives, data must be structured specifically for visualization components such as pie charts, bar charts, and KPI summary scorecards. These Pydantic models define those visualization-ready data payloads.

---

## Imports and Dependencies

```python
from pydantic import BaseModel
```

- **`pydantic.BaseModel`**: The core base class in Pydantic used to define typed data structures with automatic serialization to JSON.

---

## Schema Classes & Fields

### 1. `SummaryMetrics`

```python
class SummaryMetrics(BaseModel):
    total: int
    available: int
    allocated: int
    on_training: int
    on_leave: int
```

- **What it does**: Represents top-level aggregate figures for high-priority KPI cards on the dashboard.
- **Why it's needed**: Provides executive viewers with an immediate, bird's-eye view of organizational capacity without needing to parse individual records.
- **Fields**:
  - `total` (`int`): Total count of resources.
  - `available` (`int`): Headcount of resources ready for project assignment.
  - `allocated` (`int`): Headcount of resources currently deployed on client or internal projects.
  - `on_training` (`int`): Headcount of resources undergoing full-time upskilling or training.
  - `on_leave` (`int`): Headcount of resources currently on leave or hiatus.

---

### 2. `SkillDistribution`

```python
class SkillDistribution(BaseModel):
    skill_name: str
    count: int
```

- **What it does**: Encapsulates a key-value data point mapping a technical skill name to the number of resources possessing it.
- **Why it's needed**: Directly feeds horizontal/vertical bar charts and tag clouds indicating skill depth across the company.
- **Fields**:
  - `skill_name` (`str`): Label of the skill (e.g., "Python", "React", "Kubernetes").
  - `count` (`int`): Number of resources that have this skill recorded.

---

### 3. `LocationDistribution`

```python
class LocationDistribution(BaseModel):
    location_name: str
    count: int
```

- **What it does**: Encapsulates a data point mapping an office location to the headcount stationed there.
- **Why it's needed**: Feeds geographic charts, bar charts, or regional distribution summaries.
- **Fields**:
  - `location_name` (`str`): Name of the city or office branch (e.g., "New York", "London").
  - `count` (`int`): Total number of personnel located at this office.

---

### 4. `ExperienceDistribution`

```python
class ExperienceDistribution(BaseModel):
    range: str
    count: int
```

- **What it does**: Encapsulates a data point grouping personnel into seniority bands.
- **Why it's needed**: Helps leadership analyze the seniority pyramid (e.g., whether the team has a healthy ratio of juniors, mid-levels, and seniors).
- **Fields**:
  - `range` (`str`): Descriptive label for the experience bracket (e.g., "0-2 years", "3-5 years", "6-10 years", "10+ years").
  - `count` (`int`): Number of personnel falling within this experience tier.

---

### 5. `TrainingMetrics`

```python
class TrainingMetrics(BaseModel):
    status: str
    count: int
```

- **What it does**: Represents aggregate counts of employee training courses by status.
- **Why it's needed**: Feeds status progress bars and donut charts visualizing the health of training initiatives.
- **Fields**:
  - `status` (`str`): Progress state (e.g., "Completed", "In Progress", "Not Started").
  - `count` (`int`): Total number of training modules currently at this status.

---

### 6. `AvailabilityMetrics`

```python
class AvailabilityMetrics(BaseModel):
    status: str
    count: int
```

- **What it does**: Summarizes headcount grouped by availability status.
- **Why it's needed**: Powers donut charts depicting workforce deployment efficiency (bench vs. billable ratio).
- **Fields**:
  - `status` (`str`): Availability categorization label (e.g., "Available", "Allocated", "Shadow").
  - `count` (`int`): Headcount matching this availability state.

---

## Key Concepts

- **Chart-Ready Data Models**: Frontend graphing libraries (such as Chart.js, Recharts, or D3) typically require arrays of objects with standard label and value keys (e.g., `{ label: "Python", value: 12 }`). Designing schemas with clean `name` and `count` fields makes UI integration trivial.
- **Aggregated Projections**: Unlike entity models that map directly 1:1 to database tables, these schemas represent calculated SQL aggregations (`GROUP BY` and `COUNT`).

# Skill Schemas (`skill.py`)

## Overview

The `skill.py` schema file defines data models for technical skills and domain competencies (e.g., Python, Docker, Machine Learning, Product Design) in the Resource Portal.

Skills serve as the cornerstone for resource tagging, profile matching, search filtering, and talent distribution metrics. These schemas validate new skill submissions and format responses for skill listing endpoints.

---

## Imports and Dependencies

```python
from pydantic import BaseModel
from typing import Optional
```

- **`pydantic.BaseModel`**: Base class supplying automatic validation and serialization.
- **`typing.Optional`**: Type hint indicating optional values.

---

## Schema Classes & Fields

### 1. `SkillBase`

```python
class SkillBase(BaseModel):
    name: str
    category: str
```

- **What it does**: Defines core attributes shared by skill models.
- **Fields**:
  - `name` (`str`): The name of the skill or technology (e.g., "FastAPI", "React", "Terraform"). Required.
  - `category` (`str`): The category or discipline the skill falls under (e.g., "Backend", "Frontend", "DevOps", "Database"). Required.

---

### 2. `SkillCreate`

```python
class SkillCreate(SkillBase):
    pass
```

- **What it does**: Validates incoming POST requests to add a new skill to the catalog.
- **Why it's needed**: Inherits both `name` and `category` from `SkillBase`, ensuring that no skill can be created without a name and category.

---

### 3. `SkillUpdate`

```python
class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
```

- **What it does**: Validates requests when modifying an existing skill.
- **Why it's needed**: Allows changing either the `name` or the `category` independently without having to supply both fields.

---

### 4. `SkillOut`

```python
class SkillOut(SkillBase):
    id: int

    class Config:
        from_attributes = True
```

- **What it does**: Response model representing a skill in API outputs.
- **Why it's needed**: Returns the database-assigned unique `id` along with `name` and `category`.
- **`Config.from_attributes = True`**: Enables ORM mode for seamless serialization from SQLAlchemy `Skill` model instances.

---

## Key Concepts

- **Categorized Competencies**: Requiring both `name` and `category` ensures that the skills directory remains neatly organized, making it easy to filter by disciplines (such as finding all "Cloud" or "Frontend" skills).
- **Partial Updates via Optional Fields**: In `SkillUpdate`, fields default to `None`, which allows updating just the category (e.g., recategorizing "TypeScript" from "Language" to "Frontend") without altering the name.

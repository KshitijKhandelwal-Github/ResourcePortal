from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    Index
)

from sqlalchemy.orm import relationship

from database import Base


# =========================================================
# CLUSTERS
# =========================================================

class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    name = Column(
        String,
        nullable=False,
        unique=True
    )

    description = Column(
        String,
        nullable=True
    )

    resources = relationship(
        "Resource",
        back_populates="cluster"
    )


# =========================================================
# LOCATIONS
# =========================================================

class Location(Base):
    __tablename__ = "locations"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    name = Column(
        String,
        nullable=False,
        unique=True
    )

    current_resources = relationship(
        "Resource",
        foreign_keys="Resource.current_location_id",
        back_populates="current_location"
    )

    preferred_resources = relationship(
        "Resource",
        foreign_keys="Resource.preferred_location_id",
        back_populates="preferred_location"
    )


# =========================================================
# SKILLS
# =========================================================

class Skill(Base):
    __tablename__ = "skills"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    name = Column(
        String,
        nullable=False,
        unique=True
    )

    category = Column(
        String,
        nullable=True
    )

    resource_skills = relationship(
        "ResourceSkill",
        back_populates="skill"
    )

    trainings = relationship(
        "Training",
        back_populates="skill"
    )


# =========================================================
# RESOURCES
# =========================================================

class Resource(Base):
    __tablename__ = "resources"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    employee_id = Column(
        String,
        nullable=False,
        unique=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        nullable=False,
        unique=True
    )

    designation = Column(
        String,
        nullable=False
    )

    years_experience = Column(
        Float,
        nullable=False,
        default=0
    )

    cluster_id = Column(
        Integer,
        ForeignKey(
            "clusters.id",
            onupdate="CASCADE",
            ondelete="RESTRICT"
        ),
        nullable=False
    )

    current_location_id = Column(
        Integer,
        ForeignKey(
            "locations.id",
            onupdate="CASCADE",
            ondelete="SET NULL"
        ),
        nullable=True
    )

    preferred_location_id = Column(
        Integer,
        ForeignKey(
            "locations.id",
            onupdate="CASCADE",
            ondelete="SET NULL"
        ),
        nullable=True
    )

    availability_status = Column(
        String,
        nullable=False,
        default="Available"
    )

    created_at = Column(
        String,
        nullable=False,
        default="CURRENT_TIMESTAMP"
    )

    updated_at = Column(
        String,
        nullable=False,
        default="CURRENT_TIMESTAMP"
    )

    __table_args__ = (
        CheckConstraint(
            "years_experience >= 0",
            name="check_years_experience"
        ),

        CheckConstraint(
            "availability_status IN "
            "('Available', 'Allocated', "
            "'On Training', 'On Leave')",
            name="check_availability_status"
        ),

        Index(
            "idx_resources_cluster",
            "cluster_id"
        ),

        Index(
            "idx_resources_current_location",
            "current_location_id"
        ),

        Index(
            "idx_resources_preferred_location",
            "preferred_location_id"
        ),

        Index(
            "idx_resources_availability",
            "availability_status"
        )
    )

    cluster = relationship(
        "Cluster",
        back_populates="resources"
    )

    current_location = relationship(
        "Location",
        foreign_keys=[current_location_id],
        back_populates="current_resources"
    )

    preferred_location = relationship(
        "Location",
        foreign_keys=[preferred_location_id],
        back_populates="preferred_resources"
    )

    skills = relationship(
        "ResourceSkill",
        back_populates="resource",
        cascade="all, delete-orphan"
    )

    training = relationship(
        "Training",
        back_populates="resource",
        cascade="all, delete-orphan"
    )

    certifications = relationship(
        "Certification",
        back_populates="resource",
        cascade="all, delete-orphan"
    )

    user = relationship(
        "User",
        back_populates="resource",
        uselist=False
    )


# =========================================================
# USERS
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    username = Column(
        String,
        nullable=False,
        unique=True
    )

    email = Column(
        String,
        nullable=False,
        unique=True
    )

    password_hash = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        nullable=False
    )

    resource_id = Column(
        Integer,
        ForeignKey(
            "resources.id",
            onupdate="CASCADE",
            ondelete="SET NULL"
        ),
        nullable=True,
        unique=True
    )

    is_active = Column(
        Integer,
        nullable=False,
        default=1
    )

    created_at = Column(
        String,
        nullable=False,
        default="CURRENT_TIMESTAMP"
    )

    __table_args__ = (
        CheckConstraint(
            "role IN "
            "('ADMIN', 'SENIOR_ASSOCIATE', "
            "'REGULAR_USER')",
            name="check_user_role"
        ),

        CheckConstraint(
            "is_active IN (0, 1)",
            name="check_is_active"
        )
    )

    resource = relationship(
        "Resource",
        back_populates="user"
    )


# =========================================================
# RESOURCE SKILLS
# =========================================================

class ResourceSkill(Base):
    __tablename__ = "resource_skills"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    resource_id = Column(
        Integer,
        ForeignKey(
            "resources.id",
            onupdate="CASCADE",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    skill_id = Column(
        Integer,
        ForeignKey(
            "skills.id",
            onupdate="CASCADE",
            ondelete="RESTRICT"
        ),
        nullable=False
    )

    skill_type = Column(
        String,
        nullable=False
    )

    proficiency_level = Column(
        String,
        nullable=True
    )

    years_experience = Column(
        Float,
        nullable=True
    )

    __table_args__ = (
        UniqueConstraint(
            "resource_id",
            "skill_id",
            name="uq_resource_skill"
        ),

        CheckConstraint(
            "skill_type IN "
            "('PRIMARY', 'SECONDARY')",
            name="check_skill_type"
        ),

        CheckConstraint(
            "proficiency_level IS NULL OR "
            "proficiency_level IN "
            "('BEGINNER', 'INTERMEDIATE', "
            "'ADVANCED', 'EXPERT')",
            name="check_proficiency_level"
        ),

        CheckConstraint(
            "years_experience IS NULL OR "
            "years_experience >= 0",
            name="check_skill_experience"
        ),

        Index(
            "idx_resource_skills_resource",
            "resource_id"
        ),

        Index(
            "idx_resource_skills_skill",
            "skill_id"
        )
    )

    resource = relationship(
        "Resource",
        back_populates="skills"
    )

    skill = relationship(
        "Skill",
        back_populates="resource_skills"
    )


# =========================================================
# TRAINING
# =========================================================

class Training(Base):
    __tablename__ = "training"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    resource_id = Column(
        Integer,
        ForeignKey(
            "resources.id",
            onupdate="CASCADE",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    skill_id = Column(
        Integer,
        ForeignKey(
            "skills.id",
            onupdate="CASCADE",
            ondelete="SET NULL"
        ),
        nullable=True
    )

    training_name = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        nullable=False
    )

    start_date = Column(
        String,
        nullable=True
    )

    completion_date = Column(
        String,
        nullable=True
    )

    description = Column(
        String,
        nullable=True
    )

    __table_args__ = (
        CheckConstraint(
            "status IN "
            "('COMPLETED', 'IN_PROGRESS', 'PLANNED')",
            name="check_training_status"
        ),

        CheckConstraint(
            "completion_date IS NULL OR "
            "start_date IS NULL OR "
            "completion_date >= start_date",
            name="check_training_dates"
        ),

        Index(
            "idx_training_resource",
            "resource_id"
        ),

        Index(
            "idx_training_skill",
            "skill_id"
        ),

        Index(
            "idx_training_status",
            "status"
        )
    )

    resource = relationship(
        "Resource",
        back_populates="training"
    )

    skill = relationship(
        "Skill",
        back_populates="trainings"
    )


# =========================================================
# CERTIFICATIONS
# =========================================================

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    resource_id = Column(
        Integer,
        ForeignKey(
            "resources.id",
            onupdate="CASCADE",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    certification_name = Column(
        String,
        nullable=False
    )

    issuing_organization = Column(
        String,
        nullable=True
    )

    issue_date = Column(
        String,
        nullable=True
    )

    expiry_date = Column(
        String,
        nullable=True
    )

    credential_id = Column(
        String,
        nullable=True
    )

    __table_args__ = (
        CheckConstraint(
            "expiry_date IS NULL OR "
            "issue_date IS NULL OR "
            "expiry_date >= issue_date",
            name="check_certification_dates"
        ),

        Index(
            "idx_certifications_resource",
            "resource_id"
        )
    )

    resource = relationship(
        "Resource",
        back_populates="certifications"
    )
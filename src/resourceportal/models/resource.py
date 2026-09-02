import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from resourceportal.database.database import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=False)
    designation = Column(String, nullable=False)
    years_of_experience = Column(Float, nullable=False)
    current_location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    preferred_location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    availability_status = Column(String, nullable=False)
    primary_skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    cluster = relationship("Cluster", back_populates="resources")
    current_location = relationship("Location", foreign_keys=[current_location_id], back_populates="resources_current")
    preferred_location = relationship("Location", foreign_keys=[preferred_location_id], back_populates="resources_preferred")
    user = relationship("User", back_populates="resource")
    skills = relationship("ResourceSkill", back_populates="resource")
    trainings = relationship("Training", back_populates="resource")
    certifications = relationship("Certification", back_populates="resource")
    primary_skill = relationship("Skill", foreign_keys=[primary_skill_id])


class ResourceSkill(Base):
    __tablename__ = "resource_skills"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    is_primary = Column(Boolean, default=False)

    resource = relationship("Resource", back_populates="skills")
    skill = relationship("Skill", back_populates="resource_skills")


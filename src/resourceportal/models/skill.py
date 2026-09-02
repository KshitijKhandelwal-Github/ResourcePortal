from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from resourceportal.database.database import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)

    resource_skills = relationship("ResourceSkill", back_populates="skill")
    trainings = relationship("Training", back_populates="skill")


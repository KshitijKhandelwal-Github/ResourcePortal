from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from resourceportal.database.database import Base

class Training(Base):
    __tablename__ = "training"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    training_name = Column(String, nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    status = Column(String, nullable=False, default="Planned")
    start_date = Column(String, nullable=True)
    completion_date = Column(String, nullable=True)
    description = Column(String, nullable=True)

    resource = relationship("Resource", back_populates="trainings")
    skill = relationship("Skill", back_populates="trainings")

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from resourceportal.database.database import Base


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    name = Column(String, nullable=False)
    issuing_organization = Column(String, nullable=True)
    issue_date = Column(String, nullable=True)
    expiry_date = Column(String, nullable=True)

    resource = relationship("Resource", back_populates="certifications")

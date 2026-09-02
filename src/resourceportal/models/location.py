from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from resourceportal.database.database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, unique=True, index=True, nullable=False)
    state = Column(String, nullable=False)
    country = Column(String, nullable=False)

    resources_current = relationship("Resource", foreign_keys="[Resource.current_location_id]", back_populates="current_location")
    resources_preferred = relationship("Resource", foreign_keys="[Resource.preferred_location_id]", back_populates="preferred_location")


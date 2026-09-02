from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from resourceportal.database.database import Base


class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)

    users = relationship("User", back_populates="cluster")
    resources = relationship("Resource", back_populates="cluster")


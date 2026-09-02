from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from resourceportal.database.database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    cluster = relationship("Cluster", back_populates="users")
    resource = relationship("Resource", back_populates="user", uselist=False)


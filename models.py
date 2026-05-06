from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="viewer") # 'viewer' or 'publisher'
    is_active = Column(Boolean, default=True)

    research_data = relationship("ResearchData", back_populates="publisher")

class ResearchData(Base):
    __tablename__ = "research_data"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    beta_estimate = Column(Float, nullable=True)
    incubation_days_estimate = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    publisher_id = Column(Integer, ForeignKey("users.id"))
    publisher = relationship("User", back_populates="research_data")

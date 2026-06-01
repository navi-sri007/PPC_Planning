from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class MachineType(Base):
    __tablename__ = "machine_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # grinding, cutting, melting, molding, assembling
    
    # Relationships
    machines = relationship("Machine", back_populates="machine_type")
    job_processes = relationship("JobTemplateProcess", back_populates="machine_type")

class Machine(Base):
    __tablename__ = "machines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # Machine1, Machine2, etc.
    machine_type_id = Column(Integer, ForeignKey("machine_types.id"), nullable=False)
    efficiency = Column(Integer, nullable=False)  # Units per day (e.g., 5000)
    status = Column(String, default="idle")  # active, idle
    booked_dates = Column(JSON, default=list)  # List of booked dates as strings "YYYY-MM-DD"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    machine_type = relationship("MachineType", back_populates="machines")
    schedule_assignments = relationship("JobSchedule", back_populates="machine")

class JobTemplate(Base):
    __tablename__ = "job_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # brakes, wheels, pedals, seats
    
    # Relationships
    processes = relationship("JobTemplateProcess", back_populates="job_template")
    jobs = relationship("Job", back_populates="template")

class JobTemplateProcess(Base):
    __tablename__ = "job_template_processes"
    
    id = Column(Integer, primary_key=True, index=True)
    job_template_id = Column(Integer, ForeignKey("job_templates.id"), nullable=False)
    step_order = Column(Integer, nullable=False)  # 1, 2, 3...
    machine_type_id = Column(Integer, ForeignKey("machine_types.id"), nullable=False)
    
    # Relationships
    job_template = relationship("JobTemplate", back_populates="processes")
    machine_type = relationship("MachineType", back_populates="job_processes")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("job_templates.id"), nullable=False)
    client_name = Column(String, nullable=True, default="")
    quantity = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False)
    completion_percentage = Column(Float, default=0.0)  # 0 to 100
    status = Column(String, default="pending")  # pending, in_progress, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    template = relationship("JobTemplate", back_populates="jobs")
    schedule = relationship("JobSchedule", back_populates="job")

class JobSchedule(Base):
    __tablename__ = "job_schedule"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False)
    process_step = Column(Integer, nullable=False)  # Which step in the process
    assigned_date = Column(Date, nullable=False)
    completed = Column(Integer, default=0)  # 0 = pending, 1 = completed
    
    # Relationships
    job = relationship("Job", back_populates="schedule")
    machine = relationship("Machine", back_populates="schedule_assignments")
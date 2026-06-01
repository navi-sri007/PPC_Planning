from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional ,Dict, Any

# Machine Type Schemas
class MachineTypeBase(BaseModel):
    name: str

class MachineTypeCreate(MachineTypeBase):
    pass

class MachineTypeResponse(MachineTypeBase):
    id: int
    
    class Config:
        from_attributes = True

# Machine Schemas
class MachineBase(BaseModel):
    name: str
    machine_type_id: int
    efficiency: int
    status: str = "idle"

class MachineCreate(MachineBase):
    pass

class MachineUpdate(BaseModel):
    name: Optional[str] = None
    machine_type_id: Optional[int] = None
    efficiency: Optional[int] = None
    status: Optional[str] = None

class MachineResponse(MachineBase):
    id: int
    booked_dates: List[str] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

# Job Template Schemas
class JobTemplateBase(BaseModel):
    name: str

class JobTemplateCreate(JobTemplateBase):
    process_machine_type_ids: List[int]  # Ordered list of machine_type_ids

class JobTemplateResponse(JobTemplateBase):
    id: int
    processes: List[dict]
    
    class Config:
        from_attributes = True

# Job Schemas
class JobBase(BaseModel):
    template_id: int
    client_name: Optional[str] = None 
    quantity: int
    due_date: date

class JobCreate(JobBase):
    pass

class JobResponse(BaseModel):
    id: int
    job_display_name: Optional[str] = None
    template_id: int
    quantity: int
    due_date: date
    completion_percentage: float
    status: str
    created_at: datetime
    schedule: Optional[List[Dict[str, Any]]] = None  # Change this line
    
    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardJobItem(BaseModel):
    job_id: int
    job_name: str
    assigned_machine: str
    progress: float
    delivery_date: date
    status: str

class DashboardResponse(BaseModel):
    jobs: List[DashboardJobItem]

# AI Assistant Schemas
class AIQuestion(BaseModel):
    question: str

class AIAvailableMachine(BaseModel):
    machine_id: int
    machine_name: str
    machine_type: str
    efficiency: int
    status: str

class AIPendingJob(BaseModel):
    job_id: int
    job_name: str
    quantity: int
    due_date: date
    completion_percentage: float

class AINearDueJob(BaseModel):
    job_id: int
    job_name: str
    due_date: date
    days_remaining: int
    completion_percentage: float

class ScheduleTableResponse(BaseModel):
    machines: List[str]
    dates: List[str]
    schedule_data: dict  # machine_name -> date -> job_name


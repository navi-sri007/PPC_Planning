from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/", response_model=schemas.DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """Get dashboard data: jobs with their assigned machines and progress"""
    jobs = db.query(models.Job).all()
    dashboard_jobs = []
    
    for job in jobs:
        # Get job template name
        template = db.query(models.JobTemplate).filter(models.JobTemplate.id == job.template_id).first()
        job_name = template.name if template else "Unknown"
        
        # Get assigned machines for this job
        schedules = db.query(models.JobSchedule).filter(models.JobSchedule.job_id == job.id).all()
        
        # Get unique machine names assigned to this job
        machine_names = []
        for schedule in schedules:
            machine = db.query(models.Machine).filter(models.Machine.id == schedule.machine_id).first()
            if machine and machine.name not in machine_names:
                machine_names.append(machine.name)
        
        assigned_machine = ", ".join(machine_names) if machine_names else "Not assigned"
        
        dashboard_jobs.append({
            "job_id": job.id,
            "job_name": job_name,
            "assigned_machine": assigned_machine,
            "progress": job.completion_percentage,
            "delivery_date": job.due_date,
            "status": job.status
        })
    
    return {"jobs": dashboard_jobs}

@router.get("/pending-jobs")
def get_pending_jobs(db: Session = Depends(get_db)):
    """Get all pending jobs (not 100% complete)"""
    jobs = db.query(models.Job).filter(models.Job.completion_percentage < 100).all()
    
    result = []
    for job in jobs:
        template = db.query(models.JobTemplate).filter(models.JobTemplate.id == job.template_id).first()
        result.append({
            "job_id": job.id,
            "job_name": template.name if template else "Unknown",
            "quantity": job.quantity,
            "due_date": job.due_date,
            "progress": job.completion_percentage
        })
    
    return {"pending_jobs": result}

@router.get("/completed-jobs")
def get_completed_jobs(db: Session = Depends(get_db)):
    """Get all completed jobs"""
    jobs = db.query(models.Job).filter(models.Job.completion_percentage >= 100).all()
    
    result = []
    for job in jobs:
        template = db.query(models.JobTemplate).filter(models.JobTemplate.id == job.template_id).first()
        result.append({
            "job_id": job.id,
            "job_name": template.name if template else "Unknown",
            "quantity": job.quantity,
            "due_date": job.due_date,
            "completed_date": "N/A"  # Could track this
        })
    
    return {"completed_jobs": result}
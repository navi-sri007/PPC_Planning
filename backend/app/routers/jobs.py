from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database import get_db
from app import models, schemas, scheduling

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.get("/", response_model=List[schemas.JobResponse])
def get_jobs(db: Session = Depends(get_db)):
    """Get all jobs"""
    jobs = db.query(models.Job).all()
    # Convert to response format
    result = []
    for job in jobs:
        template = db.query(models.JobTemplate).filter(models.JobTemplate.id == job.template_id).first()
        
        # Get schedule for this job
        schedule = db.query(models.JobSchedule).filter(models.JobSchedule.job_id == job.id).all()
        schedule_data = []
        for s in schedule:
            machine = db.query(models.Machine).filter(models.Machine.id == s.machine_id).first()
            schedule_data.append({
                "process_step": s.process_step,
                "machine_name": machine.name if machine else "Unknown",
                "assigned_date": s.assigned_date.isoformat() if s.assigned_date else None,
                "completed": s.completed
            })
        
        result.append({
            "id": job.id,
            "template_id": job.template_id,
            "quantity": job.quantity,
            "due_date": job.due_date,
            "completion_percentage": job.completion_percentage,
            "status": job.status,
            "created_at": job.created_at,
            "schedule": schedule_data
        })
    
    return result

@router.get("/templates", response_model=List[schemas.JobTemplateResponse])
def get_job_templates(db: Session = Depends(get_db)):
    """Get all job templates with their processes"""
    templates = db.query(models.JobTemplate).all()
    result = []
    
    for template in templates:
        processes = []
        for process in template.processes:
            processes.append({
                "step": process.step_order,
                "machine_type": process.machine_type.name
            })
        result.append({
            "id": template.id,
            "name": template.name,
            "processes": processes
        })
    
    return result

@router.post("/", response_model=schemas.JobResponse)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    """Create a new job and automatically schedule it"""
    # Check if template exists
    template = db.query(models.JobTemplate).filter(models.JobTemplate.id == job.template_id).first()
    if not template:
        raise HTTPException(status_code=400, detail="Job template not found")
    
    # Create the job with client name
    db_job = models.Job(
        template_id=job.template_id,
        client_name=job.client_name or "",  # NEW
        quantity=job.quantity,
        due_date=job.due_date,
        completion_percentage=0.0,
        status="pending"
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    # Schedule the job
    scheduling.schedule_job(db, db_job)
    
    # Refresh to get schedule
    db.refresh(db_job)
    
    # Get schedule for response
    schedule = db.query(models.JobSchedule).filter(models.JobSchedule.job_id == db_job.id).all()
    schedule_data = []
    for s in schedule:
        machine = db.query(models.Machine).filter(models.Machine.id == s.machine_id).first()
        schedule_data.append({
            "process_step": s.process_step,
            "machine_name": machine.name if machine else "Unknown",
            "assigned_date": s.assigned_date.isoformat() if s.assigned_date else None,
            "completed": s.completed
        })
    
    # Create display name
    job_display_name = f"{template.name}"
    if job.client_name:
        job_display_name += f" - {job.client_name}"
    
    return {
        "id": db_job.id,
        "template_id": db_job.template_id,
        "client_name": db_job.client_name,
        "job_display_name": job_display_name,
        "quantity": db_job.quantity,
        "due_date": db_job.due_date,
        "completion_percentage": db_job.completion_percentage,
        "status": db_job.status,
        "created_at": db_job.created_at,
        "schedule": schedule_data
    }
@router.get("/{job_id}", response_model=schemas.JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get a specific job with its schedule"""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    template = db.query(models.JobTemplate).filter(models.JobTemplate.id == job.template_id).first()
    
    # Get schedule for this job
    schedule = db.query(models.JobSchedule).filter(models.JobSchedule.job_id == job_id).all()
    
    schedule_data = []
    for s in schedule:
        machine = db.query(models.Machine).filter(models.Machine.id == s.machine_id).first()
        schedule_data.append({
            "process_step": s.process_step,
            "machine_name": machine.name if machine else "Unknown",
            "assigned_date": s.assigned_date.isoformat() if s.assigned_date else None,
            "completed": s.completed
        })
    
    return {
        "id": job.id,
        "template_id": job.template_id,
        "quantity": job.quantity,
        "due_date": job.due_date,
        "completion_percentage": job.completion_percentage,
        "status": job.status,
        "created_at": job.created_at,
        "schedule": schedule_data
    }

@router.put("/{job_id}/progress")
def update_job_progress(job_id: int, percentage: float, db: Session = Depends(get_db)):
    """Update job completion percentage"""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.completion_percentage = percentage
    if percentage >= 100:
        job.status = "completed"
    elif percentage > 0:
        job.status = "in_progress"
    
    db.commit()
    return {"message": "Progress updated", "percentage": percentage}

@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    """Delete a job and free up machine bookings"""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Free up machine booked dates
    schedules = db.query(models.JobSchedule).filter(models.JobSchedule.job_id == job_id).all()
    for schedule in schedules:
        machine = db.query(models.Machine).filter(models.Machine.id == schedule.machine_id).first()
        if machine and machine.booked_dates:
            booked_dates = machine.booked_dates
            date_str = schedule.assigned_date.isoformat()
            if date_str in booked_dates:
                booked_dates.remove(date_str)
                machine.booked_dates = booked_dates
        
        db.delete(schedule)
    
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}
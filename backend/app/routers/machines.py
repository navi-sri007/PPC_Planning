from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/machines", tags=["machines"])

@router.get("/", response_model=List[schemas.MachineResponse])
def get_machines(db: Session = Depends(get_db)):
    """Get all machines"""
    machines = db.query(models.Machine).all()
    return machines

@router.get("/types", response_model=List[schemas.MachineTypeResponse])
def get_machine_types(db: Session = Depends(get_db)):
    """Get all machine types"""
    types = db.query(models.MachineType).all()
    return types

@router.get("/{machine_id}", response_model=schemas.MachineResponse)
def get_machine(machine_id: int, db: Session = Depends(get_db)):
    """Get a specific machine"""
    machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine

@router.post("/", response_model=schemas.MachineResponse)
def create_machine(machine: schemas.MachineCreate, db: Session = Depends(get_db)):
    """Register a new machine"""
    # Check if machine name exists
    existing = db.query(models.Machine).filter(models.Machine.name == machine.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Machine name already exists")
    
    # Check if machine type exists
    machine_type = db.query(models.MachineType).filter(models.MachineType.id == machine.machine_type_id).first()
    if not machine_type:
        raise HTTPException(status_code=400, detail="Machine type not found")
    
    db_machine = models.Machine(
        name=machine.name,
        machine_type_id=machine.machine_type_id,
        efficiency=machine.efficiency,
        status=machine.status,
        booked_dates=[]
    )
    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)
    return db_machine

@router.put("/{machine_id}", response_model=schemas.MachineResponse)
def update_machine(machine_id: int, machine_update: schemas.MachineUpdate, db: Session = Depends(get_db)):
    """Update a machine"""
    db_machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    update_data = machine_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_machine, key, value)
    
    db.commit()
    db.refresh(db_machine)
    return db_machine

@router.delete("/{machine_id}")
def delete_machine(machine_id: int, db: Session = Depends(get_db)):
    """Delete a machine"""
    db_machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    # Check if machine has any scheduled jobs
    has_schedule = db.query(models.JobSchedule).filter(models.JobSchedule.machine_id == machine_id).first()
    if has_schedule:
        raise HTTPException(status_code=400, detail="Cannot delete machine with assigned jobs")
    
    db.delete(db_machine)
    db.commit()
    return {"message": "Machine deleted successfully"}

@router.get("/available/date/{target_date}")
def get_available_machines_on_date(target_date: date, db: Session = Depends(get_db)):
    """Get machines that are available on a specific date"""
    machines = db.query(models.Machine).all()
    available = []
    
    for machine in machines:
        booked_dates = machine.booked_dates or []
        if target_date.isoformat() not in booked_dates:
            available.append({
                "id": machine.id,
                "name": machine.name,
                "type": machine.machine_type.name,
                "efficiency": machine.efficiency,
                "status": machine.status
            })
    
    return {"date": target_date, "available_machines": available}
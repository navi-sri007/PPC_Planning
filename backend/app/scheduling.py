from sqlalchemy.orm import Session
from app.models import Machine, Job, JobTemplateProcess, JobSchedule, MachineType
from datetime import date, timedelta
from typing import List, Dict, Optional, Tuple
import math

def get_available_machines_for_process(
    db: Session, 
    machine_type_name: str, 
    required_date: date,
    exclude_machine_ids: List[int] = None
) -> List[Machine]:
    """Get machines of a specific type that are available on a given date"""
    
    machine_type = db.query(MachineType).filter(MachineType.name == machine_type_name).first()
    if not machine_type:
        return []
    
    machines = db.query(Machine).filter(Machine.machine_type_id == machine_type.id).all()
    
    if exclude_machine_ids:
        machines = [m for m in machines if m.id not in exclude_machine_ids]
    
    available_machines = []
    for machine in machines:
        booked_dates = machine.booked_dates or []
        if required_date.isoformat() not in booked_dates:
            available_machines.append(machine)
    
    return available_machines

def calculate_days_needed(quantity: int, efficiency: int) -> int:
    if efficiency <= 0:
        return 1
    return math.ceil(quantity / efficiency)

def find_best_available_machine(
    db: Session,
    machine_type_name: str,
    start_date: date,
    required_days: int,
    due_date: date,
    max_lookahead_days: int = 90,
    exclude_machine_ids: List[int] = None
) -> Tuple[Optional[Machine], Optional[date], int]:
    """
    Find the best available machine with consecutive free days
    Returns: (machine, start_date, delay_days)
    """
    
    # Keep looking further and further ahead
    for lookahead in range(max_lookahead_days + 1):
        test_date = start_date + timedelta(days=lookahead)
        
        # Get available machines on this date
        available_machines = get_available_machines_for_process(
            db, machine_type_name, test_date, exclude_machine_ids
        )
        
        if available_machines:
            # Check each machine for consecutive free days
            for machine in sorted(available_machines, key=lambda m: m.efficiency, reverse=True):
                booked = set(machine.booked_dates or [])
                
                # Check if machine has required_days consecutive free days starting from test_date
                has_consecutive_days = True
                for offset in range(required_days):
                    check_date = test_date + timedelta(days=offset)
                    if check_date.isoformat() in booked:
                        has_consecutive_days = False
                        break
                
                if has_consecutive_days:
                    completion_date = test_date + timedelta(days=required_days - 1)
                    
                    if completion_date > due_date:
                        print(f"    ⚠️ Warning: Will miss due date by {(completion_date - due_date).days} days")
                    
                    return machine, test_date, lookahead
    
    # Force schedule on least busy machine if no ideal slot found
    machine_type = db.query(MachineType).filter(MachineType.name == machine_type_name).first()
    if not machine_type:
        return None, None, -1
        
    all_machines = db.query(Machine).filter(Machine.machine_type_id == machine_type.id).all()
    
    if all_machines:
        # Pick machine with fewest total bookings
        best_machine = min(all_machines, key=lambda m: len(m.booked_dates or []))
        
        # Find the earliest date with consecutive free days
        test_date = start_date
        max_search = 60
        found = False
        
        for _ in range(max_search):
            booked = set(best_machine.booked_dates or [])
            has_consecutive = True
            
            for offset in range(required_days):
                check_date = test_date + timedelta(days=offset)
                if check_date.isoformat() in booked:
                    has_consecutive = False
                    break
            
            if has_consecutive:
                found = True
                break
            test_date += timedelta(days=1)
        
        if found:
            print(f"    🚨 Force scheduling on {best_machine.name} starting {test_date}")
            return best_machine, test_date, (test_date - start_date).days
    
    return None, None, -1

def assign_process_to_machine(
    db: Session,
    job_id: int,
    machine: Machine,
    process_step: int,
    start_date: date,
    days_needed: int
) -> date:
    """Assign a process to a machine and update its booked dates"""
    assigned_dates = []
    
    for i in range(days_needed):
        assigned_date = start_date + timedelta(days=i)
        assigned_dates.append(assigned_date)
        
        # Check if already assigned
        existing = db.query(JobSchedule).filter(
            JobSchedule.job_id == job_id,
            JobSchedule.machine_id == machine.id,
            JobSchedule.process_step == process_step,
            JobSchedule.assigned_date == assigned_date
        ).first()
        
        if not existing:
            schedule = JobSchedule(
                job_id=job_id,
                machine_id=machine.id,
                process_step=process_step,
                assigned_date=assigned_date,
                completed=0
            )
            db.add(schedule)
            print(f"      📅 {machine.name}: Step {process_step} on {assigned_date}")
    
    # Update machine's booked dates
    booked_dates = set(machine.booked_dates or [])
    for assigned_date in assigned_dates:
        booked_dates.add(assigned_date.isoformat())
    machine.booked_dates = list(booked_dates)
    
    db.flush()
    
    # Return the NEXT day after all assignments (when next process can start)
    return start_date + timedelta(days=days_needed)

def schedule_job(db: Session, job: Job) -> bool:
    """
    Powerful scheduling algorithm that schedules processes SEQUENTIALLY
    Each process starts AFTER the previous one completes
    """
    print(f"\n{'='*70}")
    print(f"📋 SCHEDULING JOB: ID={job.id}")
    print(f"   Template: {job.template_id}, Quantity: {job.quantity:,} units")
    print(f"   Due Date: {job.due_date}")
    print(f"{'='*70}")
    
    # Get process steps in order
    processes = db.query(JobTemplateProcess).filter(
        JobTemplateProcess.job_template_id == job.template_id
    ).order_by(JobTemplateProcess.step_order).all()
    
    if not processes:
        print(f"❌ No processes defined for this job template")
        return False
    
    print(f"✓ Found {len(processes)} process steps to schedule")
    
    # CRITICAL: Start from today
    next_available_date = date.today()
    used_machines = []
    total_delay = 0
    
    print(f"\n📅 Starting schedule from: {next_available_date}")
    
    # Schedule each process SEQUENTIALLY
    for idx, process in enumerate(processes, 1):
        machine_type = db.query(MachineType).filter(MachineType.id == process.machine_type_id).first()
        if not machine_type:
            print(f"❌ Machine type not found for process {idx}")
            return False
        
        print(f"\n{'─'*50}")
        print(f"📍 STEP {idx}/{len(processes)}: {machine_type.name.upper()}")
        print(f"   Can start from: {next_available_date}")
        
        # Get machines of this type
        machines_of_type = db.query(Machine).filter(Machine.machine_type_id == process.machine_type_id).all()
        if not machines_of_type:
            print(f"❌ No machines exist of type: {machine_type.name}")
            print(f"   Please add a machine of type: {machine_type.name}")
            return False
        
        # Calculate days needed with best available machine
        # First, find best machine to estimate
        best_efficiency = max(m.efficiency for m in machines_of_type)
        days_needed = calculate_days_needed(job.quantity, best_efficiency)
        
        print(f"   Need {days_needed} consecutive day(s) on a {machine_type.name} machine")
        
        # Find available slot starting from next_available_date
        best_machine, start_date, delay = find_best_available_machine(
            db=db,
            machine_type_name=machine_type.name,
            start_date=next_available_date,
            required_days=days_needed,
            due_date=job.due_date,
            max_lookahead_days=90,
            exclude_machine_ids=used_machines
        )
        
        if not best_machine:
            print(f"❌ CRITICAL: Cannot find any {machine_type.name} machine!")
            print(f"   Please add more {machine_type.name} machines")
            return False
        
        # Recalculate days with actual machine
        days_needed = calculate_days_needed(job.quantity, best_machine.efficiency)
        completion_date = start_date + timedelta(days=days_needed - 1)
        
        print(f"\n   ✅ Assigned to: {best_machine.name}")
        print(f"      Efficiency: {best_machine.efficiency:,} units/day")
        print(f"      Days needed: {days_needed}")
        print(f"      Start date: {start_date}")
        print(f"      Completion: {completion_date}")
        
        if completion_date > job.due_date:
            overdue = (completion_date - job.due_date).days
            print(f"      ⚠️ MISSES due date by {overdue} day(s)")
        
        if delay > 0:
            print(f"      ⏰ Delayed by {delay} day(s) (machines were busy)")
            total_delay += delay
        
        # Assign the process
        next_available_date = assign_process_to_machine(
            db, job.id, best_machine, process.step_order, start_date, days_needed
        )
        used_machines.append(best_machine.id)
        
        print(f"   📅 Next process can start from: {next_available_date}")
    
    job.status = "scheduled"
    db.commit()
    
    print(f"\n{'='*70}")
    if total_delay > 0:
        print(f"⚠️ JOB {job.id} SCHEDULED with {total_delay} days total delay")
    else:
        print(f"✅ JOB {job.id} SCHEDULED SUCCESSFULLY!")
    print(f"   Final completion date: {next_available_date - timedelta(days=1)}")
    print(f"{'='*70}\n")
    
    return True
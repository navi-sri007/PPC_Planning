from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Dict
import requests
import json
import re

from app.database import get_db
from app import models, schemas
from app.config import settings

router = APIRouter(prefix="/api/ai", tags=["ai_assistant"])

def get_available_machines_today(db: Session):
    """Get machines available today (idle for the whole day)"""
    today = date.today().isoformat()
    machines = db.query(models.Machine).all()
    
    available = []
    unavailable = []
    
    for machine in machines:
        booked_dates = machine.booked_dates or []
        if today not in booked_dates:
            available.append({
                "machine_id": machine.id,
                "machine_name": machine.name,
                "machine_type": machine.machine_type.name,
                "efficiency": machine.efficiency,
                "status": machine.status
            })
        else:
            unavailable.append({
                "machine_name": machine.name,
                "machine_type": machine.machine_type.name
            })
    
    return {
        "intent": "available_machines",
        "available": available,
        "unavailable": unavailable,
        "message": f"Found {len(available)} available machine(s) today",
        "date": today
    }

def check_specific_machine_availability(db: Session, machine_name: str):
    """Check if a specific machine is available today"""
    today = date.today().isoformat()
    
    # Find the machine (case-insensitive)
    machine = db.query(models.Machine).filter(
        models.Machine.name.ilike(machine_name)
    ).first()
    
    if not machine:
        # Try partial match
        machines = db.query(models.Machine).filter(
            models.Machine.name.ilike(f"%{machine_name}%")
        ).all()
        
        if len(machines) == 1:
            machine = machines[0]
        elif len(machines) > 1:
            return {
                "intent": "machine_availability",
                "answer": f"I found multiple machines matching '{machine_name}': {', '.join([m.name for m in machines])}. Which one would you like to check?",
                "machines_found": [m.name for m in machines]
            }
        else:
            return {
                "intent": "machine_availability",
                "answer": f"No machine found with name '{machine_name}'. Please check the machine name.",
                "machine_found": False
            }
    
    # Check availability
    booked_dates = machine.booked_dates or []
    is_available = today not in booked_dates
    
    # Get next working date if not available
    next_available = None
    if not is_available:
        current_date = date.today()
        for i in range(1, 30):
            next_date = current_date + timedelta(days=i)
            if next_date.isoformat() not in booked_dates:
                next_available = next_date
                break
    
    return {
        "intent": "machine_availability",
        "machine_name": machine.name,
        "machine_type": machine.machine_type.name,
        "efficiency": machine.efficiency,
        "is_available": is_available,
        "today": today,
        "next_available": next_available.isoformat() if next_available else None,
        "answer": f"Machine {machine.name} is {'AVAILABLE ✅' if is_available else 'NOT AVAILABLE ❌'} today ({today})." + 
                  (f" It will be available on {next_available.isoformat()}." if next_available else "")
    }

def get_pending_jobs_response(db: Session):
    """Get jobs with progress < 100%"""
    jobs = db.query(models.Job).filter(models.Job.completion_percentage < 100).all()
    
    pending = []
    for job in jobs:
        template = db.query(models.JobTemplate).filter(models.JobTemplate.id == job.template_id).first()
        pending.append({
            "job_id": job.id,
            "job_name": template.name if template else "Unknown",
            "quantity": job.quantity,
            "due_date": job.due_date.isoformat(),
            "completion_percentage": job.completion_percentage
        })
    
    return {
        "intent": "pending_jobs",
        "data": pending,
        "message": f"Found {len(pending)} pending job(s)"
    }

def get_schedule_timetable(db: Session):
    """Get schedule timetable with machines on Y-axis and dates on X-axis"""
    from datetime import datetime, timedelta
    
    machines = db.query(models.Machine).all()
    today = date.today()
    
    # Get ALL schedules to find the furthest date
    all_schedules = db.query(models.JobSchedule).all()
    
    if all_schedules:
        max_date = max(s.assigned_date for s in all_schedules)
        end_date = max_date
    else:
        end_date = today
    
    if end_date == today:
        end_date = today + timedelta(days=7)
    
    dates = []
    current = today
    while current <= end_date:
        dates.append(current)
        current += timedelta(days=1)
    
    # Initialize schedule data structure
    schedule_data = {}
    for machine in machines:
        schedule_data[machine.name] = {}
        for d in dates:
            schedule_data[machine.name][d.isoformat()] = []
    
    # Populate schedule data with client names
    for schedule in all_schedules:
        machine = db.query(models.Machine).filter(models.Machine.id == schedule.machine_id).first()
        job = db.query(models.Job).filter(models.Job.id == schedule.job_id).first()
        template = db.query(models.JobTemplate).filter(models.JobTemplate.id == job.template_id).first() if job else None
        
        if machine and job and template:
            date_str = schedule.assigned_date.isoformat()
            if date_str in schedule_data[machine.name]:
                # CRITICAL: Build the display name with client
                base_name = template.name
                if job.client_name and job.client_name.strip():
                    display_name = f"{base_name} - {job.client_name}"
                else:
                    display_name = base_name
                
                job_info = f"{display_name} (Step {schedule.process_step})"
                
                # Avoid duplicates
                if job_info not in schedule_data[machine.name][date_str]:
                    schedule_data[machine.name][date_str].append(job_info)
    
    return {
        "intent": "schedule_timetable",
        "machines": [m.name for m in machines],
        "dates": [d.isoformat() for d in dates],
        "schedule_data": schedule_data,
        "message": f"Showing schedule from {today.strftime('%b %d, %Y')} to {end_date.strftime('%b %d, %Y')} ({len(dates)} days)"
    }

def get_jobs_near_due(db: Session, days_threshold: int = 5):
    """Get jobs due within threshold days"""
    today = date.today()
    threshold_date = today + timedelta(days=days_threshold)
    
    # Include jobs that are overdue as well
    jobs = db.query(models.Job).filter(
        models.Job.due_date <= threshold_date,
        models.Job.completion_percentage < 100
    ).all()
    
    near_due = []
    for job in jobs:
        template = db.query(models.JobTemplate).filter(models.JobTemplate.id == job.template_id).first()
        days_remaining = (job.due_date - today).days
        
        # Determine urgency
        if days_remaining < 0:
            urgency = "🔴 OVERDUE"
            urgency_level = 0
        elif days_remaining == 0:
            urgency = "🔴 DUE TODAY"
            urgency_level = 1
        elif days_remaining <= 2:
            urgency = "🔴 URGENT"
            urgency_level = 2
        elif days_remaining <= 5:
            urgency = "🟡 Due soon"
            urgency_level = 3
        else:
            urgency = "🟢 On track"
            urgency_level = 4
            
        near_due.append({
            "job_id": job.id,
            "job_name": template.name if template else "Unknown",
            "client_name": job.client_name or "N/A",
            "due_date": job.due_date.isoformat(),
            "days_remaining": days_remaining,
            "completion_percentage": job.completion_percentage,
            "urgency": urgency,
            "urgency_level": urgency_level
        })
    
    # Sort by urgency (most urgent first)
    near_due.sort(key=lambda x: (x["urgency_level"], x["days_remaining"]))
    
    return {
        "intent": "jobs_near_due",
        "data": near_due,
        "message": f"Found {len(near_due)} job(s) due within {days_threshold} days" if near_due else "No jobs are near their due date!",
        "threshold_days": days_threshold
    }

def detect_intent(question: str):
    """Enhanced intent detection with more patterns"""
    q = question.lower()
    
    # Check for specific machine question
    machine_pattern = r'(?:is|check|tell me about) (\w+(?:\s+\w+)*)\s+(?:available|free|idle|booked|busy)'
    match = re.search(machine_pattern, q)
    if match:
        machine_name = match.group(1)
        return ("specific_machine", machine_name)
    
    # Check for "available machines" variations
    if any(word in q for word in ["available machine", "available mission", "idle machine", "free machine", "which machines", "list machines"]):
        return ("available_machines", None)
    
    # Check for pending jobs variations (EXPANDED)
    if any(word in q for word in ["pending job", "incomplete job", "unfinished job", "jobs not done", "remaining jobs", "jobs pending", "pending work", "in progress"]):
        return ("pending_jobs", None)
    
    # Check for near due variations (IMPROVED - covers more patterns)
    near_due_patterns = [
        "near due", "near their due", "nearest to due", "approaching due", 
        "due soon", "urgent", "deadline", "jobs due", "due date", 
        "close to deadline", "upcoming deadline", "about to due",
        "near deadline", "approaching deadline"
    ]
    
    if any(pattern in q for pattern in near_due_patterns):
        return ("jobs_near_due", None)
    
    # Check for schedule variations
    if any(word in q for word in ["schedule", "timetable", "gantt", "calendar", "timeline"]):
        return ("schedule_timetable", None)
    
    else:
        return ("general", None)

@router.post("/ask")
def ask_ai(question: schemas.AIQuestion, db: Session = Depends(get_db)):
    """Process AI assistant questions with enhanced natural language understanding"""
    
    intent, param = detect_intent(question.question)
    
    # Debug print to see what intent was detected
    print(f"Question: '{question.question}' -> Detected intent: {intent}, param: {param}")
    
    # Handle specific machine availability
    if intent == "specific_machine":
        result = check_specific_machine_availability(db, param)
        return {
            "answer": result["answer"],
            "data": result,
            "visualization": None
        }
    
    # Handle available machines
    elif intent == "available_machines":
        result = get_available_machines_today(db)
        answer = result["message"] + "\n\n"
        if result["available"]:
            answer += "Available machines:\n"
            for m in result["available"]:
                answer += f"  ✅ {m['machine_name']} ({m['machine_type']}) - Efficiency: {m['efficiency']} units/day\n"
        if result["unavailable"]:
            answer += "\nBusy machines today:\n"
            for m in result["unavailable"]:
                answer += f"  ❌ {m['machine_name']} ({m['machine_type']})\n"
        
        return {
            "answer": answer,
            "data": result["available"],
            "visualization": None
        }
    
    # Handle pending jobs
    elif intent == "pending_jobs":
        result = get_pending_jobs_response(db)
        answer = result["message"] + "\n\n"
        if result["data"]:
            for job in result["data"]:
                answer += f"  📋 {job['job_name']}: {job['quantity']} units - {job['completion_percentage']}% complete - Due: {job['due_date']}\n"
        else:
            answer = "No pending jobs found! All jobs are complete. 🎉"
        
        return {
            "answer": answer,
            "data": result["data"],
            "visualization": None
        }
    
    # Handle jobs near due (UPDATED with better response)
    elif intent == "jobs_near_due":
        result = get_jobs_near_due(db)
        
        if result["data"]:
            answer = f"📅 **{result['message']}**\n\n"
            for job in result["data"]:
                if job["days_remaining"] < 0:
                    days_text = f"{abs(job['days_remaining'])} days overdue"
                elif job["days_remaining"] == 0:
                    days_text = "Due TODAY"
                elif job["days_remaining"] == 1:
                    days_text = "Due tomorrow"
                else:
                    days_text = f"Due in {job['days_remaining']} days"
                
                answer += f"  {job['urgency']} **{job['job_name']}**\n"
                answer += f"     Client: {job['client_name']}\n"
                answer += f"     {days_text} ({job['due_date']})\n"
                answer += f"     Progress: {job['completion_percentage']}% complete\n\n"
        else:
            answer = "✅ **No jobs are near their due date!**\n\nAll active jobs have at least 5 days remaining until their deadline. Great planning!"
        
        return {
            "answer": answer,
            "data": result["data"],
            "visualization": None
        }
    
    # Handle schedule timetable
    elif intent == "schedule_timetable":
        result = get_schedule_timetable(db)
        return {
            "answer": result["message"],
            "data": None,
            "visualization": {
                "type": "gantt",
                "machines": result["machines"],
                "dates": result["dates"],
                "schedule_data": result["schedule_data"]
            }
        }
    
    # General fallback
    else:
        return {
            "answer": """I can help you with production queries! Try asking:

📌 **Machine queries:**
• "What are the available machines today?"
• "Is RPX melting available today?"
• "Which machines are busy?"

📌 **Job queries:**
• "What are the pending jobs?"
• "Which jobs are near their due date?"
• "Show me urgent jobs"
• "What jobs are due soon?"

📌 **Schedule queries:**
• "Show me the schedule timetable"
• "Show Gantt chart"

What would you like to know?""",
            "data": None,
            "visualization": None
        }
from sqlalchemy.orm import Session
from app.models import MachineType, JobTemplate, JobTemplateProcess
from datetime import date

# Predefined machine types (5 types)
MACHINE_TYPES = [
    "cutting",
    "grinding", 
    "melting",
    "molding",
    "assembling"
]

# Job templates with their process sequences (using machine type names)
JOB_TEMPLATES = {
    "brakes": ["cutting", "assembling", "molding"],
    "wheels": ["grinding", "melting", "molding", "assembling"],
    "pedals": ["cutting", "grinding", "assembling"],
    "seats": ["melting", "molding", "assembling"],
    "steering": ["cutting", "molding", "assembling"]
}

def seed_machine_types(db: Session):
    """Seed predefined machine types"""
    for type_name in MACHINE_TYPES:
        existing = db.query(MachineType).filter(MachineType.name == type_name).first()
        if not existing:
            machine_type = MachineType(name=type_name)
            db.add(machine_type)
    db.commit()
    print(f"✓ Seeded {len(MACHINE_TYPES)} machine types")

def seed_job_templates(db: Session):
    """Seed job templates with their process sequences"""
    # Get machine type mapping
    machine_type_map = {mt.name: mt.id for mt in db.query(MachineType).all()}
    
    for job_name, process_names in JOB_TEMPLATES.items():
        # Check if template already exists
        existing = db.query(JobTemplate).filter(JobTemplate.name == job_name).first()
        if existing:
            continue
        
        # Create job template
        job_template = JobTemplate(name=job_name)
        db.add(job_template)
        db.flush()  # Get the ID
        
        # Add processes
        for order, process_name in enumerate(process_names, start=1):
            machine_type_id = machine_type_map.get(process_name)
            if machine_type_id:
                process = JobTemplateProcess(
                    job_template_id=job_template.id,
                    step_order=order,
                    machine_type_id=machine_type_id
                )
                db.add(process)
    
    db.commit()
    print(f"✓ Seeded {len(JOB_TEMPLATES)} job templates")

def seed_initial_machines(db: Session):
    """Seed some initial machines for testing"""
    from app.models import Machine
    
    machine_type_map = {mt.name: mt.id for mt in db.query(MachineType).all()}
    
    machines_data = [
        {"name": "Machine1", "machine_type_id": machine_type_map["cutting"], "efficiency": 5000, "status": "idle"},
        {"name": "Machine2", "machine_type_id": machine_type_map["grinding"], "efficiency": 4500, "status": "idle"},
        {"name": "Machine3", "machine_type_id": machine_type_map["melting"], "efficiency": 3000, "status": "idle"},
        {"name": "Machine4", "machine_type_id": machine_type_map["molding"], "efficiency": 4000, "status": "idle"},
        {"name": "Machine5", "machine_type_id": machine_type_map["assembling"], "efficiency": 6000, "status": "idle"},
        {"name": "Machine6", "machine_type_id": machine_type_map["cutting"], "efficiency": 5500, "status": "idle"},
        {"name": "Machine7", "machine_type_id": machine_type_map["assembling"], "efficiency": 5000, "status": "idle"},
    ]
    
    for machine_data in machines_data:
        existing = db.query(Machine).filter(Machine.name == machine_data["name"]).first()
        if not existing:
            machine = Machine(**machine_data, booked_dates=[])
            db.add(machine)
    
    db.commit()
    print(f"✓ Seeded {len(machines_data)} initial machines")

def seed_all(db: Session):
    """Run all seed functions"""
    print("🌱 Seeding database...")
    seed_machine_types(db)
    seed_job_templates(db)
    seed_initial_machines(db)
    print("✅ Seeding complete!")
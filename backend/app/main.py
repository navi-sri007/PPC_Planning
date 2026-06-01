from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import machines, jobs, dashboard, ai_assistant
from app.seed_data import seed_all
from app.database import SessionLocal

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed initial data
db = SessionLocal()
try:
    seed_all(db)
finally:
    db.close()

app = FastAPI(
    title="Mission Production PPC AI Assistant",
    description="Backend API for production planning and control with AI assistant",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(machines.router)
app.include_router(jobs.router)
app.include_router(dashboard.router)
app.include_router(ai_assistant.router)

@app.get("/")
def root():
    return {
        "message": "Mission Production PPC AI Assistant API",
        "version": "1.0.0",
        "endpoints": {
            "machines": "/api/machines",
            "jobs": "/api/jobs",
            "dashboard": "/api/dashboard",
            "ai_assistant": "/api/ai/ask"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
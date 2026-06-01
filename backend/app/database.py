from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Use PostgreSQL (recommended for production)
# You can use a free PostgreSQL service like Supabase, Neon, or local install
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://user:password@localhost/mission_ppc"
)

# Configure SSL for Supabase (required)
if DATABASE_URL and "supabase" in DATABASE_URL:
    # Supabase requires SSL connection
    engine = create_engine(
        DATABASE_URL,
        pool_size=int(os.getenv("DB_POOL_SIZE", 20)),
        max_overflow=int(os.getenv("DB_MAX_OVERFLOW", 0)),
        pool_pre_ping=True,  # Verify connections before using
        connect_args={
            "sslmode": "require",  # Required for Supabase
        }
    )
elif DATABASE_URL:
    # Other PostgreSQL databases
    engine = create_engine(
        DATABASE_URL,
        pool_size=int(os.getenv("DB_POOL_SIZE", 20)),
        max_overflow=int(os.getenv("DB_MAX_OVERFLOW", 0)),
        pool_pre_ping=True,
    )
else:
    # Fallback to SQLite for development
    DATABASE_URL = "sqlite:///./mission_ppc.db"
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False, "timeout": 30}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
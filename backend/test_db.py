from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Connecting to: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'database'}")

try:
    engine = create_engine(DATABASE_URL, connect_args={"sslmode": "require"})
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        version = result.fetchone()
        print(f"✅ Connected successfully!")
        print(f"PostgreSQL version: {version[0]}")
except Exception as e:
    print(f"❌ Connection failed: {str(e)}")
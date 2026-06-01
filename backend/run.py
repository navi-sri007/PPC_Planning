
import os
from dotenv import load_dotenv

# Load .env file BEFORE anything else
load_dotenv()
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
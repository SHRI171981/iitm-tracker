from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.database import engine, Base
from app.routers import test

# Automatic database schema generation.
# Executes DDL to create tables defined in models.py if they do not exist.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IITM Tracker",
    description="Local backend for IITM subject tracking",
    version="0.1.0"
)

# Permissive CORS policy optimized for local frontend development running on distinct ports.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routes
app.include_router(test.router)

@app.get("/api/health")
def health_check():
    """Validates application and routing availability."""
    return {"status": "active"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
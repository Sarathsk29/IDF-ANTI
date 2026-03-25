import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import engine
from database.models import Base
from routers import cases, upload, analyze, report

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    os.makedirs(os.getenv("UPLOAD_DIR", "./uploads"), exist_ok=True)
    os.makedirs(os.getenv("REPORTS_DIR", "./reports"), exist_ok=True)
    
    # Normally we use alembic, but creating tables here ensures quick startup for dev
    Base.metadata.create_all(bind=engine)
    
    yield
    # Shutdown actions

app = FastAPI(title="Forensic Analysis API", lifespan=lifespan)

# Allow all origins for dev environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
app.include_router(report.router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}

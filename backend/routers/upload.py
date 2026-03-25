import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from uuid import UUID
from database.connection import get_db
from database.models import Case, Evidence
from utils.file_utils import save_upload_file, ensure_directory
from pydantic import BaseModel

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

class UploadResponse(BaseModel):
    evidence_id: UUID
    filename: str
    file_type: str
    upload_url: str

@router.post("/{case_id}", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(case_id: UUID, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Verify case exists
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: jpg, png, webp, pdf")
        
    # Read file to check size
    contents = await file.read()
    file_size = len(contents)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File exceeds maximum size of 5MB")
        
    # Reset file pointer for saving
    await file.seek(0)
    
    # Setup directory and path
    upload_dir = os.path.join(os.getenv("UPLOAD_DIR", "./uploads"), str(case_id))
    ensure_directory(upload_dir)
    
    new_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, new_filename)
    
    # Save file
    save_upload_file(file, file_path)
    
    # Determine type
    file_type = "document" if ext == ".pdf" else "image"
    
    # Save to db
    db_evidence = Evidence(
        case_id=case_id,
        filename=new_filename,
        original_filename=file.filename,
        file_type=file_type,
        file_size=file_size,
        file_path=file_path
    )
    
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    
    # Provide URL path 
    upload_url = f"/api/static/uploads/{case_id}/{new_filename}"
    
    return {
        "evidence_id": db_evidence.id,
        "filename": new_filename,
        "file_type": file_type,
        "upload_url": upload_url
    }

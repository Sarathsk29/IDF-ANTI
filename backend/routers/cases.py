from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from database.connection import get_db
from database.models import Case
from pydantic import BaseModel

router = APIRouter(prefix="/cases", tags=["cases"])

class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class CaseResponse(BaseModel):
    id: UUID
    case_number: str
    title: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

def _generate_case_number(db: Session) -> str:
    year = datetime.now().year
    
    # Get the latest case for this year
    latest_case = db.query(Case).filter(Case.case_number.like(f"CASE-{year}-%")).order_by(desc(Case.case_number)).first()
    
    if latest_case:
        try:
            latest_num = int(latest_case.case_number.split("-")[-1])
            next_num = latest_num + 1
        except ValueError:
            next_num = 1
    else:
        next_num = 1
        
    return f"CASE-{year}-{next_num:04d}"

@router.get("", response_model=List[CaseResponse])
def get_cases(db: Session = Depends(get_db)):
    return db.query(Case).order_by(desc(Case.created_at)).all()

@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(case: CaseCreate, db: Session = Depends(get_db)):
    case_number = _generate_case_number(db)
    
    db_case = Case(
        case_number=case_number,
        title=case.title,
        description=case.description
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@router.get("/{case_id}")
def get_case(case_id: UUID, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # Build complete response dict
    return {
        "id": case.id,
        "case_number": case.case_number,
        "title": case.title,
        "description": case.description,
        "status": case.status,
        "created_at": case.created_at,
        "updated_at": case.updated_at,
        "evidence": [
            {
                "id": ev.id,
                "filename": ev.filename,
                "original_filename": ev.original_filename,
                "file_type": ev.file_type,
                "file_size": ev.file_size,
                "uploaded_at": ev.uploaded_at
            } for ev in case.evidence
        ],
        "analysis_results": [
            {
                "id": ar.id,
                "evidence_id": ar.evidence_id,
                "analysis_type": ar.analysis_type,
                "status": ar.status,
                "forgery_detected": ar.forgery_detected,
                "confidence_score": ar.confidence_score,
                "created_at": ar.created_at
            } for ar in case.analysis_results
        ]
    }

@router.put("/{case_id}", response_model=CaseResponse)
def update_case(case_id: UUID, case_update: CaseUpdate, db: Session = Depends(get_db)):
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    if case_update.title is not None:
        db_case.title = case_update.title
    if case_update.description is not None:
        db_case.description = case_update.description
    if case_update.status is not None:
        db_case.status = case_update.status
        
    db.commit()
    db.refresh(db_case)
    return db_case

@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case(case_id: UUID, db: Session = Depends(get_db)):
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    db.delete(db_case)
    db.commit()
    return None

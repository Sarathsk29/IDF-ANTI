import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from uuid import UUID
from database.connection import get_db
from database.models import Case, Evidence, AnalysisResult
from services.report_generator import generate_pdf_report

router = APIRouter(prefix="/report", tags=["report"])

@router.get("/{result_id}/status")
def check_report_status(result_id: UUID, db: Session = Depends(get_db)):
    result = db.query(AnalysisResult).filter(AnalysisResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Analysis result not found")
        
    report_path = os.path.join(os.getenv("REPORTS_DIR", "./reports"), str(result.case_id), f"report_{result.case_id}.pdf")
    exists = os.path.exists(report_path) and result.status == "completed"
    return {"exists": exists, "status": result.status}

@router.get("/{result_id}")
def download_report(result_id: UUID, db: Session = Depends(get_db)):
    result = db.query(AnalysisResult).filter(AnalysisResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Analysis result not found")
        
    if result.status != "completed":
        raise HTTPException(status_code=400, detail="Analysis not completed yet")
        
    evidence = result.evidence
    case = result.case
    
    case_data = {
        "case_number": case.case_number,
        "title": case.title,
        "created_at": str(case.created_at)
    }
    
    result_data = {
        "analysis_type": result.analysis_type,
        "forgery_detected": result.forgery_detected,
        "confidence_score": result.confidence_score,
        "detection_methods": result.detection_methods,
        "findings": result.findings,
        "heatmap_path": result.heatmap_path,
        "annotated_image_path": result.annotated_image_path,
        "created_at": str(result.created_at),
        "evidence": {
            "original_filename": evidence.original_filename,
            "file_size": evidence.file_size
        }
    }
    
    output_dir = os.path.join(os.getenv("REPORTS_DIR", "./reports"), str(result.case_id))
    report_path = generate_pdf_report(str(case.id), case_data, result_data, output_dir)
    
    if not os.path.exists(report_path):
        raise HTTPException(status_code=500, detail="Failed to generate PDF report")
        
    return FileResponse(
        path=report_path, 
        filename=f"Report_{case.case_number}.pdf",
        media_type="application/pdf"
    )

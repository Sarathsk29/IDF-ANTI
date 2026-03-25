import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from database.connection import get_db, SessionLocal
from database.models import Case, Evidence, AnalysisResult
from pydantic import BaseModel
from services.sift_detector import detect_copy_move
from services.ela_detector import perform_ela
from services.document_detector import analyze_document
from services.ai_detector import detect_ai_manipulation

router = APIRouter(prefix="/analyze", tags=["analyze"])

class AnalyzeRequest(BaseModel):
    analysis_type: str # "image_forgery" | "document_forgery" | "ai_detection"

def run_analysis_task(result_id: UUID, evidence_id: UUID, analysis_type: str):
    db = SessionLocal()
    try:
        # get evidence
        evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
        if not evidence:
            return
            
        output_dir = os.path.join(os.getenv("REPORTS_DIR", "./reports"), str(evidence.case_id))
        os.makedirs(output_dir, exist_ok=True)
        
        result_data = {}
        if analysis_type == "image_forgery":
            sift_res = detect_copy_move(evidence.file_path, output_dir)
            ela_res = perform_ela(evidence.file_path, output_dir)
            
            forgery_detected = sift_res.get("forgery_detected", False) or ela_res.get("forgery_detected", False)
            confidence = max(sift_res.get("confidence_score", 0), ela_res.get("confidence_score", 0))
            methods = ["SIFT Keypoint Matching", "Error Level Analysis"]
            findings = sift_res.get("findings", []) + ela_res.get("findings", [])
            
            result_data = {
                "forgery_detected": forgery_detected,
                "confidence_score": float(confidence),
                "detection_methods": methods,
                "findings": findings,
                "heatmap_path": ela_res.get("heatmap_path"),
                "annotated_image_path": sift_res.get("annotated_image")
            }
        elif analysis_type == "document_forgery":
            doc_res = analyze_document(evidence.file_path, output_dir)
            result_data = {
                "forgery_detected": doc_res.get("forgery_detected", False),
                "confidence_score": float(doc_res.get("confidence_score", 0)),
                "detection_methods": ["OCR Extraction", "Metadata Analysis"],
                "findings": doc_res.get("findings", []),
                "heatmap_path": None,
                "annotated_image_path": None
            }
        elif analysis_type == "ai_detection":
            ai_res = detect_ai_manipulation(evidence.file_path, output_dir)
            result_data = {
                "forgery_detected": ai_res.get("forgery_detected", False),
                "confidence_score": float(ai_res.get("confidence_score", 0)),
                "detection_methods": ["ELA", "Noise Variation (LBP)", "Frequency Details (FFT)", "Edge Consistency"],
                "findings": ai_res.get("findings", []),
                "heatmap_path": ai_res.get("heatmap_path"),
                "annotated_image_path": None
            }
        else:
            raise ValueError(f"Unknown analysis type: {analysis_type}")
            
        # Complete
        db_result = db.query(AnalysisResult).filter(AnalysisResult.id == result_id).first()
        if db_result:
            db_result.status = "completed"
            db_result.completed_at = datetime.utcnow()
            for k, v in result_data.items():
                setattr(db_result, k, v)
            db.commit()
            
    except Exception as e:
        db_result = db.query(AnalysisResult).filter(AnalysisResult.id == result_id).first()
        if db_result:
            db_result.status = "failed"
            db_result.completed_at = datetime.utcnow()
            db_result.findings = [f"System processing error: {str(e)}"]
            db.commit()
    finally:
        db.close()


@router.post("/{evidence_id}", status_code=202)
def start_analysis(evidence_id: UUID, request: AnalyzeRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
        
    # Create processing record
    result = AnalysisResult(
        evidence_id=evidence_id,
        case_id=evidence.case_id,
        analysis_type=request.analysis_type,
        status="processing"
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    
    # Start background task
    background_tasks.add_task(run_analysis_task, result.id, evidence_id, request.analysis_type)
    
    # Return initial result structure
    return {
        "id": result.id,
        "evidence_id": result.evidence_id,
        "case_id": result.case_id,
        "analysis_type": result.analysis_type,
        "status": result.status,
        "created_at": result.created_at
    }

@router.get("/{result_id}")
def get_analysis_result(result_id: UUID, db: Session = Depends(get_db)):
    result = db.query(AnalysisResult).filter(AnalysisResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Analysis result not found")
        
    return {
        "id": result.id,
        "evidence_id": result.evidence_id,
        "case_id": result.case_id,
        "analysis_type": result.analysis_type,
        "status": result.status,
        "forgery_detected": result.forgery_detected,
        "confidence_score": result.confidence_score,
        "detection_methods": result.detection_methods,
        "findings": result.findings,
        "heatmap_path": result.heatmap_path,
        "annotated_image_path": result.annotated_image_path,
        "created_at": result.created_at,
        "completed_at": result.completed_at
    }

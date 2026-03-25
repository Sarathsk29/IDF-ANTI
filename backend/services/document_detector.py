import os
from datetime import datetime
import pytesseract
import fitz  # PyMuPDF
from PIL import Image
import cv2

def analyze_document(file_path: str, output_dir: str) -> dict:
    \"\"\"
    Analyzes a document (PDF or image) for signs of forgery using OCR and metadata extraction.
    \"\"\"
    try:
        is_pdf = file_path.lower().endswith(".pdf")
        
        text_extracted = ""
        metadata = {}
        anomalies = []
        findings = []
        page_count = 1
        
        if is_pdf:
            # For PDF files: use PyMuPDF (fitz)
            doc = fitz.open(file_path)
            page_count = len(doc)
            
            for page_num in range(page_count):
                page = doc.load_page(page_num)
                text_extracted += page.get_text()
                
            # Extract metadata
            pdf_metadata = doc.metadata
            metadata = {
                "format": pdf_metadata.get("format", "PDF"),
                "title": pdf_metadata.get("title", ""),
                "author": pdf_metadata.get("author", ""),
                "creator": pdf_metadata.get("creator", ""), # Software used
                "producer": pdf_metadata.get("producer", ""),
                "creation_date": pdf_metadata.get("creationDate", ""),
                "mod_date": pdf_metadata.get("modDate", ""),
            }
            doc.close()
            
            # Metadata tampering checks
            if metadata.get("creator") and any(sw in metadata["creator"].lower() for sw in ["photoshop", "illustrator", "gimp", "canva"]):
                anomalies.append(f"Suspicious creator software detected: {metadata['creator']}")
                
            # Date checks (very basic string compare, robust would parse PDF dates)
            c_date = metadata.get("creation_date", "")
            m_date = metadata.get("mod_date", "")
            if c_date and m_date and c_date != m_date:
                # If modification date exists and is different
                anomalies.append("Document has been modified after creation.")
                
        else:
            # For image files: use pytesseract OCR
            img = Image.open(file_path)
            
            # Get some basic image metadata
            metadata = {
                "format": img.format,
                "mode": img.mode,
                "size": f"{img.size[0]}x{img.size[1]}",
            }
            
            if "exif" in img.info:
                metadata["has_exif"] = "True"
                # Exif parsing omitted for brevity but can be added
                
            # 1. Extract text using OCR
            text_extracted = pytesseract.image_to_string(img)
            
            # Using OCR data with confidence
            try:
                ocr_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
                confidences = [int(c) for c in ocr_data['conf'] if int(c) != -1]
                
                if confidences:
                    avg_conf = sum(confidences) / len(confidences)
                    low_conf_words = len([c for c in confidences if c < 50])
                    
                    if low_conf_words > len(confidences) * 0.1: # If more than 10% words have low confidence
                        anomalies.append(f"Detected {low_conf_words} words with low OCR confidence, possible text tampering or poor quality.")
            except Exception as ocr_e:
                pass # pytesseract.image_to_data might fail on some platforms
                
        # Common text analysis for anomalies
        import re
        
        # Check for suspicious patterns (numbers replacing letters, etc)
        # E.g., '1' instead of 'l' or 'I', '0' instead of 'O'
        suspicious_chars = re.findall(r'[a-zA-Z][0-9][a-zA-Z]', text_extracted)
        if len(suspicious_chars) > 2:
            anomalies.append(f"Found {len(suspicious_chars)} unusual mixed alphanumeric patterns which may indicate altered text.")
            
        # Check for multiple spaces (can represent erased text)
        multiple_spaces = len(re.findall(r' {3,}', text_extracted))
        if multiple_spaces > 5:
            anomalies.append(f"Detected {multiple_spaces} instances of unusual spacing, possibly indicating erased or aligned text.")
            
        forgery_detected = len(anomalies) > 0
        confidence_score = min(1.0, len(anomalies) * 0.25)
        
        if not forgery_detected:
            confidence_score = 0.9 # High confidence it's standard
            findings.append("No obvious anomalies detected in document structure or text.")
        else:
            findings.extend(anomalies)
            findings.append(f"Overall risk assessment: {'High' if confidence_score > 0.5 else 'Medium'} due to detected anomalies.")
            
        return {
            "forgery_detected": forgery_detected,
            "confidence_score": round(confidence_score, 2),
            "text_extracted": text_extracted[:500] + "..." if len(text_extracted) > 500 else text_extracted,
            "metadata": metadata,
            "anomalies": anomalies,
            "findings": findings,
            "page_count": page_count
        }
        
    except Exception as e:
        return {
            "forgery_detected": False,
            "confidence_score": 0.0,
            "text_extracted": "",
            "metadata": {},
            "anomalies": [],
            "findings": [f"Error during document analysis: {str(e)}"],
            "page_count": 0
        }

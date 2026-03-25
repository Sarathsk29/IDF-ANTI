import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_pdf_report(case_id: str, case_data: dict, result_data: dict, output_dir: str) -> str:
    """
    Generates a professional forensic PDF report using ReportLab.
    
    case_data: dict containing case_number, title, created_at
    result_data: dict containing analysis_type, forgery_detected, confidence_score, detection_methods, findings, heatmap_path, annotated_image_path, evidence (filename, file_size, etc)
    """
    os.makedirs(output_dir, exist_ok=True)
    report_path = os.path.join(output_dir, f"report_{case_id}.pdf")
    
    doc = SimpleDocTemplate(report_path, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    Story = []
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='CenterTitle', parent=styles['Heading1'], alignment=1, fontSize=24, spaceAfter=20))
    styles.add(ParagraphStyle(name='VerdictAuth', parent=styles['Heading1'], alignment=1, fontSize=28, textColor=colors.green, spaceAfter=20))
    styles.add(ParagraphStyle(name='VerdictTamp', parent=styles['Heading1'], alignment=1, fontSize=28, textColor=colors.red, spaceAfter=20))
    styles.add(ParagraphStyle(name='FindingList', parent=styles['Normal'], leftIndent=20, bulletIndent=10, spaceAfter=6))
    
    # --- PAGE 1: COVER PAGE ---
    Story.append(Spacer(1, 2*inch))
    Story.append(Paragraph("Digital Forensic Analysis Report", styles["CenterTitle"]))
    Story.append(Spacer(1, 0.5*inch))
    
    Story.append(Paragraph(f"<b>Case Number:</b> {case_data.get('case_number', 'N/A')}", styles["Normal"]))
    Story.append(Paragraph(f"<b>Case Title:</b> {case_data.get('title', 'N/A')}", styles["Normal"]))
    Story.append(Paragraph(f"<b>Date Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))
    Story.append(Spacer(1, 1*inch))
    
    Story.append(Paragraph("<b>CLASSIFICATION: CONFIDENTIAL</b>", ParagraphStyle(name='Confidential', alignment=1, textColor=colors.red)))
    Story.append(PageBreak())
    
    # --- PAGE 2: SUMMARY & RESULTS ---
    Story.append(Paragraph("Analysis Summary", styles["Heading1"]))
    
    # Details Table
    evidence = result_data.get("evidence", {})
    details_data = [
        ["Property", "Value"],
        ["Evidence File", evidence.get("original_filename", "N/A")],
        ["File Size", f"{evidence.get('file_size', 0) / 1024:.2f} KB"],
        ["Analysis Type", result_data.get("analysis_type", "N/A").replace("_", " ").title()],
        ["Analysis Date", result_data.get("created_at", "N/A")]
    ]
    
    t = Table(details_data, colWidths=[2*inch, 4*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (1,0), colors.lightgrey),
        ('TEXTCOLOR', (0,0), (1,0), colors.black),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,-0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,1), (-1,-1), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 1, colors.black)
    ]))
    Story.append(t)
    Story.append(Spacer(1, 0.5*inch))
    
    # Verdict
    is_forged = result_data.get("forgery_detected", False)
    verdict_text = "TAMPERED / MANIPULATED" if is_forged else "AUTHENTIC / VERIFIED"
    verdict_style = styles["VerdictTamp"] if is_forged else styles["VerdictAuth"]
    Story.append(Paragraph("FINAL VERDICT", styles["Heading2"]))
    Story.append(Paragraph(verdict_text, verdict_style))
    
    confidence = result_data.get("confidence_score", 0.0) * 100
    Story.append(Paragraph(f"<b>Confidence Score:</b> {confidence:.2f}%", styles["Normal"]))
    Story.append(Spacer(1, 0.2*inch))
    
    # Findings
    Story.append(Paragraph("Detailed Findings", styles["Heading2"]))
    findings = result_data.get("findings", [])
    if isinstance(findings, list):
        for idx, finding in enumerate(findings):
            Story.append(Paragraph(f"{idx+1}. {finding}", styles["FindingList"]))
    elif isinstance(findings, str) and findings:
        Story.append(Paragraph(f"1. {findings}", styles["FindingList"]))
    else:
        Story.append(Paragraph("No specific findings recorded.", styles["Normal"]))
        
    Story.append(PageBreak())
    
    # --- PAGE 3: VISUAL EVIDENCE ---
    Story.append(Paragraph("Visual Evidence", styles["Heading1"]))
    
    hm_path = result_data.get("heatmap_path")
    if hm_path and os.path.exists(hm_path):
        Story.append(Paragraph("<b>Error Level Analysis Heatmap:</b>", styles["Normal"]))
        Story.append(Spacer(1, 0.1*inch))
        Story.append(Image(hm_path, width=4*inch, height=3*inch, kind='proportional'))
        Story.append(Spacer(1, 0.2*inch))
        
    ann_path = result_data.get("annotated_image_path")
    if ann_path and os.path.exists(ann_path):
        Story.append(Paragraph("<b>Annotated Keypoint Matches / Regions:</b>", styles["Normal"]))
        Story.append(Spacer(1, 0.1*inch))
        Story.append(Image(ann_path, width=4*inch, height=3*inch, kind='proportional'))
        
    if not (hm_path and os.path.exists(hm_path)) and not (ann_path and os.path.exists(ann_path)):
        Story.append(Paragraph("No visual evidence generated for this analysis type.", styles["Normal"]))
        
    Story.append(PageBreak())
    
    # --- PAGE 4: CONCLUSION ---
    Story.append(Paragraph("Conclusion", styles["Heading1"]))
    
    if is_forged:
        Story.append(Paragraph("Based on the forensic analysis, including statistical anomaly detection and visual artifact extraction, the provided evidence file exhibits strong indications of digital tampering. It should not be considered as a completely pristine or original document in its current state.", styles["Normal"]))
    else:
        Story.append(Paragraph("The forensic analysis engines did not detect any significant anomalies or recognizable digital tampering patterns. The evidence appears to be consistent with standard, unmanipulated files of its type.", styles["Normal"]))
        
    Story.append(Spacer(1, 0.5*inch))
    Story.append(Paragraph("<i>Disclaimer: This report is generated automatically by the Multi-Modal Digital Forgery Detection System using statistical and AI-driven models. Results should be reviewed by a human forensic expert before being used in legal proceedings.</i>", styles["Normal"]))
    
    doc.build(Story)
    return report_path

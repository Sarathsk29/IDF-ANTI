import os
import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance

def perform_ela(image_path: str, output_dir: str, quality: int = 90) -> dict:
    \"\"\"
    Performs Error Level Analysis (ELA) on an image to detect potential manipulations.
    \"\"\"
    try:
        # 1. Open image with Pillow
        original_img = Image.open(image_path).convert("RGB")
        
        # 2. Resave at specified JPEG quality to temp file
        temp_filename = os.path.join(output_dir, "temp_ela.jpg")
        original_img.save(temp_filename, "JPEG", quality=quality)
        temp_img = Image.open(temp_filename)
        
        # 3. Compute pixel-wise difference between original and resaved
        ela_img = ImageChops.difference(original_img, temp_img)
        
        # 4. Scale difference values for visibility (multiply by 15)
        extrema = ela_img.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        if max_diff == 0:
            max_diff = 1
        scale = 255.0 / max_diff
        ela_img = ImageEnhance.Brightness(ela_img).enhance(scale)
        
        # Convert to numpy array for CV2 processing
        ela_cv = cv2.cvtColor(np.array(ela_img), cv2.COLOR_RGB2BGR)
        
        # 5. Apply colormap (cv2.COLORMAP_JET) for heatmap visualization
        heatmap = cv2.applyColorMap(ela_cv, cv2.COLORMAP_JET)
        
        # 6. Compute statistics: mean ELA, max ELA, std deviation
        ela_gray = cv2.cvtColor(np.array(ela_img), cv2.COLOR_RGB2GRAY)
        mean_ela = np.mean(ela_gray)
        max_ela = np.max(ela_gray)
        std_ela = np.std(ela_gray)
        
        # 7. Detect suspicious regions (high ELA areas using threshold)
        _, thresholded = cv2.threshold(ela_gray, 50, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresholded, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        suspicious_regions_count = len([c for c in contours if cv2.contourArea(c) > 50])
        
        # 8. Save heatmap image to output_dir
        heatmap_path = os.path.join(output_dir, "ela_heatmap.png")
        cv2.imwrite(heatmap_path, heatmap)
        
        # Clean up temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
            
        # Determine forgery based on thresholds
        # Standard unedited images typically have lower mean ELA and fewer suspicious regions
        forgery_detected = bool(suspicious_regions_count > 5 or mean_ela > 20)
        
        # Calculate a basic confidence score
        confidence_score = min(1.0, (mean_ela / 50.0) + (suspicious_regions_count / 20.0))
        if not forgery_detected:
            confidence_score = 1.0 - confidence_score
        
        findings = []
        if forgery_detected:
            findings.append(f"Detected {suspicious_regions_count} suspicious regions with high error levels.")
            findings.append(f"Mean ELA value ({mean_ela:.2f}) is higher than expected for pristine image.")
        else:
            findings.append("ELA variation is consistent across the image.")
            
        return {
            "forgery_detected": forgery_detected,
            "confidence_score": round(confidence_score, 2),
            "mean_ela_value": round(float(mean_ela), 2),
            "max_ela_value": int(max_ela),
            "suspicious_regions_count": suspicious_regions_count,
            "heatmap_path": heatmap_path,
            "findings": findings
        }
        
    except Exception as e:
        return {
            "forgery_detected": False,
            "confidence_score": 0.0,
            "mean_ela_value": 0.0,
            "max_ela_value": 0,
            "suspicious_regions_count": 0,
            "heatmap_path": "",
            "findings": [f"Error during ELA analysis: {str(e)}"]
        }

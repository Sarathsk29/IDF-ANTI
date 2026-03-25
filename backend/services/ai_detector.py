import os
import cv2
import numpy as np
from skimage.feature import local_binary_pattern
from services.ela_detector import perform_ela

def detect_ai_manipulation(image_path: str, output_dir: str) -> dict:
    \"\"\"
    Detects AI-generated or AI-edited images using ELA, noise analysis, 
    frequency domain artifacts, and edge consistency.
    \"\"\"
    try:
        findings = []
        
        # 1. Perform ELA 
        ela_result = perform_ela(image_path, output_dir)
        ela_suspicion_score = ela_result.get("confidence_score", 0.0)
        heatmap_path = ela_result.get("heatmap_path", "")
        if ela_result.get("forgery_detected"):
            findings.append("High ELA variance indicates possible image manipulation.")
            
        img = cv2.imread(image_path)
        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 2. Analyze noise patterns using LBP
        radius = 1
        n_points = 8 * radius
        lbp = local_binary_pattern(img_gray, n_points, radius, method='uniform')
        
        # Calculate LBP histogram
        n_bins = int(lbp.max() + 1)
        hist, _ = np.histogram(lbp.ravel(), bins=n_bins, range=(0, n_bins), density=True)
        
        # AI images tend to have less noise variation than natural ones
        noise_consistency_score = float(np.var(hist))
        if noise_consistency_score < 0.001:
            findings.append("Unnatural smoothness detected in noise pattern (LBP variance extremely low).")
            
        # 3. Frequency domain analysis (FFT)
        f = np.fft.fft2(img_gray)
        fshift = np.fft.fftshift(f)
        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1)
        
        # Look for periodic artifacts in frequency domain
        high_freq_energy = np.sum(magnitude_spectrum[0:50, 0:50]) + np.sum(magnitude_spectrum[-50:, -50:])
        if high_freq_energy > 100000:
            findings.append("Unusual high-frequency artifacts detected, common in GAN/diffusion generated images.")
            
        # 4. Edge consistency analysis
        edges = cv2.Canny(img_gray, 100, 200)
        edge_density = np.sum(edges) / (img_gray.shape[0] * img_gray.shape[1] * 255.0)
        
        # AI images often have unnaturally perfect or few sharp edges
        edge_naturalness_score = 1.0 - abs(0.05 - edge_density) * 10
        edge_naturalness_score = max(0.0, min(1.0, edge_naturalness_score))
        if edge_naturalness_score < 0.3:
            findings.append("Edge distribution lacks natural variation, suspect AI generation.")
            
        # Calculate overall probability
        # ELA: high suspicion = AI mod
        # Noise consistency: low variance = AI mod
        
        ai_probability = 0.0
        ai_probability += ela_suspicion_score * 0.4
        if noise_consistency_score < 0.005: 
            ai_probability += 0.3
        if edge_naturalness_score < 0.5:
            ai_probability += 0.3
            
        ai_probability = min(1.0, ai_probability)
        forgery_detected = ai_probability > 0.6
        
        if forgery_detected:
            findings.append(f"Strong statistical indicators of AI manipulation present (Probability: {ai_probability:.1%}).")
        else:
            findings.append("Image characteristics align with natural photographic sources.")

        return {
            "forgery_detected": forgery_detected,
            "confidence_score": round(ai_probability, 2),
            "ai_probability": round(ai_probability, 2),
            "noise_consistency_score": round(noise_consistency_score, 5),
            "edge_naturalness_score": round(edge_naturalness_score, 2),
            "ela_suspicion_score": round(ela_suspicion_score, 2),
            "heatmap_path": heatmap_path,
            "findings": findings
        }
    except Exception as e:
        return {
            "forgery_detected": False,
            "confidence_score": 0.0,
            "ai_probability": 0.0,
            "noise_consistency_score": 0.0,
            "edge_naturalness_score": 0.0,
            "ela_suspicion_score": 0.0,
            "heatmap_path": "",
            "findings": [f"Error analyzing AI generation signs: {str(e)}"]
        }

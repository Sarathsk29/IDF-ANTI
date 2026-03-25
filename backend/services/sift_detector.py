import os
import cv2
import numpy as np

def detect_copy_move(image_path: str, output_dir: str) -> dict:
    """
    Detects copy-move forgery in an image using SIFT keypoint matching and RANSAC.
    """
    try:
        # 1. Load image, convert to grayscale
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not load image")
        
        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 2. Initialize SIFT detector (cv2.SIFT_create with nfeatures=500)
        sift = cv2.SIFT_create(nfeatures=500)
        
        # 3. Detect keypoints and compute descriptors
        keypoints, descriptors = sift.detectAndCompute(img_gray, None)
        
        if descriptors is None or len(keypoints) < 10:
            return {
                "forgery_detected": False,
                "confidence_score": 1.0,
                "keypoints_detected": len(keypoints) if keypoints else 0,
                "matches_found": 0,
                "inlier_matches": 0,
                "annotated_image": "",
                "findings": ["Not enough keypoints detected for analysis."]
            }
            
        # 4. Use BFMatcher with NORM_L2 and cross-check=True
        bf = cv2.BFMatcher(cv2.NORM_L2, crossCheck=True)
        # We need to match descriptors against themselves to find clones
        # But we must avoid matching a point to itself
        matches = bf.match(descriptors, descriptors)
        
        # Filter out self-matches (distance = 0)
        valid_matches = [m for m in matches if m.distance > 0 and m.queryIdx != m.trainIdx]
        
        # Sort them in the order of their distance
        valid_matches = sorted(valid_matches, key=lambda x: x.distance)
        
        # 5. Apply a distance threshold or spatial distance threshold
        # For copy-move, we want points that are matched but spatially separated
        separated_matches = []
        for match in valid_matches:
            pt1 = np.array(keypoints[match.queryIdx].pt)
            pt2 = np.array(keypoints[match.trainIdx].pt)
            # Distance in pixels between the matched points
            spatial_dist = np.linalg.norm(pt1 - pt2)
            if spatial_dist > 50: # Minimum distance to avoid adjacent pixel matches
                separated_matches.append(match)
                
        # Get the top matches
        good_matches = separated_matches[:100]
        
        inlier_count = 0
        annotated_path = ""
        findings = []
        
        forgery_detected = False
        confidence_score = 0.0
        
        # 6. Use RANSAC homography to filter false matches
        if len(good_matches) > 10:
            src_pts = np.float32([keypoints[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
            dst_pts = np.float32([keypoints[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
            
            # Find homography matrix
            M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
            
            if mask is not None:
                matches_mask = mask.ravel().tolist()
                inlier_count = sum(matches_mask)
                
                # 7. If matches > threshold:
                if inlier_count >= 10: # Threshold for considering it a clone
                    forgery_detected = True
                    confidence_score = min(1.0, inlier_count / 30.0) # Scale confidence up to 30 matches
                    
                    # Highlight matched regions
                    img_annotated = img.copy()
                    
                    # Draw points and lines between matching regions
                    for i, match in enumerate(good_matches):
                        if matches_mask[i]:
                            pt1 = tuple(map(int, keypoints[match.queryIdx].pt))
                            pt2 = tuple(map(int, keypoints[match.trainIdx].pt))
                            cv2.circle(img_annotated, pt1, 4, (0, 0, 255), -1)
                            cv2.circle(img_annotated, pt2, 4, (0, 255, 0), -1)
                            cv2.line(img_annotated, pt1, pt2, (255, 0, 0), 1)
                            
                    annotated_path = os.path.join(output_dir, "sift_annotated.png")
                    cv2.imwrite(annotated_path, img_annotated)
                    
                    findings.append(f"Detected copy-move forgery with {inlier_count} verified keypoint matches.")
                else:
                    findings.append(f"Insufficient clustered matches to confirm forgery ({inlier_count} inliers).")
            else:
                findings.append("Could not calculate valid transformation matrix.")
        else:
            findings.append("No significant duplicate regions detected.")
            
        if not forgery_detected:
            confidence_score = 1.0 # High confidence it's authentic
            
        return {
            "forgery_detected": forgery_detected,
            "confidence_score": round(confidence_score, 2),
            "keypoints_detected": len(keypoints),
            "matches_found": len(separated_matches),
            "inlier_matches": inlier_count,
            "annotated_image": annotated_path,
            "findings": findings
        }
        
    except Exception as e:
        return {
            "forgery_detected": False,
            "confidence_score": 0.0,
            "keypoints_detected": 0,
            "matches_found": 0,
            "inlier_matches": 0,
            "annotated_image": "",
            "findings": [f"Error during SIFT analysis: {str(e)}"]
        }

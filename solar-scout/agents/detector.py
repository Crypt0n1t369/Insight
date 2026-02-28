"""
Phase 3: Solar Panel Detection using Computer Vision
Analyzes satellite images to detect presence of solar panels
"""

import json
import os
import cv2
import numpy as np
from pathlib import Path
import urllib.request
import ssl

# Try to import ML libraries
try:
    import torch
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("⚠️ PyTorch not available, using OpenCV fallback")

OUTPUT_DIR = "/home/drg/.openclaw/workspace/solar-scout/output/images"

def download_satellite_image(url: str, company_name: str) -> str:
    """
    Download satellite image to local file
    Returns: local file path
    """
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Create safe filename
    safe_name = "".join(c for c in company_name if c.isalnum() or c in (' ', '-', '_')).strip()[:30]
    safe_name = safe_name.replace(' ', '_')
    filename = f"{safe_name}_sat.jpg"
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    # Skip if already downloaded
    if os.path.exists(filepath):
        return filepath
    
    try:
        # Download with SSL context
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        
        with urllib.request.urlopen(req, timeout=30, context=ctx) as response:
            with open(filepath, 'wb') as f:
                f.write(response.read())
        
        print(f"   📥 Downloaded: {filename}")
        return filepath
        
    except Exception as e:
        print(f"   ❌ Download failed: {e}")
        return None


def detect_solar_opencv(image_path: str) -> dict:
    """
    Detect solar panels using OpenCV color and shape detection
    Returns: {"detected": bool, "confidence": float, "details": str}
    """
    if not image_path or not os.path.exists(image_path):
        return {"detected": False, "confidence": 0.0, "details": "No image"}
    
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return {"detected": False, "confidence": 0.0, "details": "Could not read image"}
        
        # Convert to different color spaces
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        
        # Solar panel colors to detect:
        # 1. Dark blue / navy (typical solar)
        # 2. Blue-black (photovoltaic)
        # 3. Slight purple tint (anti-reflective coating)
        
        # Define color ranges for solar panels
        lower_blue = np.array([100, 30, 20])
        upper_blue = np.array([140, 180, 120])
        
        lower_dark = np.array([0, 0, 20])
        upper_dark = np.array([180, 80, 80])
        
        # Create masks
        mask_blue = cv2.inRange(hsv, lower_blue, upper_blue)
        mask_dark = cv2.inRange(lab, lower_dark, upper_dark)
        
        # Combine masks
        mask = cv2.bitwise_or(mask_blue, mask_dark)
        
        # Morphological operations to clean up
        kernel = np.ones((5, 5), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Analyze contours for rectangular shapes (solar panel arrays)
        panel_like_contours = 0
        total_panel_area = 0
        
        for cnt in contours:
            # Get bounding rect
            x, y, w, h = cv2.boundingRect(cnt)
            aspect_ratio = float(w) / h if h > 0 else 0
            
            # Solar panels are typically:
            # - Rectangular (aspect ratio between 1:3 and 3:1)
            # - Reasonably large (more than 500 pixels squared)
            # - Not too large (less than half the image)
            area = w * h
            
            if (0.2 < aspect_ratio < 5.0 and 
                500 < area < (img.shape[0] * img.shape[1] * 0.4)):
                
                # Check if it's actually rectangular
                peri = cv2.arcLength(cnt, True)
                approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)
                
                if len(approx) == 4:  # Quadrilateral
                    panel_like_contours += 1
                    total_panel_area += area
        
        # Calculate confidence based on findings
        img_area = img.shape[0] * img.shape[1]
        panel_ratio = total_panel_area / img_area if img_area > 0 else 0
        
        # Decision logic
        detected = False
        confidence = 0.0
        details = ""
        
        if panel_like_contours >= 3:
            detected = True
            confidence = min(0.95, 0.5 + (panel_like_contours * 0.1))
            details = f"Found {panel_like_contours} rectangular objects, {total_panel_area/1000:.1f}k px area"
        elif panel_like_contours >= 1 and panel_ratio > 0.02:
            detected = True
            confidence = 0.6
            details = f"Found {panel_like_contours} potential panel(s)"
        else:
            # Check for grid patterns (solar farms)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            
            # Look for regular grid lines
            lines = cv2.HoughLinesP(edges, 1, np.pi/180, 50, minLineLength=30, maxLineGap=10)
            
            if lines is not None and len(lines) > 20:
                detected = True
                confidence = 0.7
                details = "Grid pattern detected (possible solar farm)"
            else:
                confidence = 0.2
                details = "No solar panel patterns detected"
        
        return {
            "detected": detected,
            "confidence": confidence,
            "details": details,
            "panel_contours": panel_like_contours,
            "area_ratio": round(panel_ratio, 4)
        }
        
    except Exception as e:
        return {
            "detected": False,
            "confidence": 0.0,
            "details": f"Error: {str(e)}"
        }


def detect_solar_ml(image_path: str) -> dict:
    """
    Detect using ML model (YOLO) - placeholder for future implementation
    """
    if not YOLO_AVAILABLE:
        return detect_solar_opencv(image_path)
    
    # Placeholder for YOLO implementation
    # Would use a pre-trained model or fine-tuned solar panel detector
    return detect_solar_opencv(image_path)


async def analyze_company(company: dict) -> dict:
    """
    Full analysis for one company: download image and run detection
    """
    name = company.get("name", "Unknown")
    validation = company.get("validation", {})
    
    if not validation.get("verified"):
        company["solar_analysis"] = {
            "detected": None,
            "confidence": 0.0,
            "details": "Address not validated"
        }
        return company
    
    image_url = validation.get("satellite_image_url", "")
    if not image_url:
        company["solar_analysis"] = {
            "detected": None,
            "confidence": 0.0,
            "details": "No satellite image"
        }
        return company
    
    print(f"\n🔬 Analyzing: {name[:40]}")
    print(f"   Downloading satellite image...")
    
    # Download image
    local_path = download_satellite_image(image_url, name)
    
    if not local_path or not os.path.exists(local_path):
        company["solar_analysis"] = {
            "detected": None,
            "confidence": 0.0,
            "details": "Image download failed"
        }
        return company
    
    company["solar_analysis_image"] = local_path
    
    # Run detection
    print(f"   Running CV detection...")
    result = detect_solar_opencv(local_path)
    
    company["solar_analysis"] = {
        "detected": result["detected"],
        "confidence": result["confidence"],
        "details": result["details"]
    }
    
    status = "☀️ HAS SOLAR" if result["detected"] else "❌ NO SOLAR"
    print(f"   {status} (confidence: {result['confidence']:.0%})")
    print(f"   Details: {result['details']}")
    
    return company


async def run_detection(companies: list) -> list:
    """
    Run solar detection on all validated companies
    """
    print("\n" + "="*60)
    print("PHASE 3: SOLAR PANEL DETECTION")
    print("="*60)
    
    analyzed = []
    
    for company in companies:
        if not company.get("validation", {}).get("verified"):
            analyzed.append(company)
            continue
        
        result = await analyze_company(company)
        analyzed.append(result)
    
    # Save intermediate results
    output_file = "/home/drg/.openclaw/workspace/solar-scout/data/companies_detected.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(analyzed, f, ensure_ascii=False, indent=2)
    
    solar_count = len([c for c in analyzed if c.get("solar_analysis", {}).get("detected") == True])
    no_solar_count = len([c for c in analyzed if c.get("solar_analysis", {}).get("detected") == False])
    
    print(f"\n💾 Analyzed {len(analyzed)} companies")
    print(f"   ☀️ Has solar: {solar_count}")
    print(f"   ❌ No solar: {no_solar_count}")
    
    return analyzed


if __name__ == "__main__":
    import asyncio
    
    # Test detection
    test_img = "/home/drg/.openclaw/workspace/solar-scout/output/images/test.jpg"
    if os.path.exists(test_img):
        result = detect_solar_opencv(test_img)
        print(json.dumps(result, indent=2))

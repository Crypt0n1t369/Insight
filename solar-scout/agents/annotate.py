"""
Phase 6: Image Annotation
Annotates satellite images with pinpoints at company locations
"""

import json
import os
import cv2
import numpy as np

OUTPUT_DIR = "/home/drg/.openclaw/workspace/solar-scout/output/images"


def annotate_satellite_image(company: dict) -> str:
    """
    Create annotated image with pinpoint for company location
    Returns: path to annotated image
    """
    name = company.get("name", "Unknown")
    image_path = company.get("solar_analysis_image")
    
    if not image_path or not os.path.exists(image_path):
        print(f"   ❌ No image to annotate for {name}")
        return None
    
    # Create annotated filename
    safe_name = "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).strip()[:30]
    safe_name = safe_name.replace(' ', '_')
    annotated_path = os.path.join(OUTPUT_DIR, f"{safe_name}_annotated.jpg")
    
    try:
        # Read original image
        img = cv2.imread(image_path)
        if img is None:
            return None
        
        # Get image dimensions
        height, width = img.shape[:2]
        
        # Draw pin marker (red circle with dot)
        center_x = width // 2
        center_y = height // 2
        
        # Outer circle (red)
        cv2.circle(img, (center_x, center_y), 20, (0, 0, 255), -1)
        
        # Inner circle (white)
        cv2.circle(img, (center_x, center_y), 12, (255, 255, 255), -1)
        
        # Center dot (red)
        cv2.circle(img, (center_x, center_y), 5, (0, 0, 255), -1)
        
        # Draw crosshairs
        cv2.line(img, (center_x - 30, center_y), (center_x - 10, center_y), (0, 0, 255), 2)
        cv2.line(img, (center_x + 10, center_y), (center_x + 30, center_y), (0, 0, 255), 2)
        cv2.line(img, (center_x, center_y - 30), (center_x, center_y - 10), (0, 0, 255), 2)
        cv2.line(img, (center_x, center_y + 10), (center_x, center_y + 30), (0, 0, 255), 2)
        
        # Add text label
        # Draw background rectangle for text
        text = name[:25] + "..." if len(name) > 25 else name
        
        # Put text with background
        font = cv2.FONT_HERSHEY_SIMPLEX
        text_size = cv2.getTextSize(text, font, 0.7, 2)[0]
        
        # Background box
        cv2.rectangle(img, 
                     (10, height - 50), 
                     (text_size[0] + 20, height - 10),
                     (0, 0 -1)
       , 0), cv2.rectangle(img, 
                     (10, height - 50), 
                     (text_size[0] + 20, height - 10),
                     (0, 120, 200), 2)
        
        # Text
        cv2.putText(img, text, (20, height - 20), 
                   font, 0.7, (255, 255, 255), 2)
        
        # Add solar status badge
        solar = company.get("solar_analysis", {})
        detected = solar.get("detected")
        
        if detected == False:
            # Green badge - opportunity
            badge_text = "OPPORTUNITY"
            badge_color = (0, 200, 0)  # Green
        elif detected == True:
            # Red badge - has solar
            badge_text = "HAS SOLAR"
            badge_color = (0, 0, 200)  # Red
        else:
            # Yellow badge - unknown
            badge_text = "UNKNOWN"
            badge_color = (0, 200, 200)  # Yellow
        
        # Badge background
        cv2.rectangle(img, (width - 180, 10), (width - 10, 40), badge_color, -1)
        cv2.putText(img, badge_text, (width - 170, 32), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        # Add capacity info if available
        capacity = company.get("capacity", {})
        if capacity.get("estimated_kw", 0) > 0:
            kw_text = f"{capacity['estimated_kw']:.1f} kW"
            cv2.putText(img, kw_text, (width - 180, 65), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Save annotated image
        cv2.imwrite(annotated_path, img)
        
        print(f"   ✅ Annotated: {os.path.basename(annotated_path)}")
        return annotated_path
        
    except Exception as e:
        print(f"   ❌ Annotation error: {e}")
        return None


def run_annotation(companies: list) -> list:
    """
    Annotate all company images
    """
    print("\n" + "="*60)
    print("PHASE 6: IMAGE ANNOTATION")
    print("="*60)
    
    annotated = []
    
    for company in companies:
        name = company.get("name", "Unknown")
        print(f"\n🖼️ Annotating: {name[:40]}")
        
        annotated_path = annotate_satellite_image(company)
        
        if annotated_path:
            company["output_image"] = annotated_path
        else:
            company["output_image"] = None
        
        annotated.append(company)
    
    # Save final results
    output_file = "/home/drg/.openclaw/workspace/solar-scout/data/companies_final.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(annotated, f, ensure_ascii=False, indent=2)
    
    # Stats
    with_image = len([c for c in annotated if c.get("output_image")])
    
    print(f"\n💾 Saved final results to {output_file}")
    print(f"   🖼️ Annotated images: {with_image}")
    
    return annotated


def generate_summary(companies: list) -> str:
    """
    Generate a summary report of all leads
    """
    print("\n" + "="*60)
    print("FINAL SUMMARY REPORT")
    print("="*60)
    
    # Filter to target companies (no solar, has decision maker)
    targets = [
        c for c in companies 
        if c.get("solar_analysis", {}).get("detected") == False
        and c.get("decision_maker", {}).get("name")
    ]
    
    print(f"\n🎯 TARGET COMPANIES (No Solar + Decision Maker): {len(targets)}")
    
    total_kw = 0
    
    for i, c in enumerate(targets, 1):
        name = c.get("name", "Unknown")
        dm = c.get("decision_maker", {})
        capacity = c.get("capacity", {})
        
        print(f"\n{i}. {name}")
        print(f"   📍 {c.get('validation', {}).get('display_name', 'N/A')[:60]}")
        print(f"   👤 {dm.get('name')} - {dm.get('title', 'N/A')}")
        print(f"   📞 {dm.get('phone', 'N/A')}")
        print(f"   ✉️ {dm.get('email', 'N/A')}")
        print(f"   ⚡ Potential: {capacity.get('estimated_kw', 0):.1f} kW")
        
        total_kw += capacity.get("estimated_kw", 0)
    
    print(f"\n📊 TOTAL POTENTIAL: {total_kw:.1f} kW")
    
    return targets


if __name__ == "__main__":
    # Test annotation
    test_company = {
        "name": "Test Company",
        "solar_analysis": {"detected": False},
        "capacity": {"estimated_kw": 150},
        "solar_analysis_image": None
    }
    
    result = annotate_satellite_image(test_company)
    print(f"Result: {result}")

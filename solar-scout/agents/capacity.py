"""
Phase 4: Solar Capacity Calculator
Calculates maximum installable solar capacity based on satellite imagery
"""

import json
import cv2
import os

# Configuration
PANEL_SIZE_M2 = 2.0  # Square meters per panel
PANEL_WATTAGE = 350  # Watts per panel
ROOF_COVERAGE_RATIO = 0.6  # 60% of roof usable
LAND_MULTIPLIER = 2.0  # Available land = 2x building footprint

# Pixel to meter conversion (approximate, varies by zoom/latitude)
# At zoom 16, ~0.5m per pixel
METERS_PER_PIXEL = 0.5


def estimate_building_area(image_path: str, lat: float = None) -> dict:
    """
    Estimate building/roof area from satellite image
    Returns: {"roof_m2": float, "land_m2": float, "total_m2": float}
    """
    if not image_path or not os.path.exists(image_path):
        return {"roof_m2": 0, "land_m2": 0, "total_m2": 0}
    
    try:
        img = cv2.imread(image_path)
        if img is None:
            return {"roof_m2": 0, "land_m2": 0, "total_m2": 0}
        
        height, width = img.shape[:2]
        pixel_area = height * width
        
        # Convert to real-world area (approximate)
        real_area_m2 = pixel_area * (METERS_PER_PIXEL ** 2)
        
        # Estimate roof area (typically smaller than full image)
        # Assume building occupies ~30% of image area at zoom 16
        building_coverage = 0.30
        roof_m2 = real_area_m2 * building_coverage * ROOF_COVERAGE_RATIO
        
        # Estimate available land (parking, unused space)
        # Assume 2x building footprint available
        land_m2 = (real_area_m2 * building_coverage) * LAND_MULTIPLIER
        
        total_m2 = roof_m2 + land_m2
        
        return {
            "roof_m2": round(roof_m2, 2),
            "land_m2": round(land_m2, 2),
            "total_m2": round(total_m2, 2),
            "image_pixels": pixel_area,
            "method": "computer_vision_estimation"
        }
        
    except Exception as e:
        print(f"Error estimating area: {e}")
        return {"roof_m2": 0, "land_m2": 0, "total_m2": 0}


def calculate_max_panels(area_m2: float) -> int:
    """
    Calculate maximum number of panels that can fit
    """
    return int(area_m2 / PANEL_SIZE_M2)


def calculate_max_kw(panel_count: int) -> float:
    """
    Calculate maximum kW capacity
    """
    return (panel_count * PANEL_WATTAGE) / 1000


def calculate_installation_cost(panel_count: int, cost_per_watt: float = 0.70) -> float:
    """
    Estimate installation cost
    Default: €0.70 per watt (European average for commercial)
    """
    kw = calculate_max_kw(panel_count)
    return kw * 1000 * cost_per_watt


def calculate_annual_revenue(panel_count: int, location: str = "Latvia") -> dict:
    """
    Estimate annual energy production and revenue
    Latvia: ~1000 kWh/kWp/year average
    """
    kw = calculate_max_kw(panel_count)
    
    # Latvia solar irradiance (approximate)
    kwh_per_kwp = 1000
    
    annual_kwh = kw * kwh_per_kwp
    
    # Average electricity price in Latvia (2024)
    # Commercial: ~0.15 EUR/kWh
    price_per_kwh = 0.15
    
    annual_revenue = annual_kwh * price_per_kwh
    
    # CO2 savings (approx 0.4 kg per kWh)
    co2_savings_kg = annual_kwh * 0.4
    
    return {
        "annual_kwh": round(annual_kwh),
        "price_per_kwh_eur": price_per_kwh,
        "annual_revenue_eur": round(annual_revenue, 2),
        "co2_savings_kg": round(co2_savings_kg),
        "payback_years": round(calculate_installation_cost(panel_count) / annual_revenue, 1) if annual_revenue > 0 else 0
    }


def analyze_company(company: dict) -> dict:
    """
    Full capacity analysis for a company
    """
    name = company.get("name", "Unknown")
    solar = company.get("solar_analysis", {})
    
    print(f"\n📐 Calculating capacity for: {name[:40]}")
    
    # Skip if already has solar
    if solar.get("detected") == True:
        company["capacity"] = {
            "max_panels": 0,
            "estimated_kw": 0,
            "reason": "Solar panels already present",
            "analysis": {}
        }
        print(f"   ⏭️ Skipping - solar already installed")
        return company
    
    # Get satellite image
    image_path = company.get("solar_analysis_image")
    if not image_path or not os.path.exists(image_path):
        company["capacity"] = {
            "max_panels": 0,
            "estimated_kw": 0,
            "reason": "No satellite image available",
            "analysis": {}
        }
        return company
    
    # Estimate area
    lat = company.get("validation", {}).get("latitude", 56.9)  # Default to Riga
    area = estimate_building_area(image_path, lat)
    
    print(f"   Roof area: {area['roof_m2']:.0f} m²")
    print(f"   Land area: {area['land_m2']:.0f} m²")
    
    # Calculate capacity
    max_panels = calculate_max_panels(area["total_m2"])
    max_kw = calculate_max_kw(max_panels)
    cost = calculate_installation_cost(max_panels)
    revenue = calculate_annual_revenue(max_panels)
    
    company["capacity"] = {
        "max_panels": max_panels,
        "estimated_kw": round(max_kw, 2),
        "roof_m2": area["roof_m2"],
        "land_m2": area["land_m2"],
        "installable_m2": area["total_m2"],
        "estimated_cost_eur": round(cost, 2),
        "annual_revenue_eur": revenue["annual_revenue_eur"],
        "payback_years": revenue["payback_years"],
        "analysis": area
    }
    
    print(f"   📊 Max panels: {max_panels} ({max_kw:.1f} kW)")
    print(f"   💰 Est. cost: €{cost:,.0f}")
    print(f"   📈 Annual revenue: €{revenue['annual_revenue_eur']}")
    print(f"   ⏱️ Payback: {revenue['payback_years']} years")
    
    return company


def run_capacity_analysis(companies: list) -> list:
    """
    Run capacity analysis on all companies
    """
    print("\n" + "="*60)
    print("PHASE 4: CAPACITY CALCULATION")
    print("="*60)
    
    analyzed = []
    
    for company in companies:
        result = analyze_company(company)
        analyzed.append(result)
    
    # Save results
    output_file = "/home/drg/.openclaw/workspace/solar-scout/data/companies_capacity.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(analyzed, f, ensure_ascii=False, indent=2)
    
    # Stats
    with_solar = len([c for c in analyzed if c.get("solar_analysis", {}).get("detected") == True])
    without_solar = len([c for c in analyzed if c.get("solar_analysis", {}).get("detected") == False])
    potential_kw = sum(c.get("capacity", {}).get("estimated_kw", 0) for c in analyzed)
    
    print(f"\n💾 Saved capacity analysis")
    print(f"   ☀️ Has solar: {with_solar}")
    print(f"   ❌ No solar: {without_solar}")
    print(f"   ⚡ Total potential: {potential_kw:.1f} kW")
    
    return analyzed


if __name__ == "__main__":
    # Test
    test = {
        "name": "Test Company",
        "solar_analysis": {"detected": False},
        "solar_analysis_image": None,
        "validation": {"latitude": 56.9}
    }
    
    result = analyze_company(test)
    print(json.dumps(result.get("capacity", {}), indent=2))

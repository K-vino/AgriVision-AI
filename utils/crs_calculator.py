def calculate_crs(humidity: float, temp: float, wind_speed: float, cloud_cover: float, precipitation: float) -> dict:
    humidity_score = humidity 
    temp_score = min(100, max(0, 100 - abs(temp - 25) * 5))
    wind_score = min(100, wind_speed * 5)
    cloud_score = cloud_cover
    precip_score = min(100, precipitation * 10)
    
    crs = (humidity_score * 0.35) + (temp_score * 0.25) + (wind_score * 0.15) + (cloud_score * 0.15) + (precip_score * 0.10)
    
    risk_level = "LOW"
    if crs > 75:
        risk_level = "CRITICAL"
    elif crs > 50:
        risk_level = "HIGH"
    elif crs > 25:
        risk_level = "MODERATE"
        
    return {
        "score": round(crs, 2),
        "level": risk_level,
        "details": {
            "humidity_score": round(humidity_score, 2),
            "temp_score": round(temp_score, 2),
            "wind_score": round(wind_score, 2),
            "cloud_score": round(cloud_score, 2),
            "precip_score": round(precip_score, 2)
        }
    }

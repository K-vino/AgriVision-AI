import os
import httpx
from utils.crs_calculator import calculate_crs

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

async def get_climate_risk(district: str) -> dict:
    if not OPENWEATHER_API_KEY:
        return calculate_crs(65, 26, 5, 40, 2)
        
    url = f"http://api.openweathermap.org/data/2.5/weather?q={district}&appid={OPENWEATHER_API_KEY}&units=metric"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            temp = data.get("main", {}).get("temp", 25)
            humidity = data.get("main", {}).get("humidity", 50)
            wind_speed = data.get("wind", {}).get("speed", 0)
            cloud_cover = data.get("clouds", {}).get("all", 0)
            
            precipitation = data.get("rain", {}).get("1h", 0)
            
            return calculate_crs(humidity, temp, wind_speed, cloud_cover, precipitation)
        except Exception as e:
            print(f"Weather API error: {e}")
            return calculate_crs(60, 24, 3, 20, 0)

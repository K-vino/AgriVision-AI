import os
import httpx

PERENUAL_API_KEY = os.getenv("PERENUAL_API_KEY", "")

async def get_plant_details(plant_name: str) -> dict:
    if not PERENUAL_API_KEY or plant_name == "Unknown Plant" or "API Key Missing" in plant_name:
        return {
            "common_name": plant_name,
            "scientific_name": plant_name,
            "care_level": "Unknown",
            "watering": "Unknown",
            "sunlight": "Unknown"
        }
        
    url = f"https://perenual.com/api/species-list?key={PERENUAL_API_KEY}&q={plant_name}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            if "data" in data and len(data["data"]) > 0:
                plant = data["data"][0]
                return {
                    "common_name": plant.get("common_name", plant_name),
                    "scientific_name": plant.get("scientific_name", [plant_name])[0],
                    "care_level": "Unknown",
                    "watering": plant.get("watering", "Unknown"),
                    "sunlight": ", ".join(plant.get("sunlight", [])) if isinstance(plant.get("sunlight"), list) else plant.get("sunlight", "Unknown")
                }
            return {
                "common_name": plant_name,
                "scientific_name": plant_name,
                "care_level": "Unknown",
                "watering": "Unknown",
                "sunlight": "Unknown"
            }
    except Exception as e:
        print(f"Perenual API error: {e}")
        return {
            "common_name": plant_name,
            "scientific_name": plant_name,
            "care_level": "Unknown",
            "watering": "Unknown",
            "sunlight": "Unknown"
        }

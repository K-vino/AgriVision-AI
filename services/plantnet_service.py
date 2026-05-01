import os
import httpx

PLANTNET_API_KEY = os.getenv("PLANTNET_API_KEY", "")

async def identify_plant(image_path: str) -> str:
    if not PLANTNET_API_KEY:
        return "Unknown Plant (API Key Missing)"
        
    url = f"https://my-api.plantnet.org/v2/identify/all?api-key={PLANTNET_API_KEY}"
    
    try:
        async with httpx.AsyncClient() as client:
            with open(image_path, "rb") as f:
                files = {"images": (os.path.basename(image_path), f, "image/jpeg")}
                response = await client.post(url, files=files)
                response.raise_for_status()
                data = response.json()
                
                if "results" in data and len(data["results"]) > 0:
                    return data["results"][0]["species"]["scientificNameWithoutAuthor"]
                return "Unknown Plant"
    except Exception as e:
        print(f"PlantNet API error: {e}")
        return "Unknown Plant"

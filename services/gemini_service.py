import os
import google.generativeai as genai
from PIL import Image

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def analyze_plant_with_gemini(image_path: str) -> dict:
    if not GEMINI_API_KEY:
        return {
            "disease_name": "API Key Missing",
            "severity": "Unknown",
            "treatment": "Please configure Gemini API key.",
            "confidence": 0.0
        }
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        img = Image.open(image_path)
        prompt = """
        You are a plant disease expert. Analyze this image of a plant leaf.
        Provide the following information in JSON format:
        {
            "disease_name": "Name of the disease or 'Healthy'",
            "severity": "LOW, MODERATE, or HIGH",
            "treatment": "Recommended treatment or 'None needed'",
            "confidence": 0.95
        }
        Only return the raw JSON object, without any markdown formatting.
        """
        response = model.generate_content([prompt, img])
        
        import json
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        
        data = json.loads(text.strip())
        return data
    except Exception as e:
        print(f"Gemini API error: {e}")
        return {
            "disease_name": "Error analyzing image",
            "severity": "Unknown",
            "treatment": "N/A",
            "confidence": 0.0
        }

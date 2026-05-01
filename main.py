import os
import shutil
from fastapi import FastAPI, File, UploadFile, Query, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# Load env vars
load_dotenv()

# Import services
from utils.ml_model import predict_disease
from services.gemini_service import analyze_plant_with_gemini
from services.plantnet_service import identify_plant
from services.perenual_service import get_plant_details
from services.weather_service import get_climate_risk

app = FastAPI(title="AgriVision AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure temp directory exists for uploads
os.makedirs("temp", exist_ok=True)
os.makedirs("model", exist_ok=True)

# Mount static files for local testing
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

@app.get("/")
async def root():
    return FileResponse("index.html")

@app.get("/app.js")
async def get_js():
    return FileResponse("app.js")

@app.get("/styles.css")
async def get_css():
    return FileResponse("styles.css")

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    file_location = f"temp/{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    try:
        # 1. Try ML model prediction first
        ml_result = await predict_disease(file_location)
        
        # 2. Check confidence, fallback to Gemini if < 80%
        disease_info = {}
        if ml_result.get("confidence", 0.0) < 0.8:
            print("ML confidence low, falling back to Gemini...")
            gemini_result = await analyze_plant_with_gemini(file_location)
            disease_info = gemini_result
        else:
            disease_info = {
                "disease_name": ml_result.get("disease_name"),
                "severity": "Requires further checking",
                "treatment": "Refer to general guidelines", 
                "confidence": ml_result.get("confidence")
            }
            
        # 3. Identify Plant using PlantNet
        plant_name = await identify_plant(file_location)
        
        # 4. Get Plant Details using Perenual
        plant_details = await get_plant_details(plant_name)
        
        result = {
            "disease": disease_info,
            "plant": plant_details
        }
        return result
    finally:
        if os.path.exists(file_location):
            os.remove(file_location)

@app.get("/climate")
async def climate(district: str = Query(..., description="District or city name")):
    risk_data = await get_climate_risk(district)
    return risk_data

@app.post("/full-analysis")
async def full_analysis(
    file: UploadFile = File(...),
    district: str = Form(...)
):
    file_location = f"temp/{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    try:
        ml_result = await predict_disease(file_location)
        if ml_result.get("confidence", 0.0) < 0.8:
            disease_info = await analyze_plant_with_gemini(file_location)
        else:
            disease_info = {
                "disease_name": ml_result.get("disease_name"),
                "severity": "Requires checking",
                "treatment": "Refer to guidelines", 
                "confidence": ml_result.get("confidence")
            }
            
        plant_name = await identify_plant(file_location)
        plant_details = await get_plant_details(plant_name)
        climate_risk = await get_climate_risk(district)
        
        return {
            "disease": disease_info,
            "plant": plant_details,
            "climate_risk": climate_risk
        }
    finally:
        if os.path.exists(file_location):
            os.remove(file_location)

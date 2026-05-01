# 🌱 AgriVision AI - Smart Farming Assistant

A complete, production-ready full-stack web application for plant disease detection and climate risk prediction.

## 🌟 Features
- **Mobile-first UI**: Clean, simple, and farmer-friendly design.
- **Multi-language Support**: English and Tamil support with local storage memory.
- **Machine Learning**: TensorFlow/Keras-based plant disease detection with a Gemini AI fallback if confidence is low.
- **AI Integrations**: Uses Gemini, PlantNet, and Perenual for accurate plant analysis.
- **Climate Risk Score (CRS)**: Calculates risk based on real-time weather using OpenWeatherMap.

## 🚀 How to Run Locally

### 1. Backend Setup
1. Open your terminal in the `AgriVision-AI` directory.
2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   # source venv/bin/activate    # Mac/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   Open the `.env` file and add your API keys:
   ```env
   GEMINI_API_KEY=your_key
   PLANTNET_API_KEY=your_key
   PERENUAL_API_KEY=your_key
   OPENWEATHER_API_KEY=your_key
   ```
5. Add your pre-trained ML model to `model/plant_model.h5` (if available, otherwise it falls back to Gemini automatically).
6. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### 2. Frontend Setup
- The frontend is served directly by the FastAPI app!
- Open your browser and navigate to: `http://localhost:8000`

---

## 🌐 Deployment Instructions

### Frontend (Netlify)
1. Go to [Netlify](https://www.netlify.com/).
2. Drag and drop the `AgriVision-AI` folder directly into the deploy area, or connect your GitHub repository.
3. Ensure the publish directory is the root directory (where `index.html` lives).
4. **Important**: Before deploying, edit `app.js` and change `API_BASE_URL` to your live Render backend URL:
   ```javascript
   const API_BASE_URL = 'https://agrivision-backend.onrender.com';
   ```

### Backend (Render)
1. Go to [Render](https://render.com/).
2. Create a new **Web Service** connected to your repository.
3. Set the **Build Command** to: `pip install -r requirements.txt`
4. Set the **Start Command** to: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Go to the Environment section and add all your API keys as Environment Variables.
6. Deploy!

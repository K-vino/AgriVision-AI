import os
import numpy as np

# Mocking TensorFlow import in case it's not installed yet or model doesn't exist
try:
    import tensorflow as tf
    from PIL import Image
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

MODEL_PATH = "model/plant_model.h5"
MODEL = None

def load_model():
    global MODEL
    if not TF_AVAILABLE:
        return False
        
    if os.path.exists(MODEL_PATH):
        try:
            MODEL = tf.keras.models.load_model(MODEL_PATH)
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    return False

# Attempt to load model at startup
load_model()

async def predict_disease(image_path: str) -> dict:
    if MODEL is None:
        # Model not loaded, return low confidence to fallback to Gemini
        return {
            "disease_name": "Model Not Loaded",
            "confidence": 0.0
        }
    
    try:
        # Preprocess image
        img = Image.open(image_path).resize((224, 224)) # Example size
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = tf.expand_dims(img_array, 0) # Create a batch
        
        predictions = MODEL.predict(img_array)
        score = tf.nn.softmax(predictions[0])
        
        # Example classes
        class_names = ['Healthy', 'Powdery Mildew', 'Rust', 'Blight']
        predicted_class = class_names[np.argmax(score)]
        confidence = float(np.max(score))
        
        return {
            "disease_name": predicted_class,
            "confidence": confidence
        }
    except Exception as e:
        print(f"ML prediction error: {e}")
        return {
            "disease_name": "Error",
            "confidence": 0.0
        }

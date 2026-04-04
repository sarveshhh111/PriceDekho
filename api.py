from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import shutil
import base64
import os
import cv2
from main import predict_all

app = FastAPI(title="PriceDekho API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict_price(
    year: int = Form(...),
    present_price: float = Form(...),
    kms_driven: int = Form(...),
    fuel_type: int = Form(...),
    seller_type: int = Form(...),
    transmission: int = Form(...),
    owner: int = Form(...),
    image: UploadFile = File(...)
):
    # Save the uploaded file temporarily
    temp_file_path = f"temp_{image.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    try:
        # Prepare features array
        features = [
            year,
            present_price,
            kms_driven,
            fuel_type,
            seller_type,
            transmission,
            owner
        ]

        # Call the model
        img_out, result = predict_all(features, temp_file_path)

        # Encode the output image to base64
        _, buffer = cv2.imencode('.jpg', img_out)
        img_base64 = base64.b64encode(buffer).decode('utf-8')

        return {
            "success": True,
            "data": result,
            "image_base64": img_base64
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        # Cleanup
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

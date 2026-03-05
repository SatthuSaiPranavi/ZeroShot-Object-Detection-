from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from pydantic import BaseModel
from pathlib import Path

import shutil
import uuid
import os
import cv2
import numpy as np
import base64
import torch
from io import BytesIO
from PIL import Image
import io

# ------------------ ZSOD imports ------------------
from dino_infer import detect_objects
from segment_anything import sam_model_registry, SamPredictor

# ------------------ Tracking import ------------------
from track_infer import track_video

# ------------------ Scene Understanding ------------------
from transformers import BlipProcessor, BlipForConditionalGeneration

# ------------------ FastAPI setup ------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Load SAM once ------------------
DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

SAM_CHECKPOINT = "models/sam_vit_b_01ec64.pth"
sam = sam_model_registry["vit_b"](checkpoint=SAM_CHECKPOINT)
sam.to(DEVICE)
sam_predictor = SamPredictor(sam)

# ------------------ Load Scene model once ------------------
device = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_DIR = Path("models") / "scene-understanding"
processor = BlipProcessor.from_pretrained(MODEL_DIR)
scene_model = BlipForConditionalGeneration.from_pretrained(MODEL_DIR).to(device)
scene_model.eval()

# ------------------ Utilities ------------------
def mask_to_base64(mask, color=(0, 255, 0)):
    h, w = mask.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, 3] = 0
    rgba[mask == 1] = [*color, 120]
    img = Image.fromarray(rgba, "RGBA")
    buf = BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

# ------------------ Pydantic models ------------------
class CameraInput(BaseModel):
    image_base64: str
    prompt: str

class SceneInput(BaseModel):
    image_base64: str
    prompt: str = ""

# ------------------ ZSOD APIs ------------------
@app.post("/detect")
async def detect(file: UploadFile = File(...), prompt: str = Form(...)):
    os.makedirs("uploads", exist_ok=True)
    temp_path = f"uploads/{uuid.uuid4()}.jpg"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return run_detection(temp_path, prompt)

@app.post("/detect_camera")
async def detect_camera(data: CameraInput):
    image_bytes = base64.b64decode(data.image_base64.split(",")[-1])
    image = Image.open(BytesIO(image_bytes)).convert("RGB")

    os.makedirs("uploads", exist_ok=True)
    temp_path = f"uploads/{uuid.uuid4()}.jpg"
    image.save(temp_path)

    return run_detection(temp_path, data.prompt)

def run_detection(image_path, prompt):
    detections, image = detect_objects(image_path, prompt)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    sam_predictor.set_image(image_rgb)

    enriched = []
    colors = [(255,0,0),(0,255,0),(0,0,255),(255,255,0)]

    for i, det in enumerate(detections):
        x1, y1, x2, y2 = det["box"]
        masks, _, _ = sam_predictor.predict(
            box=np.array([[x1, y1, x2, y2]])
        )
        mask = masks[0].astype(np.uint8)
        enriched.append({
            **det,
            "mask": mask_to_base64(mask, colors[i % len(colors)])
        })

    return {"detections": enriched}

#track
@app.post("/track")
async def track_video_api(file: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("outputs", exist_ok=True)

    input_path = f"uploads/{uuid.uuid4()}_{file.filename}"
    output_path = f"outputs/tracked_{uuid.uuid4()}.mp4"

    # Save uploaded video
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run tracking
    track_video(input_path, output_path)

    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename="tracked_output.mp4"
    )

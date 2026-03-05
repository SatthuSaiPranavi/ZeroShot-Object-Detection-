from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path

import shutil
import uuid
import os
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import torch

# ------------------ ZSOD imports ------------------
from dino_infer import detect_objects
from segment_anything import sam_model_registry, SamPredictor

# ------------------ Tracking import ------------------
from track_infer import run_tracking

# ------------------ Scene Understanding ------------------
from scene_infer import generate_scene_caption

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
    prompt: str = ""

# ------------------ Detection APIs ------------------
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
        masks, _, _ = sam_predictor.predict(box=np.array([[x1, y1, x2, y2]]))
        mask = masks[0].astype(np.uint8)
        enriched.append({
            **det,
            "mask": mask_to_base64(mask, colors[i % len(colors)])
        })

    return {"detections": enriched}

# ------------------ Tracking API ------------------
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.post("/track")
async def track_video(video: UploadFile = File(...)):
    video_id = str(uuid.uuid4())

    input_path = f"{UPLOAD_FOLDER}/{video_id}.mp4"
    output_path = f"{OUTPUT_FOLDER}/{video_id}_tracked.mp4"

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    run_tracking(input_path, output_path)

    return FileResponse(
        path=output_path,
        media_type="video/mp4",
        filename="tracked.mp4",
        headers={"Accept-Ranges": "bytes"}
    )

# ------------------ Scene Understanding APIs ------------------
@app.post("/scene-understanding/")
async def scene_understanding(file: UploadFile = File(...)):
    print("Received file:", file.filename)  # debug

    os.makedirs("temp", exist_ok=True)
    image_path = f"temp/{file.filename}"

    try:
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        caption = generate_scene_caption(image_path)
        print("Generated caption:", caption)  # debug

        return {"scene_description": caption}

    except Exception as e:
        print("Error processing image:", e)
        return {"scene_description": "Error processing image"}
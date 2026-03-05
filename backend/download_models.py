# backend/download_models.py
import os
from pathlib import Path
from transformers import BlipProcessor, BlipForConditionalGeneration

def download_scene_model():
    model_name = "Salesforce/blip-image-captioning-base"
    save_dir = Path("models") / "scene-understanding"
    save_dir.mkdir(parents=True, exist_ok=True)

    print(f"📥 Downloading {model_name} into {save_dir} ...")

    # Download processor + model
    processor = BlipProcessor.from_pretrained(model_name)
    model = BlipForConditionalGeneration.from_pretrained(model_name)

    # Save to local dir
    processor.save_pretrained(save_dir)
    model.save_pretrained(save_dir)

    print(f"✅ Model downloaded and saved to {save_dir}")

if __name__ == "__main__":
    download_scene_model()

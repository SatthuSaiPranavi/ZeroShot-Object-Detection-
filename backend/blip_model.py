# blip_model.py
from transformers import BlipProcessor, BlipForConditionalGeneration
import torch

# Load the BLIP processor and model
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

def generate_caption(image):
    """
    image: PIL.Image object
    """
    inputs = processor(images=image, return_tensors="pt").to(device)
    output = model.generate(**inputs)
    caption = processor.decode(output[0], skip_special_tokens=True)
    return caption

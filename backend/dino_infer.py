import torch
import os
import cv2
import numpy as np
from groundingdino.util.inference import load_model, predict
from groundingdino.util import box_ops
from segment_anything import sam_model_registry, SamPredictor

# Paths
MODEL_CONFIG_PATH = "GroundingDINO/groundingdino/config/GroundingDINO_SwinT_OGC.py"
MODEL_WEIGHTS_PATH = "models/groundingdino_swint_ogc.pth"

# Pick device
if torch.backends.mps.is_available():
    DEVICE = torch.device("mps")
    print("✅ Using MPS (Mac GPU)")
elif torch.cuda.is_available():
    DEVICE = torch.device("cuda")
    print("✅ Using CUDA GPU")
else:
    DEVICE = torch.device("cpu")
    print("⚠ Using CPU (slow)")

# Load model
def load_dino_model():
    model = load_model(MODEL_CONFIG_PATH, MODEL_WEIGHTS_PATH)
    model = model.to(DEVICE)
    model.eval()
    return model

# SAM setup
SAM_CHECKPOINT = "models/sam_vit_b_01ec64.pth"
SAM_MODEL_TYPE = "vit_b"

def load_sam_model():
    sam = sam_model_registry[SAM_MODEL_TYPE](checkpoint=SAM_CHECKPOINT)
    sam.to(DEVICE)
    predictor = SamPredictor(sam)
    return predictor

# Draw boxes + labels
def draw_detections(image, detections):
    overlay = image.copy()

    for det in detections:
        x1, y1, x2, y2 = det["box"]
        label = det["label"]
        score = det["score"]

        # ✅ Draw mask if present
        if "mask" in det and det["mask"] is not None:
            mask = np.array(det["mask"], dtype=np.uint8)
            colored_mask = np.zeros_like(image, dtype=np.uint8)
            colored_mask[:, :, 1] = mask * 255  # green channel

            # Blend mask with transparency
            overlay = cv2.addWeighted(overlay, 1, colored_mask, 0.5, 0)

        # ✅ Draw bounding box
        cv2.rectangle(overlay, (x1, y1), (x2, y2), (0, 255, 0), 2)

        # ✅ Label text
        text = f"{label} ({score:.2f})"
        cv2.putText(
            overlay, text, (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2
        )

    return overlay

# Detection function
# Detection function
def detect_objects(image_path, text_prompt, box_threshold=0.35, text_threshold=0.25):
    model = load_dino_model()
    predictor = load_sam_model()

    # Read image
    image_source = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image_source, cv2.COLOR_BGR2RGB)

    # Convert to tensor
    image_tensor = torch.from_numpy(image_rgb).permute(2, 0, 1).float() / 255.0

    # Run DINO detection
    boxes, logits, phrases = predict(
        model=model,
        image=image_tensor,
        caption=text_prompt,
        box_threshold=box_threshold,
        text_threshold=text_threshold,
        device=DEVICE
    )

    # Scale boxes
    h, w, _ = image_source.shape
    boxes_pixel = box_ops.box_cxcywh_to_xyxy(boxes) * torch.Tensor([w, h, w, h])

    # Run SAM on detected boxes
    predictor.set_image(image_rgb)
    masks = []
    for box in boxes_pixel:
        box_np = box.cpu().numpy()
        mask, _, _ = predictor.predict(box=box_np, multimask_output=False)
        masks.append(mask[0])  # take first mask

    # Prepare results
    results = []
    for box, score, phrase, mask in zip(boxes_pixel, logits, phrases, masks):
        x1, y1, x2, y2 = box.int().tolist()
        results.append({
            "label": phrase,
            "score": float(score),
            "box": [x1, y1, x2, y2],
            "mask": mask.astype(np.uint8).tolist()  # send mask as JSON-safe
        })

    return results, image_source


if __name__ == "__main__":
    # Test run
    test_image = "test.jpg"  # Change to your test image path
    test_prompt = "red helmet"

    detections, image = detect_objects(test_image, test_prompt)

    # Print detections
    for det in detections:
        print(det)

    # Draw & save output
    output_img = draw_detections(image, detections)
    cv2.imwrite("output.jpg", output_img)
    print("💾 Saved result to output.jpg")

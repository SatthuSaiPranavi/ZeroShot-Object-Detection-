# track_infer.py

import cv2
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort
import os

import torch

model = YOLO("yolov8m.pt")

# 🔥 MOVE MODEL TO APPLE GPU (MPS)
if torch.backends.mps.is_available():
    model.to("mps")
    print("✅ YOLO running on Apple MPS (GPU)")
else:
    print("⚠️ MPS not available, running on CPU")

tracker = DeepSort(
    max_age=70,
    n_init=3,
    max_iou_distance=0.6,
    max_cosine_distance=0.2,
    nn_budget=200
)


def run_tracking(input_video_path, output_video_path):
    cap = cv2.VideoCapture(input_video_path)

    print("INPUT PATH:", input_video_path)
    print("CAP OPENED:", cap.isOpened())

    if not cap.isOpened():
        raise RuntimeError("❌ Cannot open video")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 25

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")  # ✅ mac-safe
    writer = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))

    print("WRITER OPENED:", writer.isOpened())

    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1

        results = model(frame, verbose=False)[0]
        detections = []

        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            class_name = model.names[cls]
            box_area = (x2 - x1) * (y2 - y1)
            if box_area < 400:      # 👈 ADD HERE
                continue

            if conf > 0.5:
                detections.append([[x1, y1, x2-x1, y2-y1], conf, cls])

        tracks = tracker.update_tracks(detections, frame=frame)

        for track in tracks:
            if not track.is_confirmed():
                continue

            track_id = track.track_id
            cls_id = track.get_det_class()
            class_name = model.names[cls_id]

            x1, y1, x2, y2 = map(int, track.to_ltrb())

            cv2.rectangle(frame, (x1, y1), (x2, y2), (0,255,0), 2)
            cv2.putText(
                frame,
                f"ID {track_id} : {class_name}",
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0,255,0),
                2
            )


        writer.write(frame)

    # ✅ MUST be outside the loop
    cap.release()
    writer.release()

    if frame_count == 0:
        raise RuntimeError("❌ ZERO FRAMES PROCESSED")

    if not os.path.exists(output_video_path):
        raise RuntimeError("❌ OUTPUT FILE NOT CREATED")

    if os.path.getsize(output_video_path) < 50000:  # ~50 KB
        raise RuntimeError("❌ OUTPUT VIDEO TOO SMALL / CORRUPTED")

    print("✅ VIDEO OK:", output_video_path)
    return output_video_path


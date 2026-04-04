import cv2
from ultralytics import YOLO


# ✅ Correct path
model = YOLO("runs/detect/train3/weights/best.pt")

def detect_and_draw(image_path):
    results = model(image_path)
    img = cv2.imread(image_path)

    detected = []

    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cls = int(box.cls[0])
            label = r.names[cls]
            conf = float(box.conf[0])

            detected.append(label)

            cv2.rectangle(img, (x1, y1), (x2, y2), (0,255,0), 2)

            cv2.putText(img, f"{label} {conf:.2f}",
                        (x1, y1-10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6, (0,255,0), 2)

    return img, detected, results
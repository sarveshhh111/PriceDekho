from ultralytics import YOLO

model = YOLO("yolov8n.pt")

model.train(
    data="scratch-dent-car-3/data.yaml",
    epochs=20,   # keep low for laptop
    imgsz=640
)
import joblib
from ultralytics import YOLO
import cv2
from visualise import detect_and_draw

# Load models
price_model = joblib.load("price_model.pkl")
yolo_model = YOLO("runs/detect/train3/weights/best.pt")

def calculate_damage(results, image_path):
    weights = {"scratch":0.3, "dent":0.6, "broken":1.0}

    img = cv2.imread(image_path)
    h, w, _ = img.shape
    image_area = h * w

    total_score = 0

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            label = r.names[cls]

            x1, y1, x2, y2 = box.xyxy[0]
            box_area = (x2-x1)*(y2-y1)

            ratio = box_area / image_area
            total_score += ratio * weights[label]

    return total_score

def predict_all(features, image_path):

    base_price = float(price_model.predict([features])[0])

    img, detected, results = detect_and_draw(image_path)

    damage_score = float(calculate_damage(results, image_path))

    final_price = float(base_price * (1 - damage_score * 0.5))

    return img, {
        "base_price": base_price,
        "damage_types": detected,
        "damage_score": damage_score,
        "final_price": final_price
    }

if __name__ == "__main__":
    # TEST RUN
    img, result = predict_all(
        [2015, 5.0, 50000, 1, 0, 1, 0],
        "scratch-dent-car-3/test/images/122_jpg.rf.e35dd4aef55b20f4a997c8b8d62a4ae1.jpg"
    )

    print(result)

    cv2.imshow("Final Output", img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()



def calculate_damage(results, image_path):
    import cv2

    weights = {"scratch":0.3, "dent":0.6, "broken":1.0}

    img = cv2.imread(image_path)
    h, w, _ = img.shape
    image_area = h * w

    total_score = 0

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            label = r.names[cls]

            x1, y1, x2, y2 = box.xyxy[0]
            box_area = (x2-x1)*(y2-y1)

            ratio = box_area / image_area
            total_score += ratio * weights[label]

    return total_score


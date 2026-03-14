# train/collect_landmarks.py — works with mediapipe 0.10.x (Windows)
import cv2
import csv
import urllib.request
import os
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.components import containers

# EDIT THIS LIST — your custom gesture names
GESTURES = ["thumbs_up", "peace", "fist", "open_hand"]

MODEL_PATH = "hand_landmarker.task"
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"

def download_model():
    if not os.path.exists(MODEL_PATH):
        print("Downloading MediaPipe hand landmark model (~8MB)...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("Download complete.\n")

def collect(label, output_csv="dataset.csv"):
    # Build the hand landmarker
    base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        num_hands=1,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    detector = vision.HandLandmarker.create_from_options(options)

    cap = cv2.VideoCapture(0)
    count = 0

    print(f"\n--- Collecting: '{label}' ---")
    print("Press SPACE to capture | Press Q to move to next gesture\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Convert to RGB for MediaPipe
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

        # Run detection
        result = detector.detect(mp_image)

        landmarks_flat = None

        if result.hand_landmarks:
            hand = result.hand_landmarks[0]  # first hand
            landmarks_flat = [v for p in hand for v in (p.x, p.y, p.z)]

            # Draw dots on the hand so you can see detection
            for point in hand:
                x = int(point.x * frame.shape[1])
                y = int(point.y * frame.shape[0])
                cv2.circle(frame, (x, y), 4, (0, 255, 0), -1)

        # Status text on screen
        status = f"'{label}'  |  Samples: {count}  |  SPACE=capture  Q=next"
        color = (0, 255, 0) if landmarks_flat else (0, 0, 255)
        cv2.putText(frame, status, (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        if not landmarks_flat:
            cv2.putText(frame, "No hand detected", (10, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        cv2.imshow("Gesture Collector", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord(' '):
            if landmarks_flat:
                with open(output_csv, "a", newline="") as f:
                    writer = csv.writer(f)
                    writer.writerow([label] + landmarks_flat)
                count += 1
                print(f"  Captured sample #{count} for '{label}'")
            else:
                print("  No hand detected — make sure your hand is visible!")

        elif key == ord('q'):
            print(f"  Done — {count} samples saved for '{label}'\n")
            break

    detector.close()
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    download_model()

    print("=== Hand Gesture Data Collector ===")
    print(f"Gestures to collect: {GESTURES}")
    print("Aim for 50-100 samples per gesture for good accuracy.\n")

    for gesture in GESTURES:
        input(f"Press ENTER when ready to collect '{gesture}'...")
        collect(gesture)

    print("\n=== All done! dataset.csv is ready. ===")
    print("Next step: run  python train_model.py")
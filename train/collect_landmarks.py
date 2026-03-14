import mediapipe as mp 
import cv2 
import csv 
import os 
 
mp_hands = mp.solutions.hands 
mp_draw = mp.solutions.drawing_utils 
 
# EDIT THIS LIST — replace with your own gesture names 
GESTURES = ["thumbs_up", "peace", "fist", "open_hand"] 
 
def collect(label, output_csv="dataset.csv"): 
    cap = cv2.VideoCapture(0) 
    with mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7) as hands: 
        print(f"\nCollecting '{label}' — press SPACE to capture a sample, Q to finish\n") 
        with open(output_csv, "a", newline="") as f: 
            writer = csv.writer(f) 
            while True: 
                ret, frame = cap.read() 
                if not ret: 
                    break 
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) 
                result = hands.process(rgb) 
                if result.multi_hand_landmarks: 
                    lm = result.multi_hand_landmarks[0].landmark 
                    mp_draw.draw_landmarks( 
                        frame, 
                        result.multi_hand_landmarks[0], 
                        mp_hands.HAND_CONNECTIONS 
                    ) 
                    key = cv2.waitKey(1) 
                    if key == ord(' '): 
                        row = [label] + [v for p in lm for v in (p.x, p.y, p.z)] 
                        writer.writerow(row) 
                        print(f" Captured sample for '{label}'") 
                    elif key == ord('q'): 
                        break 
                else: 
                    cv2.waitKey(1) 
                cv2.imshow(f"Collecting: {label}", frame) 
    cap.release() 
    cv2.destroyAllWindows() 
 
if __name__ == "__main__": 
    for gesture in GESTURES: 
        print(f"\n--- Now collecting: {gesture} ---") 
        print("Aim for at least 50 samples per gesture.") 
        collect(gesture) 
    print("\nDone! dataset.csv is ready for training.") 

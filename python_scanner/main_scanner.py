import os

# --- SILENCE TENSORFLOW WARNINGS ---
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' # 0 = all, 1 = no info, 2 = no warnings, 3 = no errors
# -----------------------------------

import cv2
from deepface import DeepFace
import time
import datetime
import requests
import pyttsx3
import threading
import pandas as pd
import numpy as np

# --- CONFIGURATION ---
BACKEND_URL = "http://localhost:5001/api/attendance"
DATASET_PATH = "dataset"
CLASS_START_TIME = 8
STRICT_THRESHOLD = 0.40 
MODEL_NAME = "VGG-Face"
DISTANCE_METRIC = "cosine"
# ---------------------

# Voice Engine
try:
    engine = pyttsx3.init()
    engine.setProperty('rate', 150)
except: engine = None

def speak(text):
    if not engine: return
    def run():
        try:
            engine.say(text)
            engine.runAndWait()
        except: pass
    threading.Thread(target=run).start()

# Check dataset
if not os.path.exists(DATASET_PATH):
    print("Error: Dataset folder not found.")
    exit()

cap = cv2.VideoCapture(0)
cap.set(3, 1280)
cap.set(4, 720)
# Optional: Set window to full screen if desired
cv2.namedWindow('DeepFace Attendance', cv2.WINDOW_NORMAL)
# cv2.setWindowProperty('DeepFace Attendance', cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

last_sent_time = {}
last_spoken_time = {}

print("--- DEEPFACE SYSTEM ACTIVE ---")
print(f"Model: {MODEL_NAME} | Metric: {DISTANCE_METRIC} | Threshold: {STRICT_THRESHOLD}")
print("System ready. Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret: break
    frame = cv2.flip(frame, 1)

    try:
        # 1. FIND FACES
        results = DeepFace.find(
            img_path=frame, 
            db_path=DATASET_PATH, 
            model_name=MODEL_NAME,
            distance_metric=DISTANCE_METRIC,
            enforce_detection=False, 
            silent=True,
            threshold=STRICT_THRESHOLD
        )
        
        found_match_in_frame = False

        if isinstance(results, list):
            for df in results:
                if isinstance(df, pd.DataFrame) and not df.empty:
                    df = df.sort_values(by=['distance'], ascending=True)
                    best_match = df.iloc[0]
                    distance = best_match['distance']
                    
                    if distance <= STRICT_THRESHOLD:
                        identity_path = best_match['identity']
                        name = os.path.basename(os.path.dirname(identity_path))
                        
                        found_match_in_frame = True
                        full_name = name
                        first_name = name.split(" ")[0]
                        
                        x = int(best_match['source_x'])
                        y = int(best_match['source_y'])
                        w = int(best_match['source_w'])
                        h = int(best_match['source_h'])
                        
                        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                        
                        # Name Tag Background
                        (text_w, text_h), _ = cv2.getTextSize(first_name, cv2.FONT_HERSHEY_SIMPLEX, 0.9, 2)
                        cv2.rectangle(frame, (x, y - 40), (x + w, y), (0, 255, 0), cv2.FILLED)
                        cv2.putText(frame, first_name, (x + (w-text_w)//2, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)

                        # Backend Logic
                        current_time = time.time()
                        if full_name not in last_sent_time or (current_time - last_sent_time[full_name]) > 60:
                            now = datetime.datetime.now()
                            status = "Late" if (now.hour > CLASS_START_TIME or (now.hour == CLASS_START_TIME and now.minute > 0)) else "Present"
                            
                            payload = {"name": full_name, "status": status, "date": now.strftime("%Y-%m-%d"), "time": now.strftime("%I:%M %p")}
                            print(f"[MATCH] {full_name} (Dist: {distance:.4f})")

                            try:
                                res = requests.post(BACKEND_URL, json=payload, timeout=1)
                                if res.status_code == 201:
                                    if full_name not in last_spoken_time or (current_time - last_spoken_time[full_name]) > 300:
                                        msg = f"Warning. {first_name}, you are late." if status == "Late" else f"Welcome, {first_name}."
                                        speak(msg)
                                        last_spoken_time[full_name] = current_time
                                last_sent_time[full_name] = current_time
                            except: pass
                
        # 2. HANDLE UNKNOWN FACES
        if not found_match_in_frame:
             try:
                detected_faces = DeepFace.extract_faces(img_path=frame, enforce_detection=False, align=False)
                for face_obj in detected_faces:
                     if face_obj['confidence'] > 0.5:
                        area = face_obj['facial_area']
                        x, y, w, h = area['x'], area['y'], area['w'], area['h']

                        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 2)
                        
                        # Unknown Tag
                        (text_w, text_h), _ = cv2.getTextSize("Unknown", cv2.FONT_HERSHEY_SIMPLEX, 0.9, 2)
                        cv2.rectangle(frame, (x, y - 40), (x + w, y), (0, 0, 255), cv2.FILLED)
                        cv2.putText(frame, "Unknown", (x + (w-text_w)//2, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
             except: pass

    except Exception as e:
        pass

    cv2.imshow('DeepFace Attendance', frame)
    if cv2.waitKey(1) == ord('q'): break

cap.release()
cv2.destroyAllWindows()
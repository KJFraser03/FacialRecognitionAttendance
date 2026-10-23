import cv2
import os
import time
import customtkinter as ctk
from PIL import Image
import threading

# --- CONFIGURATION ---
# IMPORTANT: Change this name for every new person you scan!
person_name = "KJ Villanueva" 
dataset_path = "dataset"
# ---------------------

# Create dataset folder if it doesn't exist
if not os.path.exists(dataset_path):
    os.makedirs(dataset_path)

# Create a subfolder for the person
person_path = os.path.join(dataset_path, person_name)
if not os.path.exists(person_path):
    os.makedirs(person_path)

# Initialize Camera
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Camera 0 failed. Trying Camera 1...")
    cap = cv2.VideoCapture(1)
    if not cap.isOpened():
        print("Error: Could not open any camera.")
        exit()

# --- FIX: Set Camera to HD Resolution (1280x720) ---
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

# Load basic face detector for the "Quality Check"
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# --- GUI CLASS ---
class App(ctk.CTk):
    def __init__(self):
        super().__init__()

        # 1. VISUAL THEME SETUP
        ctk.set_appearance_mode("Dark")
        self.title("VISIONGUARD | Data Collector")
        self.geometry("1280x750")
        
        # Colors
        self.colors = {
            "bg": "#0f172a",          
            "panel": "#1e293b",       
            "primary": "#3b82f6",     
            "success": "#10b981",     
            "warning": "#f59e0b",     
            "danger": "#ef4444",      
            "text": "#f1f5f9",        
            "text_dim": "#94a3b8"     
        }
        
        self.configure(fg_color=self.colors["bg"])

        # 2. LAYOUT GRID
        self.grid_columnconfigure(0, weight=3) # Video Area
        self.grid_columnconfigure(1, weight=1) # Sidebar
        self.grid_rowconfigure(0, weight=1)

        # --- LEFT: VIDEO FEED ---
        self.video_frame = ctk.CTkFrame(self, fg_color=self.colors["panel"], corner_radius=20, border_width=1, border_color="#334155")
        self.video_frame.grid(row=0, column=0, padx=20, pady=20, sticky="nsew")
        
        self.video_label = ctk.CTkLabel(self.video_frame, text="", corner_radius=15)
        self.video_label.pack(expand=True, fill="both", padx=15, pady=15)

        # --- RIGHT: CONTROLS SIDEBAR ---
        self.sidebar = ctk.CTkFrame(self, fg_color=self.colors["panel"], corner_radius=20, border_width=1, border_color="#334155")
        self.sidebar.grid(row=0, column=1, padx=(0, 20), pady=20, sticky="nsew")
        self.sidebar.grid_columnconfigure(0, weight=1)

        # Header Title
        self.lbl_title = ctk.CTkLabel(self.sidebar, text="DATA COLLECTOR", font=("Roboto", 24, "bold"), text_color=self.colors["text"])
        self.lbl_title.pack(pady=(30, 5))
        
        self.lbl_subtitle = ctk.CTkLabel(self.sidebar, text=f"Subject: {person_name}", font=("Roboto", 14), text_color=self.colors["text_dim"])
        self.lbl_subtitle.pack(pady=(0, 20))

        # Divider
        self.divider = ctk.CTkFrame(self.sidebar, height=2, fg_color="#334155")
        self.divider.pack(fill="x", padx=30, pady=10)

        # Status Box
        self.status_box = ctk.CTkFrame(self.sidebar, fg_color="#0f172a", corner_radius=10, border_width=1, border_color="#334155")
        self.status_box.pack(fill="x", padx=20, pady=20, ipady=10)
        
        self.lbl_status_title = ctk.CTkLabel(self.status_box, text="SYSTEM STATUS", font=("Roboto", 12, "bold"), text_color=self.colors["text_dim"])
        self.lbl_status_title.pack(pady=(10, 0))
        
        self.lbl_status = ctk.CTkLabel(self.status_box, text="INITIALIZING...", font=("Roboto", 18, "bold"), text_color=self.colors["warning"])
        self.lbl_status.pack(pady=(5, 10))

        # Counter Box
        self.counter_box = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        self.counter_box.pack(fill="x", padx=20, pady=10)
        
        self.lbl_count = ctk.CTkLabel(self.counter_box, text="0", font=("Roboto", 60, "bold"), text_color=self.colors["primary"])
        self.lbl_count.pack()
        
        self.lbl_count_text = ctk.CTkLabel(self.counter_box, text="PHOTOS CAPTURED", font=("Roboto", 12, "bold"), text_color=self.colors["text_dim"])
        self.lbl_count_text.pack()

        # Spacer
        self.spacer = ctk.CTkLabel(self.sidebar, text="", height=50)
        self.spacer.pack(side="bottom")

        # Buttons (Bottom of Sidebar)
        self.btn_quit = ctk.CTkButton(self.sidebar, text="EXIT SYSTEM", command=self.on_closing, 
                                      fg_color="transparent", border_width=2, border_color="#475569", 
                                      text_color=self.colors["text_dim"], hover_color="#ef4444", 
                                      height=50, font=("Roboto", 14, "bold"))
        self.btn_quit.pack(side="bottom", fill="x", padx=20, pady=10)

        self.btn_capture = ctk.CTkButton(self.sidebar, text="CAPTURE PHOTO", command=self.capture_photo, state="disabled",
                                         fg_color=self.colors["primary"], hover_color="#2563eb",
                                         height=60, font=("Roboto", 16, "bold"), corner_radius=10)
        self.btn_capture.pack(side="bottom", fill="x", padx=20, pady=10)

        # Variables
        self.count = 0
        self.last_save_time = 0
        self.face_detected = False
        self.frame = None
        
        # Start Loop
        self.update_video()

    def update_video(self):
        ret, frame = cap.read()
        if ret:
            self.frame = frame
            # Flip the frame horizontally (Mirror effect)
            frame = cv2.flip(frame, 1)
            display_frame = frame.copy()
            
            # Convert to grayscale for detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect Faces
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            self.face_detected = len(faces) > 0

            # Draw Box & Update UI
            if self.face_detected:
                for (x, y, w, h) in faces:
                    cv2.rectangle(display_frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                    
                self.lbl_status.configure(text="FACE DETECTED", text_color=self.colors["success"])
                self.btn_capture.configure(state="normal", fg_color=self.colors["success"], text="SAVE PHOTO")
            else:
                self.lbl_status.configure(text="NO FACE FOUND", text_color=self.colors["danger"])
                self.btn_capture.configure(state="disabled", fg_color="#334155", text="LOOK AT CAMERA")

            # Flash effect logic
            if time.time() - self.last_save_time < 0.2:
                # White flash
                overlay = display_frame.copy()
                cv2.rectangle(overlay, (0, 0), (1280, 720), (255, 255, 255), cv2.FILLED)
                cv2.addWeighted(overlay, 0.5, display_frame, 0.5, 0, display_frame)
                
                cv2.putText(display_frame, "SAVED!", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 0), 3)

            # Convert to image for tkinter
            # Resize for GUI fit
            display_frame = cv2.resize(display_frame, (800, 600)) 
            img = cv2.cvtColor(display_frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(img)
            
            # --- FIX: Use CTkImage for High DPI support ---
            # This line fixes the UserWarning you were seeing
            ctk_img = ctk.CTkImage(light_image=pil_image, dark_image=pil_image, size=(800, 600))
            
            self.video_label.configure(image=ctk_img)
            self.video_label.image = ctk_img # Keep reference to prevent garbage collection
        
        self.after(10, self.update_video)

    def capture_photo(self):
        if self.face_detected and self.frame is not None:
             # Save the FULL FRAME as JPG
            img_name = os.path.join(person_path, f"{person_name}_{self.count}.jpg")
            
            # Save the clean frame (Flip it first so it matches display orientation if needed)
            save_frame = cv2.flip(self.frame, 1)
            success = cv2.imwrite(img_name, save_frame)
            
            if success:
                print(f"Saved: {img_name}")
                self.count += 1
                self.lbl_count.configure(text=f"{self.count}")
                self.last_save_time = time.time() # Trigger flash effect
            else:
                print("Error: Failed to write image file.")

    def on_closing(self):
        cap.release()
        self.destroy()

if __name__ == "__main__":
    app = App()
    app.protocol("WM_DELETE_WINDOW", app.on_closing)
    app.mainloop()
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import threading
import time

app = Flask(__name__)

# Enable CORS for Flutter/React web app - allow all origins for development
CORS(app, 
     resources={r"/*": {"origins": "*"}},
     supports_credentials=False,
     methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
     allow_headers=["Content-Type", "Authorization"])

# Global state for squat detection
squat_count = 0
current_stage = "up"
current_angle = 0.0
status_message = "Ready to start"
is_running = False
camera_thread = None
cap = None

# Global frame buffer for browser streaming
latest_frame = None
frame_lock = threading.Lock()

# MediaPipe setup
mp_pose = mp.solutions.pose
mp_draw = mp.solutions.drawing_utils

SMOOTH_ALPHA = 0.4
MIN_VIS = 0.2
DEPTH_PERCENT = 0.75  # 75% of standing angle = bottom squat


def get_angle(a, b, c):
    a = np.array([a.x, a.y])
    b = np.array([b.x, b.y])
    c = np.array([c.x, c.y])
    ba = a - b
    bc = c - b
    cos = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    return np.degrees(np.arccos(np.clip(cos, -1, 1)))


def run_squat_detection():
    global squat_count, current_stage, current_angle, status_message, is_running, cap, latest_frame, frame_lock
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        status_message = "Camera could not be opened"
        is_running = False
        return
    
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    stage = "up"
    smoothed_angle = None
    standing_reference = None
    
    status_message = "Calibrating... Please stand straight"
    
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while is_running:
            ret, frame = cap.read()
            if not ret:
                break
            
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(rgb)
            vis = frame.copy()
            h, w = frame.shape[:2]
            
            if results.pose_landmarks:
                lm = results.pose_landmarks.landmark
                mp_draw.draw_landmarks(vis, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
                
                # Use left leg if visible, otherwise right leg
                if lm[mp_pose.PoseLandmark.LEFT_KNEE].visibility > MIN_VIS:
                    hip = lm[mp_pose.PoseLandmark.LEFT_HIP]
                    knee = lm[mp_pose.PoseLandmark.LEFT_KNEE]
                    ankle = lm[mp_pose.PoseLandmark.LEFT_ANKLE]
                else:
                    hip = lm[mp_pose.PoseLandmark.RIGHT_HIP]
                    knee = lm[mp_pose.PoseLandmark.RIGHT_KNEE]
                    ankle = lm[mp_pose.PoseLandmark.RIGHT_ANKLE]
                
                angle = get_angle(hip, knee, ankle)
                
                # Smooth the angle
                if smoothed_angle is None:
                    smoothed_angle = angle
                else:
                    smoothed_angle = SMOOTH_ALPHA * angle + (1 - SMOOTH_ALPHA) * smoothed_angle
                
                current_angle = smoothed_angle
                
                # Auto-standing calibration
                if standing_reference is None:
                    standing_reference = smoothed_angle
                    status_message = "Calibration complete. Start squatting!"
                
                # Compute dynamic squat depth
                squat_depth_angle = standing_reference * DEPTH_PERCENT
                
                # Squat detection logic
                # Going DOWN
                if smoothed_angle < squat_depth_angle and stage == "up":
                    stage = "down"
                    current_stage = "down"
                
                # Going UP (standing again)
                if smoothed_angle > standing_reference * 0.95 and stage == "down":
                    squat_count += 1
                    stage = "up"
                    current_stage = "up"
                    status_message = f"Squat {squat_count} completed!"
                
                # Display on screen
                cv2.putText(vis, f"Angle: {int(smoothed_angle)}°", (30, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                cv2.putText(vis, f"Stage: {stage}", (30, 110),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 2)
                cv2.putText(vis, f"Squats: {squat_count}", (30, 180),
                            cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 0), 3)
                cv2.putText(vis, f"Status: {status_message}", (30, 250),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
            
            # Save frame for browser streaming
            with frame_lock:
                _, buffer = cv2.imencode('.jpg', vis, [cv2.IMWRITE_JPEG_QUALITY, 80])
                latest_frame = buffer.tobytes()
            
            # Optional Desktop display window wrapped to prevent headless crashes
            try:
                cv2.imshow("Squat Detection Server", vis)
                if cv2.waitKey(5) & 0xFF == ord('q'):
                    is_running = False
                    break
            except Exception:
                # Bypassed when running in headless mode
                time.sleep(0.033)
                
    if cap:
        cap.release()
    try:
        cv2.destroyAllWindows()
    except Exception:
        pass
    status_message = "Detection stopped"
    is_running = False


@app.route('/squat/status', methods=['GET'])
def squat_status():
    global squat_count, current_stage, current_angle, status_message, is_running
    return jsonify(
        squat_count=squat_count,
        current_stage=current_stage,
        current_angle=float(current_angle),
        status_message=status_message,
        is_running=is_running
    )


@app.route('/squat/start', methods=['POST'])
def squat_start():
    global is_running, camera_thread, squat_count, current_stage, status_message
    
    if not is_running:
        is_running = True
        squat_count = 0
        current_stage = "up"
        status_message = "Starting squat detection..."
        camera_thread = threading.Thread(target=run_squat_detection, daemon=True)
        camera_thread.start()
        return jsonify(success=True, message="Squat detection started")
    return jsonify(success=False, message="Already running")


@app.route('/squat/stop', methods=['POST'])
def squat_stop():
    global is_running, status_message
    is_running = False
    status_message = "Stopped"
    return jsonify(success=True, message="Squat detection stopped")


@app.route('/squat/reset', methods=['POST'])
def squat_reset():
    global squat_count, current_stage, status_message
    squat_count = 0
    current_stage = "up"
    status_message = "Reset complete"
    return jsonify(success=True, message="Squat count reset")


@app.route('/video_feed', methods=['GET', 'OPTIONS'])
def video_feed():
    """Stream video frames as MJPEG to browser"""
    def generate():
        global latest_frame, frame_lock
        while True:
            with frame_lock:
                if latest_frame is not None:
                    frame = latest_frame
                else:
                    black_frame = np.zeros((480, 640, 3), dtype=np.uint8)
                    _, buffer = cv2.imencode('.jpg', black_frame)
                    frame = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            time.sleep(0.033)
            
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)

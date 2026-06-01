@echo off
REM Start all three python AI pose detection backends for SportsGauge

echo ====================================================
echo Starting SportsGauge AI Pose Estimation Engines...
echo ====================================================
echo.

REM Open three separate terminal windows for each backend
start cmd /k "echo Starting JUMP DETECTION (Port 5001)... && python jump_app.py"
timeout /t 2 /nobreak > nul

start cmd /k "echo Starting SQUAT DETECTION (Port 5002)... && python squat_app.py"
timeout /t 2 /nobreak > nul

start cmd /k "echo Starting SIT-UPS DETECTION (Port 5003)... && python situps_app.py"

echo.
echo All backend servers are starting in separate windows:
echo   - Port 5001: Jump Detection (jump_app.py)
echo   - Port 5002: Squat Detection (squat_app.py)
echo   - Port 5003: Sit-ups Detection (situps_app.py)
echo.
echo Please keep these terminal windows open while performing live tests!
echo.
pause

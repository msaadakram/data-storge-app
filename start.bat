@echo off
setlocal

echo ======================================
echo   File Uploader - Local Development
echo ======================================
echo.

REM Check if .env file exists
if not exist .env (
    echo Error: .env file not found!
    echo Please create a .env file based on .env.example
    echo.
    echo To create .env file:
    echo   copy .env.example .env
    echo.
    echo Then edit .env and add your configuration
    pause
    exit /b 1
)

REM Check if node_modules exists in root
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
    echo.
)

REM Check if node_modules exists in client
if not exist client\node_modules (
    echo Installing frontend dependencies...
    cd client
    call npm install
    cd ..
    echo.
)

echo Starting application...
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend server in a new window
start "Backend Server" cmd /c "npm run server"

REM Wait a bit for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend server in a new window
cd client
start "Frontend Server" cmd /c "npm run dev"
cd ..

echo.
echo Both servers are running in separate windows.
echo Close both windows to stop the servers.
echo.
pause

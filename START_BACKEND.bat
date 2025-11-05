@echo off
echo ================================
echo Starting React YouTube Backend
echo ================================
echo.

cd server

echo Checking node_modules...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)

echo.
echo Starting server on http://localhost:5000
echo Watch for MongoDB connection status...
echo.

call npm run dev

pause


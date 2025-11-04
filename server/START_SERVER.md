# Quick Start Guide - Backend Server

## Prerequisites Check

Before starting the server, ensure:

### 1. MongoDB is Installed and Running

**Check if MongoDB is installed:**
```powershell
mongosh --version
```

**Check if MongoDB service is running:**
```powershell
Get-Service -Name "MongoDB"
```

**Start MongoDB if not running:**
```powershell
net start MongoDB
```

Or use Services GUI:
1. Press `Win + R`
2. Type `services.msc`
3. Find "MongoDB Server"
4. Right-click → Start

### 2. Environment File Exists

Verify `server/.env` exists:
```powershell
cat server\.env
```

Should contain:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/react-youtube
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

**If missing, create it:**
```powershell
cd server
@"
PORT=5000
MONGO_URI=mongodb://localhost:27017/react-youtube
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding utf8
```

### 3. Dependencies Installed

```powershell
cd server
npm install
```

## Starting the Server

### Step 1: Start MongoDB (if not running)

```powershell
net start MongoDB
```

### Step 2: Seed the Database (First Time Only)

```powershell
cd server
npm run seed
```

Expected output:
```
✅ Connected to MongoDB
🗑️  Cleared existing videos
✅ Seeded 11 videos to MongoDB
   1. featured-1 - Epic Adventure Awaits
   2. trend-1 - Mountain Expedition
   ...
🎉 Database seeding completed successfully!
```

### Step 3: Start the Server

```powershell
cd server
npm run dev
```

Expected output:
```
✅ MongoDB Connected: localhost
📂 Database: react-youtube
🚀 Server is running on http://localhost:5000
📺 API Endpoints:
   - GET    http://localhost:5000/api/videos
   - GET    http://localhost:5000/api/videos/:id
   - POST   http://localhost:5000/api/videos
   - PUT    http://localhost:5000/api/videos/:id
   - DELETE http://localhost:5000/api/videos/:id

🗄️  Database: MongoDB
✨ CORS enabled for http://localhost:5173
```

## Verify Everything Works

### Test 1: Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

Should return:
```json
{
  "status": "healthy",
  "uptime": 1.234,
  "timestamp": "2024-11-04T...",
  "database": "MongoDB"
}
```

### Test 2: Get Videos

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/videos"
```

Should return:
```json
{
  "success": true,
  "count": 11,
  "data": [...]
}
```

### Test 3: Get Single Video

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/videos/trend-1"
```

Should return video data.

## Common Errors and Quick Fixes

### Error: "MongoDB Connection Error"

**Fix:**
```powershell
# Start MongoDB
net start MongoDB

# Wait 5 seconds, then restart server
cd server
npm run dev
```

### Error: "Port 5000 in use"

**Fix:**
```powershell
# Find and kill process
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
}

# Or change port in .env
# PORT=5001
```

### Error: "Cannot find module"

**Fix:**
```powershell
cd server
rm -r node_modules
rm package-lock.json
npm install
```

### Error: "API returns empty array"

**Fix:**
```powershell
cd server
npm run seed
```

## Complete Fresh Start

If everything is broken, start fresh:

```powershell
# 1. Stop all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Ensure MongoDB is running
net start MongoDB

# 3. Clean install
cd server
rm -r node_modules -ErrorAction SilentlyContinue
rm package-lock.json -ErrorAction SilentlyContinue
npm install

# 4. Create/verify .env file
@"
PORT=5000
MONGO_URI=mongodb://localhost:27017/react-youtube
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding utf8 -Force

# 5. Seed database
npm run seed

# 6. Start server
npm run dev
```

## One-Command Start (PowerShell Script)

Save as `start-backend.ps1`:

```powershell
#!/usr/bin/env pwsh

Write-Host "🚀 Starting React YouTube Backend..." -ForegroundColor Cyan

# Check MongoDB
Write-Host "`n1️⃣  Checking MongoDB..." -ForegroundColor Yellow
$mongo = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongo.Status -ne "Running") {
    Write-Host "   Starting MongoDB..." -ForegroundColor Yellow
    net start MongoDB
    Start-Sleep -Seconds 2
}
Write-Host "   ✅ MongoDB is running" -ForegroundColor Green

# Check .env
Write-Host "`n2️⃣  Checking configuration..." -ForegroundColor Yellow
if (-not (Test-Path "server\.env")) {
    Write-Host "   Creating .env file..." -ForegroundColor Yellow
    @"
PORT=5000
MONGO_URI=mongodb://localhost:27017/react-youtube
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
"@ | Out-File -FilePath "server\.env" -Encoding utf8
}
Write-Host "   ✅ Configuration ready" -ForegroundColor Green

# Check dependencies
Write-Host "`n3️⃣  Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "server\node_modules")) {
    Write-Host "   Installing dependencies..." -ForegroundColor Yellow
    cd server
    npm install --silent
    cd ..
}
Write-Host "   ✅ Dependencies installed" -ForegroundColor Green

# Check database
Write-Host "`n4️⃣  Checking database..." -ForegroundColor Yellow
$videosCount = & mongosh react-youtube --quiet --eval "db.videos.countDocuments()" 2>$null
if ($videosCount -eq 0 -or $null -eq $videosCount) {
    Write-Host "   Seeding database..." -ForegroundColor Yellow
    cd server
    npm run seed
    cd ..
} else {
    Write-Host "   ✅ Database has $videosCount videos" -ForegroundColor Green
}

# Start server
Write-Host "`n5️⃣  Starting server..." -ForegroundColor Yellow
Write-Host ""
cd server
npm run dev
```

Run it:
```powershell
.\start-backend.ps1
```

## Troubleshooting

See [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md) for detailed troubleshooting.

## Next Steps

Once the backend is running:

1. ✅ Backend API accessible at http://localhost:5000
2. ✅ MongoDB connected and seeded
3. 🎯 Start the frontend: `cd client && npm run dev`
4. 🌐 Access app at http://localhost:5173


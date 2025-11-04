# Backend Debugging Guide

## Common Issues and Solutions

### Issue 1: MongoDB Connection Error

**Error Message:**
```
❌ MongoDB Connection Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Cause:** MongoDB is not running

**Solutions:**

#### Windows:
```powershell
# Check if MongoDB service is running
Get-Service -Name "MongoDB"

# Start MongoDB service
net start MongoDB

# Or using Services GUI:
# 1. Press Win + R
# 2. Type: services.msc
# 3. Find "MongoDB Server"
# 4. Right-click → Start
```

#### macOS:
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

#### Linux:
```bash
# Check status
sudo systemctl status mongodb

# Start MongoDB
sudo systemctl start mongodb

# Enable on boot
sudo systemctl enable mongodb
```

### Issue 2: Missing .env File

**Error:** Variables like PORT and MONGO_URI are undefined

**Solution:**

Create `server/.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/react-youtube
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### Issue 3: Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**

**Windows:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

**Or change port in .env:**
```env
PORT=5001
```

### Issue 4: Module Import Errors

**Error Message:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module './config/database.js'
```

**Solution:**

1. Verify file structure:
```
server/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── Video.js
│   ├── routes/
│   │   └── videoRoutes.js
│   └── server.js
```

2. Ensure `package.json` has `"type": "module"`

3. Check import paths use `.js` extension

### Issue 5: Mongoose Connection Timeout

**Error Message:**
```
MongooseServerSelectionError: connect ETIMEDOUT
```

**Solutions:**

1. **Check MongoDB is running:**
   ```bash
   mongosh --eval "db.version()"
   ```

2. **Verify connection string in .env:**
   ```env
   MONGO_URI=mongodb://localhost:27017/react-youtube
   ```

3. **For MongoDB Atlas:**
   - Check IP whitelist (add `0.0.0.0/0` for development)
   - Verify username and password
   - Check connection string format:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/react-youtube?retryWrites=true&w=majority
   ```

### Issue 6: Database Not Seeded

**Symptom:** API returns empty array `[]`

**Solution:**

```bash
cd server
npm run seed
```

Expected output:
```
✅ Connected to MongoDB
🗑️  Cleared existing videos
✅ Seeded 11 videos to MongoDB
🎉 Database seeding completed successfully!
```

### Issue 7: CORS Errors in Browser

**Error in Browser Console:**
```
Access to fetch at 'http://localhost:5000/api/videos' has been blocked by CORS policy
```

**Solutions:**

1. **Verify backend CORS configuration in `server.js`:**
   ```javascript
   app.use(cors({
     origin: 'http://localhost:5173',
     credentials: true,
   }));
   ```

2. **Check frontend is running on port 5173:**
   ```bash
   cd client
   npm run dev
   ```

3. **Restart both servers after changes**

### Issue 8: nodemon Not Found

**Error:**
```
'nodemon' is not recognized as an internal or external command
```

**Solution:**

```bash
cd server
npm install

# Or install nodemon globally
npm install -g nodemon
```

## Debugging Steps

### Step 1: Check MongoDB Status

```bash
# Test MongoDB connection
mongosh

# If this works, MongoDB is running
# Type 'exit' to quit mongosh
```

### Step 2: Check Environment Variables

```bash
cd server
cat .env  # Linux/Mac
type .env  # Windows

# Should show:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/react-youtube
```

### Step 3: Test MongoDB Connection

```bash
cd server
node -e "import('mongoose').then(m => m.default.connect('mongodb://localhost:27017/react-youtube').then(() => console.log('✅ Connected')).catch(e => console.log('❌ Error:', e.message)))"
```

### Step 4: Check Server Logs

Start the server and watch for errors:

```bash
cd server
npm run dev
```

Look for:
- ✅ MongoDB Connected: localhost
- 📂 Database: react-youtube
- 🚀 Server is running on http://localhost:5000

### Step 5: Test API Endpoints

```powershell
# Windows PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Should return:
# {
#   "status": "healthy",
#   "uptime": ...,
#   "timestamp": ...,
#   "database": "MongoDB"
# }
```

### Step 6: Check Database Has Data

```bash
mongosh
use react-youtube
db.videos.countDocuments()
# Should return: 11 (after seeding)

db.videos.find().limit(1).pretty()
# Should show one video document
```

## Quick Fix Script

Create this PowerShell script to check everything:

```powershell
# save as: check-backend.ps1

Write-Host "🔍 Checking Backend Health..." -ForegroundColor Cyan

# Check MongoDB
Write-Host "`n1. Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq "Running") {
    Write-Host "   ✅ MongoDB service is running" -ForegroundColor Green
} else {
    Write-Host "   ❌ MongoDB service is NOT running" -ForegroundColor Red
    Write-Host "   Run: net start MongoDB" -ForegroundColor Yellow
}

# Check .env file
Write-Host "`n2. Checking .env file..." -ForegroundColor Yellow
if (Test-Path "server\.env") {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
    Get-Content "server\.env" | ForEach-Object { Write-Host "   $_" }
} else {
    Write-Host "   ❌ .env file missing" -ForegroundColor Red
    Write-Host "   Create server\.env with:" -ForegroundColor Yellow
    Write-Host "   PORT=5000" -ForegroundColor Gray
    Write-Host "   MONGO_URI=mongodb://localhost:27017/react-youtube" -ForegroundColor Gray
}

# Check node_modules
Write-Host "`n3. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "server\node_modules") {
    Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Dependencies not installed" -ForegroundColor Red
    Write-Host "   Run: cd server && npm install" -ForegroundColor Yellow
}

# Check port 5000
Write-Host "`n4. Checking port 5000..." -ForegroundColor Yellow
$port5000 = netstat -ano | Select-String ":5000"
if ($port5000) {
    Write-Host "   ⚠️  Port 5000 is in use" -ForegroundColor Yellow
    Write-Host "   $port5000"
} else {
    Write-Host "   ✅ Port 5000 is available" -ForegroundColor Green
}

Write-Host "`n✨ Check complete!" -ForegroundColor Cyan
```

Run it:
```powershell
.\check-backend.ps1
```

## Manual Troubleshooting Checklist

- [ ] MongoDB is installed
- [ ] MongoDB service is running
- [ ] `server/.env` file exists with correct values
- [ ] `server/node_modules` exists (ran `npm install`)
- [ ] Port 5000 is not in use
- [ ] Database is seeded (`npm run seed`)
- [ ] No firewall blocking MongoDB (port 27017)
- [ ] Correct Node.js version (18+)

## Still Having Issues?

### Get Detailed Logs

```bash
cd server
NODE_ENV=development npm run dev
```

### Test Each Component

1. **Test MongoDB:**
   ```bash
   mongosh --eval "db.version()"
   ```

2. **Test Server (without MongoDB):**
   ```bash
   # Temporarily comment out connectDB() in server.js
   # Then start server
   npm run dev
   ```

3. **Test API Routes:**
   ```bash
   # If server starts, test health endpoint
   curl http://localhost:5000/api/health
   ```

### Common Error Messages and Solutions

| Error | Solution |
|-------|----------|
| `ECONNREFUSED` | Start MongoDB service |
| `EADDRINUSE` | Kill process on port 5000 or change port |
| `MODULE_NOT_FOUND` | Check file paths and `npm install` |
| `ETIMEDOUT` | Check MongoDB connection string |
| `ValidationError` | Check data format in POST requests |
| `UnhandledPromiseRejection` | Check async/await error handling |

## Need More Help?

1. Check server console for error messages
2. Check browser console for frontend errors
3. Review `server/MONGODB_SETUP.md` for detailed MongoDB setup
4. Check `server/API_TESTING.md` for API testing examples
5. Ensure frontend and backend are using compatible data structures

## Quick Start (Clean Setup)

```bash
# 1. Ensure MongoDB is running
net start MongoDB

# 2. Install dependencies
cd server
npm install

# 3. Create .env file (if missing)
echo PORT=5000 > .env
echo MONGO_URI=mongodb://localhost:27017/react-youtube >> .env

# 4. Seed database
npm run seed

# 5. Start server
npm run dev

# Should see:
# ✅ MongoDB Connected: localhost
# 📂 Database: react-youtube
# 🚀 Server is running on http://localhost:5000
```


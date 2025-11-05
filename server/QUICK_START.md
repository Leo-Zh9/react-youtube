# Quick Start - Backend Server

## Problem: Server Won't Start

You've successfully fixed the configuration! Now let's start the server properly.

## Solution: Manual Start

### Option 1: Use the Batch File (Easiest)

Double-click the file in the project root:
```
START_BACKEND.bat
```

This will:
1. Navigate to server directory
2. Install dependencies if needed
3. Start the server with npm run dev
4. Show all output in the window

### Option 2: Manual Commands

Open PowerShell or Command Prompt:

```bash
cd "C:\Users\leozh\VS Code Projects\react-youtube\server"
npm run dev
```

Watch for these messages:
```
✅ MongoDB Connected: reactyoutube.q4ztbdy.mongodb.net
📂 Database: reactyoutube  
🚀 Server is running on http://localhost:5000
```

## What Was Fixed

### Issue: Environment Variable Whitespace

**Problem:** `.env` file had trailing spaces:
```env
AWS_REGION=us-east-1     # ← Extra spaces here
```

**Fix:** Removed trailing spaces and added `.trim()` in code:
```javascript
bucket: process.env.S3_BUCKET_NAME.trim()
```

### Issue: S3 Config Loading Before .env

**Problem:** Multer-S3 was initializing before environment variables loaded

**Fix:** Added conditional initialization:
```javascript
if (isS3Configured()) {
  // Initialize S3 only if configured
  s3Client = new S3Client({...});
}
```

## Current Status

✅ All dependencies installed  
✅ Environment variables configured  
✅ AWS S3 credentials present  
✅ MongoDB Atlas connection string configured  
✅ All modules import successfully  

## Next Steps

### 1. Start the Backend

```bash
cd server
npm run dev
```

**Expected Output:**
```
[nodemon] starting `node src/server.js`
⚠️  AWS S3 not configured. File uploads will not work.
   Configure AWS credentials in .env to enable S3 uploads.
✅ MongoDB Connected: reactyoutube.q4ztbdy.mongodb.net
📂 Database: reactyoutube

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

**Note:** If you see "AWS S3 not configured", that's okay! The server will work for:
- Viewing videos
- API endpoints
- MongoDB operations

S3 upload will only work if you have a real AWS bucket configured.

### 2. Test the API

```powershell
# Test health
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Get videos
Invoke-RestMethod -Uri "http://localhost:5000/api/videos"

# Check S3 status
Invoke-RestMethod -Uri "http://localhost:5000/api/upload/status"
```

### 3. Seed the Database (If Empty)

```bash
cd server
npm run seed
```

### 4. Start the Frontend

In a **new terminal**:
```bash
cd client
npm run dev
```

### 5. Access the Application

Open browser: **http://localhost:5173**

## Troubleshooting

### Server Starts But No Output

The server might be running in a background process. Check:

```powershell
# Find node processes
Get-Process -Name "node"

# Find what's using port 5000
netstat -ano | findstr :5000

# Kill all node processes
Get-Process -Name "node" | Stop-Process -Force
```

### "Cannot find module" Error

```bash
cd server
rm -r node_modules
rm package-lock.json
npm install
```

### MongoDB Connection Timeout

**MongoDB Atlas:** Check:
1. Cluster is running
2. IP whitelist includes your IP (or 0.0.0.0/0)
3. Username and password correct in MONGO_URI

**Local MongoDB:**
```bash
net start MongoDB
```

### Port 5000 Already in Use

**Find and kill process:**
```powershell
# Find process ID
netstat -ano | findstr :5000

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

**Or use different port:**
Edit `.env`:
```env
PORT=5001
```

## Testing Endpoints

Once server is running:

**Browser:**
- http://localhost:5000/
- http://localhost:5000/api/health
- http://localhost:5000/api/videos
- http://localhost:5000/api/upload/status

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/videos"
```

## Success Indicators

✅ No error messages in console  
✅ "Server is running" message appears  
✅ MongoDB connection successful (or graceful failure)  
✅ API endpoints respond with JSON  
✅ Frontend can fetch videos  

## If Still Having Issues

1. **Read the server output carefully** - Error messages tell you what's wrong
2. **Check server/server-output.log** if it exists
3. **Run test-server.js** to diagnose:
   ```bash
   node test-server.js
   ```
4. **Check MongoDB Atlas** - Is cluster paused?
5. **Verify .env file** - Run:
   ```powershell
   Get-Content .env
   ```

## Production Note

For production deployment:
- Use environment variables from hosting platform
- Don't commit `.env` file to git
- Use MongoDB Atlas or managed MongoDB
- Use IAM roles instead of AWS access keys
- Configure proper CORS origins

## Need Help?

Check these files:
- `DEBUGGING_GUIDE.md` - Comprehensive troubleshooting
- `MONGODB_SETUP.md` - MongoDB setup
- `AWS_S3_SETUP.md` - AWS S3 setup
- `START_SERVER.md` - Detailed startup guide


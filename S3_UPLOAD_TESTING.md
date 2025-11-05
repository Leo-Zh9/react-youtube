# AWS S3 Upload Testing Guide

## Quick Start Testing

### Prerequisites

Before testing, ensure:

1. ✅ AWS S3 bucket created
2. ✅ IAM user created with access keys
3. ✅ Backend `.env` configured with AWS credentials
4. ✅ MongoDB running and seeded
5. ✅ Backend dependencies installed (`npm install`)

### Test Flow Overview

```
User selects video file → Frontend sends multipart/form-data
                              ↓
Backend receives file → Multer processes → Upload to S3
                              ↓
Get S3 URL → Save to MongoDB → Return success
                              ↓
Frontend shows success → Redirect to homepage → Video plays from S3
```

## Test 1: Check S3 Configuration

```bash
# Start backend
cd server
npm run dev

# Check configuration
curl http://localhost:5000/api/upload/status
```

**Expected Response:**
```json
{
  "success": true,
  "configured": true,
  "region": "us-east-1",
  "bucket": "your-bucket-name"
}
```

**If configured = false:**
- Check `server/.env` has AWS credentials
- Verify credentials are correct
- Restart server after updating `.env`

## Test 2: Upload via Frontend

### Step-by-Step

1. **Start Both Servers**
   ```bash
   # Terminal 1
   cd server
   npm run dev

   # Terminal 2
   cd client
   npm run dev
   ```

2. **Navigate to Upload Page**
   - Open: http://localhost:5173/upload
   - Should see upload form

3. **Select Video File**
   - Click "Click to select video file" area
   - Choose a small MP4 file (under 100MB for testing)
   - File name should appear

4. **Fill Form Fields**
   - Title: "S3 Upload Test"
   - Description: "Testing AWS S3 upload integration"
   - Category: Technology
   - Duration: 5:00
   - Rating: G

5. **Optional: Select Thumbnail**
   - Click thumbnail upload area
   - Choose a JPG/PNG image

6. **Upload**
   - Click "Upload to S3" button
   - Watch progress bar (0% → 100%)
   - Wait for success message
   - Auto-redirect to homepage

7. **Verify on Homepage**
   - Uploaded video should appear in carousels
   - Click to play video
   - Video should stream from S3

## Test 3: Verify in AWS S3

### Check Files in S3 Bucket

1. **Open AWS S3 Console**
   - Go to https://s3.console.aws.amazon.com
   - Click your bucket name

2. **Check Folders**
   - Should see `videos/` folder
   - Should see `thumbnails/` folder (if uploaded)

3. **View Uploaded File**
   - Click `videos/` folder
   - Should see file like: `1699123456789-123456789.mp4`
   - Click file → Properties
   - Check "Object URL"

4. **Test S3 URL**
   - Copy the Object URL
   - Paste in browser
   - Video should download/play

## Test 4: Verify in MongoDB

```bash
mongosh
use react-youtube
db.videos.find().sort({createdAt: -1}).limit(1).pretty()
```

**Expected Output:**
```javascript
{
  _id: ObjectId("673..."),
  id: "user-1699123456789",
  title: "S3 Upload Test",
  description: "Testing AWS S3 upload integration",
  url: "https://your-bucket.s3.us-east-1.amazonaws.com/videos/1699123456789-123456789.mp4",
  thumbnail: "https://your-bucket.s3.us-east-1.amazonaws.com/thumbnails/1699123456789-987654321.jpg",
  category: "Technology",
  duration: "5:00",
  views: "0",
  year: "2024",
  rating: "G",
  uploadDate: "2024-11-04",
  createdAt: ISODate("2024-11-04T..."),
  updatedAt: ISODate("2024-11-04T...")
}
```

**Verify:**
- ✅ `url` field contains S3 URL
- ✅ `thumbnail` field contains S3 URL
- ✅ All metadata present

## Test 5: Video Playback

### Test in Video Player

1. **Navigate to Video**
   - Go to homepage
   - Find uploaded video
   - Click to play

2. **Check Network Tab**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Play video
   - Should see request to S3 URL
   - Status should be 206 (Partial Content) for streaming

3. **Verify Playback**
   - Video should play smoothly
   - Can seek forward/backward
   - Can pause/resume
   - Fullscreen works

## Test 6: Error Handling

### Test Invalid File Types

1. **Try Uploading Non-Video File**
   - Select a PDF or TXT file
   - Should show error: "Please select a video file"

2. **Try Uploading Large File**
   - Select file > 500MB
   - Should show error: "File too large"

### Test Missing Required Fields

1. **Upload Without Title**
   - Select video but leave title empty
   - Click upload
   - Should show: "Title is required"

2. **Upload Without Video File**
   - Fill title but don't select file
   - Should show: "Please select a video file to upload"

## Test 7: Upload Progress

### Monitor Progress Bar

1. **Upload Larger File** (50-100MB)
2. **Watch Progress Bar**
   - Should update smoothly
   - Shows percentage (0% → 100%)
   - "Uploading to S3..." message

3. **Don't Close Tab**
   - Warning should display
   - Upload continues in background

## Test 8: Multiple Uploads

1. **Upload First Video**
   - Complete upload
   - Return to homepage

2. **Upload Second Video**
   - Go back to /upload
   - Upload another video
   - Verify both appear on homepage

3. **Check S3 Bucket**
   - Should have 2 videos
   - Each with unique filename

## Test 9: End-to-End Verification

**Complete Flow:**

1. ✅ Select video file (local filesystem)
2. ✅ Fill metadata (title, description, etc.)
3. ✅ Click Upload button
4. ✅ Frontend sends multipart/form-data to backend
5. ✅ Backend uploads file to S3
6. ✅ Backend gets S3 URL from response
7. ✅ Backend saves metadata + S3 URL to MongoDB
8. ✅ Backend returns success to frontend
9. ✅ Frontend shows success message
10. ✅ Frontend redirects to homepage
11. ✅ Homepage fetches from API
12. ✅ New video appears in carousel
13. ✅ Click video to play
14. ✅ Video streams from S3
15. ✅ All features work

## Performance Testing

### Upload Speed

**Expected Times (with good internet):**

| File Size | Upload Time |
|-----------|-------------|
| 10 MB     | 5-10 seconds |
| 50 MB     | 20-30 seconds |
| 100 MB    | 40-60 seconds |
| 500 MB    | 3-5 minutes |

**Factors:**
- Internet upload speed
- AWS region (closer = faster)
- Server location

### Streaming Performance

**Video Should:**
- Start playing within 2-3 seconds
- Buffer smoothly
- Not require full download
- Support seeking (jump to any position)

## Troubleshooting Test Issues

### Upload Fails Immediately

**Check:**
```bash
# Verify S3 configuration
curl http://localhost:5000/api/upload/status

# Should return configured: true
```

**Fix:**
- Update `server/.env` with AWS credentials
- Restart server

### Upload Hangs at 0%

**Check:**
- Internet connection
- File size (< 500MB?)
- Backend server running
- No firewall blocking

**Fix:**
- Test with smaller file
- Check backend console for errors

### Upload Succeeds But Video Won't Play

**Check:**
1. S3 URL in MongoDB
2. S3 bucket policy allows public read
3. CORS configured on bucket

**Fix:**
```bash
# Check MongoDB
mongosh
use react-youtube
db.videos.findOne({}, {url: 1, _id: 0})

# Copy URL and test in browser
# Should download/play
```

### "Access Denied" Error

**Check:**
- IAM user permissions
- Bucket policy
- Credentials in `.env`

**Fix:**
- Verify IAM user has `S3FullAccess`
- Check bucket policy in AWS Console
- Verify credentials are correct

## Manual Test Commands

### Test Upload Endpoint

```powershell
# PowerShell - Create test video file
echo "test" > test.mp4

# Upload using Invoke-RestMethod
$form = @{
    video = Get-Item -Path "test.mp4"
    title = "Test Upload"
    description = "Manual test"
    category = "Test"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/upload" -Method Post -Form $form
```

### Test with Real File

```powershell
# Replace with actual video file path
$form = @{
    video = Get-Item -Path "C:\path\to\video.mp4"
    title = "My Video"
    description = "Uploaded via PowerShell"
}

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/upload" -Method Post -Form $form
$response | ConvertTo-Json -Depth 3
```

## Success Indicators

### Backend Logs Should Show:

```
2024-11-04T12:00:00.000Z - POST /api/upload
✅ Video uploaded to S3 and saved to MongoDB: user-1699123456789
```

### AWS S3 Should Show:

```
your-bucket-name/
  └── videos/
      └── 1699123456789-123456789.mp4  (your file)
  └── thumbnails/
      └── 1699123456789-987654321.jpg  (if uploaded)
```

### MongoDB Should Show:

```javascript
{
  url: "https://your-bucket.s3.us-east-1.amazonaws.com/videos/...",
  // All metadata present
}
```

### Frontend Should Show:

- ✅ Success notification
- ✅ Video in carousel
- ✅ Video plays from S3

## Checklist

- [ ] S3 bucket created and configured
- [ ] IAM user created with access keys
- [ ] `.env` file configured with credentials
- [ ] Dependencies installed (`npm install`)
- [ ] Backend server starts without errors
- [ ] Configuration status returns `configured: true`
- [ ] Can upload small video file
- [ ] File appears in S3 bucket
- [ ] Metadata saved to MongoDB with S3 URL
- [ ] Video appears on homepage
- [ ] Video plays from S3
- [ ] Progress bar works
- [ ] Error handling works
- [ ] Thumbnail upload works (optional)

## Next Steps After Successful Testing

1. **Add More Features:**
   - Video transcoding (multiple resolutions)
   - Automatic thumbnail generation
   - Video compression before upload
   - Direct upload to S3 (presigned URLs)

2. **Improve Security:**
   - Add user authentication
   - Restrict uploads to authenticated users
   - Virus scanning
   - Content moderation

3. **Optimize Performance:**
   - CloudFront CDN
   - Multipart upload for large files
   - Resume interrupted uploads
   - Client-side compression

4. **Production Deployment:**
   - Use IAM roles instead of access keys
   - Set up CloudWatch monitoring
   - Configure bucket lifecycle policies
   - Set up billing alerts

## Support

For issues:
1. Check [AWS_S3_SETUP.md](server/AWS_S3_SETUP.md) for setup
2. Check [DEBUGGING_GUIDE.md](server/DEBUGGING_GUIDE.md) for troubleshooting
3. Review backend console logs
4. Check browser console for frontend errors
5. Verify AWS credentials and permissions


# AWS S3 Upload Setup Guide

## Overview

This guide will help you set up AWS S3 for video file uploads. Videos are uploaded to S3, and metadata is stored in MongoDB with the S3 URL.

## Prerequisites

- AWS Account
- AWS CLI (optional, but recommended)
- Node.js 18+
- MongoDB

## Step 1: Create AWS S3 Bucket

### Using AWS Console

1. **Sign in to AWS Console**
   - Go to https://console.aws.amazon.com
   - Navigate to S3 service

2. **Create New Bucket**
   - Click "Create bucket"
   - Enter bucket name (e.g., `react-youtube-videos`)
   - Select region (e.g., `us-east-1`)
   - **Important:** Uncheck "Block all public access"
   - Acknowledge the warning
   - Click "Create bucket"

3. **Configure Bucket Policy**
   - Go to your bucket
   - Click "Permissions" tab
   - Scroll to "Bucket policy"
   - Click "Edit" and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

Replace `YOUR-BUCKET-NAME` with your actual bucket name.

4. **Configure CORS**
   - Click "Permissions" tab
   - Scroll to "Cross-origin resource sharing (CORS)"
   - Click "Edit" and paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## Step 2: Create IAM User

### Create User with S3 Access

1. **Go to IAM Service**
   - Navigate to IAM in AWS Console
   - Click "Users" → "Add users"

2. **Create User**
   - User name: `react-youtube-uploader`
   - Access type: Check "Programmatic access"
   - Click "Next: Permissions"

3. **Attach Policies**
   - Click "Attach existing policies directly"
   - Search and select: `AmazonS3FullAccess`
   - Click "Next: Tags" → "Next: Review" → "Create user"

4. **Save Credentials**
   - **IMPORTANT:** Copy and save:
     - Access key ID
     - Secret access key
   - You won't be able to see the secret key again!

## Step 3: Configure Backend

### Install Dependencies

```bash
cd server
npm install @aws-sdk/client-s3 multer multer-s3
```

### Update .env File

Edit `server/.env`:

```env
# Existing configuration
PORT=5000
MONGO_URI=mongodb://localhost:27017/react-youtube
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY_HERE
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

Replace with your actual credentials:
- `AWS_ACCESS_KEY_ID`: From IAM user creation
- `AWS_SECRET_ACCESS_KEY`: From IAM user creation
- `AWS_REGION`: Your bucket's region
- `S3_BUCKET_NAME`: Your bucket name

## Step 4: Test S3 Configuration

### Check Configuration Status

```bash
# Start the server
cd server
npm run dev

# Test configuration endpoint
curl http://localhost:5000/api/upload/status
```

Should return:
```json
{
  "success": true,
  "configured": true,
  "region": "us-east-1",
  "bucket": "your-bucket-name"
}
```

## Step 5: Test File Upload

### Using Frontend

1. **Start Both Servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

2. **Upload Test Video**
   - Navigate to http://localhost:5173/upload
   - Select a small video file
   - Fill in title
   - Click "Upload to S3"
   - Wait for upload to complete

3. **Verify Upload**
   - Check AWS S3 Console
   - Your bucket should have `videos/` folder
   - Video file should be there

### Using curl

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "video=@/path/to/video.mp4" \
  -F "title=Test Video" \
  -F "description=Test upload to S3"
```

### Using Postman

1. **Create POST Request**
   - URL: `http://localhost:5000/api/upload`
   - Method: POST
   - Body: form-data

2. **Add Form Fields**
   - Key: `video`, Type: File, Value: [select video file]
   - Key: `thumbnail`, Type: File, Value: [select image file] (optional)
   - Key: `title`, Type: Text, Value: "Test Video"
   - Key: `description`, Type: Text, Value: "Test description"
   - Key: `category`, Type: Text, Value: "Technology"

3. **Send Request**
   - Should return success with S3 URL

## Step 6: Verify MongoDB

```bash
mongosh
use react-youtube
db.videos.find().sort({createdAt: -1}).limit(1).pretty()
```

Should show:
```javascript
{
  _id: ObjectId("..."),
  id: "user-1234567890",
  title: "Test Video",
  url: "https://your-bucket.s3.amazonaws.com/videos/1234567890.mp4",
  thumbnail: "https://your-bucket.s3.amazonaws.com/thumbnails/1234567890.jpg",
  ...
}
```

## Security Best Practices

### 1. Use IAM Roles (Production)

Instead of access keys, use IAM roles when deploying to EC2/ECS:

```javascript
// No credentials needed when using IAM roles
const s3Client = new S3Client({
  region: process.env.AWS_REGION
});
```

### 2. Restrict Bucket Policy

For production, restrict to specific domains:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*",
      "Condition": {
        "StringLike": {
          "aws:Referer": [
            "https://yourdomain.com/*"
          ]
        }
      }
    }
  ]
}
```

### 3. Use Environment Variables

Never commit AWS credentials to git:
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate credentials periodically

### 4. Limit File Sizes

Current limits:
- Video: 500MB
- Thumbnail: 10MB

Adjust in `server/src/config/aws.js` if needed.

### 5. Add Virus Scanning

Consider adding virus scanning for uploads:
- AWS S3 + ClamAV
- Third-party services

## Troubleshooting

### Issue: "Access Denied" Error

**Cause:** Incorrect credentials or insufficient permissions

**Solution:**
1. Verify credentials in `.env`
2. Check IAM user has `AmazonS3FullAccess`
3. Restart server after updating `.env`

### Issue: "Bucket does not exist"

**Cause:** Wrong bucket name or region

**Solution:**
1. Verify bucket name in AWS Console
2. Check `S3_BUCKET_NAME` in `.env`
3. Verify `AWS_REGION` matches bucket region

### Issue: "CORS Error" in Browser

**Cause:** CORS not configured on S3 bucket

**Solution:**
1. Go to S3 bucket → Permissions → CORS
2. Add CORS configuration (see Step 1)
3. Save and retry

### Issue: Upload Timeout

**Cause:** Large file or slow connection

**Solution:**
1. Test with smaller file first
2. Check internet connection
3. Increase timeout in `aws.js` if needed

### Issue: Video Not Playing

**Cause:** Bucket policy doesn't allow public read

**Solution:**
1. Check bucket policy (Step 1)
2. Ensure `GetObject` is allowed
3. Verify video URL is accessible in browser

## AWS Costs

### S3 Pricing (as of 2024)

**Storage:**
- First 50 TB: $0.023 per GB
- Example: 100 GB = $2.30/month

**Data Transfer:**
- First 100 GB/month: FREE
- Next 9.999 TB: $0.09 per GB

**Requests:**
- PUT/POST: $0.005 per 1,000 requests
- GET: $0.0004 per 1,000 requests

**Example Monthly Cost:**
- 100 videos (10 GB total)
- 10,000 views/month
- **Estimated: $0.50 - $1.00/month**

### Free Tier (First 12 Months)

- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests
- 100 GB data transfer out

## Monitoring

### CloudWatch Metrics

Monitor S3 usage:
1. Go to CloudWatch in AWS Console
2. Select "S3" metrics
3. Monitor:
   - Number of requests
   - Data transfer
   - Bucket size

### Set Up Billing Alerts

1. Go to AWS Billing
2. Create budget alert
3. Set threshold (e.g., $5/month)
4. Get email notifications

## Alternative: Using CloudFront (CDN)

For better performance, add CloudFront:

1. **Create CloudFront Distribution**
   - Origin: Your S3 bucket
   - Default behavior: Viewer Protocol Policy = HTTPS only

2. **Update Video URLs**
   - Use CloudFront URL instead of S3 direct URL
   - Example: `https://d1234567890.cloudfront.net/videos/...`

3. **Benefits**
   - Faster video delivery worldwide
   - Reduced S3 costs
   - HTTPS by default

## Next Steps

1. ✅ S3 bucket created and configured
2. ✅ IAM user created with access keys
3. ✅ Backend configured with AWS credentials
4. ✅ Test upload working
5. 🎯 **Optional:** Set up CloudFront CDN
6. 🎯 **Optional:** Add video transcoding (AWS MediaConvert)
7. 🎯 **Optional:** Add thumbnail generation (AWS Lambda)

## Support Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Multer-S3 Documentation](https://github.com/badunk/multer-s3)


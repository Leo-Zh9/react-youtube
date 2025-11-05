# React YouTube - Netflix UI (Interview Assessment)

A full-stack application with YouTube functionality, Netflix-style UI, and AWS S3 video storage.

## Project Structure

- `/client` - React frontend with Vite
- `/server` - Node.js Express backend with MongoDB + AWS S3

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- AWS Account with S3 bucket configured
- npm or yarn

## Quick Start

### 1. Install MongoDB

**Option A: Local MongoDB**
- Download from https://www.mongodb.com/try/download/community
- Install and start the service

**Option B: MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas

See [server/MONGODB_SETUP.md](server/MONGODB_SETUP.md) for details.

### 2. Set Up AWS S3

**Create S3 Bucket:**
1. Go to AWS Console → S3
2. Create bucket (e.g., `react-youtube-videos`)
3. Disable "Block all public access"
4. Configure bucket policy and CORS

**Create IAM User:**
1. Go to IAM → Users → Add user
2. Enable programmatic access
3. Attach `AmazonS3FullAccess` policy
4. Save access key ID and secret key

See [server/AWS_S3_SETUP.md](server/AWS_S3_SETUP.md) for complete guide.

### 3. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 4. Configure Environment

Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/react-youtube

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

### 5. Seed the Database

```bash
cd server
npm run seed
```

### 6. Start the Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 7. Access the Application

**Frontend:** http://localhost:5173  
**Backend API:** http://localhost:5000

## Features

### Netflix-Style UI ✨
- 🎬 Hero section with featured video banner
- 🎞️ Multiple horizontal scrollable carousels
- 🔍 Real-time search filtering
- 🎨 Dark theme with red accents
- 📱 Fully responsive design
- ✨ Smooth hover animations
- 📺 Full-featured HTML5 video player

### AWS S3 Integration ☁️
- 📤 Direct file upload to AWS S3
- 🎥 Video files stored in S3
- 🖼️ Thumbnail images stored in S3
- 📊 Metadata in MongoDB with S3 URLs
- 📈 Upload progress tracking
- ✅ File type and size validation
- 🔒 Secure access with IAM credentials

### MongoDB Backend 🗄️
- 🔌 RESTful API with Express
- 📊 Mongoose ODM with schemas
- 🔄 Full CRUD operations
- 🌐 CORS enabled
- ✅ Data validation

### Frontend Integration 🔗
- 📡 Dynamic data fetching from API
- 📤 Multipart file upload with progress
- ⏳ Loading states and spinners
- ❌ Comprehensive error handling
- 🎯 Real-time search filtering

## API Endpoints

### Videos (MongoDB)
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get single video
- `POST /api/videos` - Create video (URL-based)
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

### Upload (S3)
- `POST /api/upload` - Upload video file to S3
- `GET /api/upload/status` - Check S3 configuration

### Health
- `GET /api/health` - Health check

## Architecture

### Data Flow

```
User uploads file → React (FormData) → Express (Multer)
                                           ↓
                                     AWS S3 Upload
                                           ↓
                                     Get S3 URL
                                           ↓
                                     MongoDB Save
                                           ↓
                                     Success Response
                                           ↓
Homepage fetches videos → Display with S3 URLs → Video plays from S3
```

### File Storage

```
AWS S3 Bucket:
├── videos/
│   ├── 1699123456789-123456789.mp4
│   ├── 1699123456790-987654321.mp4
│   └── ...
└── thumbnails/
    ├── 1699123456789-111111111.jpg
    ├── 1699123456790-222222222.jpg
    └── ...

MongoDB:
{
  id: "user-1699123456789",
  title: "My Video",
  url: "https://bucket.s3.region.amazonaws.com/videos/...",
  thumbnail: "https://bucket.s3.region.amazonaws.com/thumbnails/...",
  ...metadata
}
```

## Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Swiper.js
- XMLHttpRequest (for upload progress)

### Backend
- Node.js
- Express
- **MongoDB** (Database)
- **Mongoose** (ODM)
- **AWS SDK v3** (@aws-sdk/client-s3)
- **Multer** (File upload middleware)
- **Multer-S3** (S3 storage engine)
- CORS
- dotenv

## File Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   └── aws.js           # AWS S3 & Multer config (NEW)
│   ├── models/
│   │   └── Video.js         # Mongoose schema
│   ├── routes/
│   │   ├── videoRoutes.js   # CRUD operations
│   │   └── uploadRoutes.js  # S3 file upload (NEW)
│   ├── scripts/
│   │   └── seedDatabase.js  # Database seeder
│   └── server.js            # Express app
├── data/
│   └── videos.json          # Seed data
├── AWS_S3_SETUP.md          # S3 setup guide (NEW)
└── env.example              # Environment template

client/
├── src/
│   ├── services/
│   │   ├── api.js              # API service
│   │   └── uploadService.js    # S3 upload service (NEW)
│   ├── pages/
│   │   ├── HomePage.jsx         # Shows uploaded videos
│   │   ├── VideoPlayerPage.jsx  # Plays S3 videos
│   │   └── UploadPage.jsx       # File upload form (UPDATED)
│   └── components/
│       ├── Navbar.jsx          # Upload button
│       └── ...
└── UPLOAD_FEATURE.md          # Upload documentation
```

## Development Scripts

### Server
```bash
npm run dev    # Start server with nodemon
npm start      # Start server (production)
npm run seed   # Seed database
```

### Client
```bash
npm run dev    # Start Vite dev server
npm run build  # Build for production
```

## Testing

### Complete Testing Checklist

See [S3_UPLOAD_TESTING.md](S3_UPLOAD_TESTING.md) for detailed testing guide.

**Quick Test:**
1. Navigate to http://localhost:5173/upload
2. Select video file
3. Fill in title
4. Click "Upload to S3"
5. Watch progress bar
6. Success → Redirect to homepage
7. Video appears and plays from S3

## Configuration

### Backend Environment Variables

Required in `server/.env`:

```env
# Server
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/react-youtube

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

### File Upload Limits

**Current Settings:**
- Video: 500MB max
- Thumbnail: 10MB max
- Supported formats: All video/* and image/* types

**To Change:**
Edit `server/src/config/aws.js`:
```javascript
limits: {
  fileSize: 500 * 1024 * 1024, // 500MB
}
```

## Troubleshooting

### Videos Not Loading

1. **Check MongoDB:**
   ```bash
   mongosh
   use react-youtube
   db.videos.find()
   ```

2. **Check Backend:**
   ```bash
   curl http://localhost:5000/api/videos
   ```

3. **Check S3 URLs:**
   - Copy URL from MongoDB
   - Paste in browser
   - Should download/play

### Upload Fails

1. **Check S3 Configuration:**
   ```bash
   curl http://localhost:5000/api/upload/status
   ```

2. **Check AWS Credentials:**
   - Verify in `server/.env`
   - Test in AWS Console

3. **Check Bucket Permissions:**
   - Bucket policy allows uploads
   - IAM user has permissions

### CORS Errors

**Backend:** Update `server/src/server.js`
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

**S3:** Add CORS policy to bucket (see AWS_S3_SETUP.md)

## Documentation

- [AWS S3 Setup Guide](server/AWS_S3_SETUP.md) - Complete AWS setup
- [MongoDB Setup Guide](server/MONGODB_SETUP.md) - MongoDB installation
- [S3 Upload Testing](S3_UPLOAD_TESTING.md) - Testing procedures
- [API Documentation](server/API_TESTING.md) - API reference
- [Upload Feature Guide](client/UPLOAD_FEATURE.md) - Upload feature docs
- [Debugging Guide](server/DEBUGGING_GUIDE.md) - Troubleshooting
- [Start Server Guide](server/START_SERVER.md) - Server startup

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to git
- Rotate AWS credentials periodically
- Use IAM roles in production (not access keys)
- Set up billing alerts in AWS
- Monitor S3 usage and costs

## AWS Costs

**Estimated Monthly Cost (Light Usage):**
- S3 Storage (10 GB): $0.23
- Data Transfer (100 GB): $9.00
- Requests (10,000): $0.05
- **Total: ~$10/month**

**Free Tier (First 12 months):**
- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests
- 100 GB data transfer

## Future Enhancements

- [ ] Video transcoding (AWS MediaConvert)
- [ ] Automatic thumbnail generation (AWS Lambda)
- [ ] Multiple video resolutions
- [ ] CloudFront CDN integration
- [ ] Resumable uploads
- [ ] User authentication
- [ ] Upload quota limits
- [ ] Video analytics

## License

ISC

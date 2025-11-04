# API Testing Guide

## Starting the Server

```bash
cd server
npm run dev
```

The server will start on **http://localhost:5000**

## API Endpoints

### 1. Health Check

**GET** `http://localhost:5000/`

**Response:**
```json
{
  "message": "React YouTube API Server",
  "status": "OK",
  "timestamp": "2024-11-04T12:00:00.000Z",
  "endpoints": {
    "videos": "/api/videos",
    "health": "/api/health"
  }
}
```

### 2. Get All Videos

**GET** `http://localhost:5000/api/videos`

**Response:**
```json
{
  "success": true,
  "count": 11,
  "data": [
    {
      "id": "featured-1",
      "title": "Epic Adventure Awaits",
      "description": "Join us on an incredible journey...",
      "thumbnail": "https://images.unsplash.com/...",
      "videoUrl": "https://commondatastorage.googleapis.com/...",
      "duration": "2h 15m",
      "views": "5.2M",
      "category": "Adventure",
      "year": "2024",
      "rating": "PG-13",
      "uploadDate": "2024-10-15"
    },
    ...
  ]
}
```

### 3. Get Single Video by ID

**GET** `http://localhost:5000/api/videos/:id`

**Example:** `http://localhost:5000/api/videos/trend-1`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trend-1",
    "title": "Mountain Expedition",
    "description": "Climbing the highest peaks in the world",
    "thumbnail": "https://images.unsplash.com/...",
    "videoUrl": "https://commondatastorage.googleapis.com/...",
    "duration": "15:42",
    "views": "2.5M",
    "category": "Adventure",
    "year": "2024",
    "rating": "PG",
    "uploadDate": "2024-10-20"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Video with ID 'invalid-id' not found"
}
```

### 4. Add New Video (Admin)

**POST** `http://localhost:5000/api/videos`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "id": "custom-1",
  "title": "My Custom Video",
  "description": "A test video description",
  "thumbnail": "https://example.com/thumb.jpg",
  "videoUrl": "https://example.com/video.mp4",
  "duration": "10:30",
  "views": "100K",
  "category": "Test",
  "year": "2024",
  "rating": "G"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video added successfully",
  "data": {
    "id": "custom-1",
    "title": "My Custom Video",
    ...
  }
}
```

**Error Response (400 - Missing Fields):**
```json
{
  "success": false,
  "message": "Missing required fields: id, title, description, thumbnail, videoUrl"
}
```

**Error Response (400 - Duplicate ID):**
```json
{
  "success": false,
  "message": "Video with ID 'custom-1' already exists"
}
```

### 5. Update Video (Admin)

**PUT** `http://localhost:5000/api/videos/:id`

**Example:** `http://localhost:5000/api/videos/trend-1`

**Headers:**
```
Content-Type: application/json
```

**Body (partial update):**
```json
{
  "title": "Updated Mountain Expedition",
  "views": "3.0M"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video updated successfully",
  "data": {
    "id": "trend-1",
    "title": "Updated Mountain Expedition",
    "views": "3.0M",
    ...
  }
}
```

### 6. Delete Video (Admin)

**DELETE** `http://localhost:5000/api/videos/:id`

**Example:** `http://localhost:5000/api/videos/custom-1`

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully",
  "data": {
    "id": "custom-1",
    "title": "My Custom Video",
    ...
  }
}
```

## Testing with curl

### Get all videos
```bash
curl http://localhost:5000/api/videos
```

### Get specific video
```bash
curl http://localhost:5000/api/videos/trend-1
```

### Add new video
```bash
curl -X POST http://localhost:5000/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-1",
    "title": "Test Video",
    "description": "A test video",
    "thumbnail": "https://example.com/thumb.jpg",
    "videoUrl": "https://example.com/video.mp4",
    "duration": "5:00",
    "views": "1K",
    "category": "Test"
  }'
```

### Update video
```bash
curl -X PUT http://localhost:5000/api/videos/test-1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Video",
    "views": "2K"
  }'
```

### Delete video
```bash
curl -X DELETE http://localhost:5000/api/videos/test-1
```

## Testing with Postman/Thunder Client

1. Import the collection or create requests manually
2. Set base URL: `http://localhost:5000`
3. Test each endpoint with appropriate methods and body data

## Testing in Browser

Open these URLs in your browser:

- **All videos:** http://localhost:5000/api/videos
- **Single video:** http://localhost:5000/api/videos/trend-1
- **Health check:** http://localhost:5000/api/health

## CORS Configuration

The server is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)

If you need to add more origins, edit `server/src/server.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
```

## Common Issues

### Issue: Cannot read videos.json
**Solution:** Ensure `server/data/videos.json` exists and contains valid JSON.

### Issue: CORS error in browser
**Solution:** Verify the frontend is running on port 5173, or update CORS configuration.

### Issue: Port 5000 already in use
**Solution:** Change PORT in `server/.env` or kill the process using port 5000.

## Data Persistence

All video data is stored in `server/data/videos.json`. Changes made via POST, PUT, or DELETE are immediately written to this file and will persist across server restarts.

## Next Steps

Once the API is working, you can:
1. Connect the React frontend to fetch from these endpoints
2. Replace mock data in the frontend with API calls
3. Add authentication for admin endpoints
4. Connect to MongoDB for real database storage


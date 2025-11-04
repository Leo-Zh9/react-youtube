# Frontend-Backend Integration Guide

## Overview

The React frontend now dynamically fetches video data from the Express backend API instead of using hardcoded mock data.

## API Service

### Location: `client/src/services/api.js`

This service module handles all API communication with the backend.

### Functions:

#### `getAllVideos()`
Fetches all videos from the backend.

```javascript
const videos = await getAllVideos();
// Returns: Array of video objects
```

#### `getVideoById(id)`
Fetches a single video by ID.

```javascript
const video = await getVideoById('trend-1');
// Returns: Single video object
```

#### `getRecommendedVideos(currentVideoId, limit)`
Fetches recommended videos excluding the current one.

```javascript
const recommended = await getRecommendedVideos('trend-1', 10);
// Returns: Array of up to 10 video objects
```

#### Admin Functions (Future Use):
- `addVideo(videoData)` - Add new video
- `updateVideo(id, videoData)` - Update existing video
- `deleteVideo(id)` - Delete video

## Components Updated

### 1. HomePage (`client/src/pages/HomePage.jsx`)

**Changes:**
- Added `useEffect` hook to fetch videos on component mount
- Added `loading` and `error` states
- Videos are now fetched from API instead of imported from mockData
- Organized videos by category dynamically based on ID prefixes
- Added error handling with retry functionality

**State Management:**
```javascript
const [videos, setVideos] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

**Data Flow:**
1. Component mounts
2. `useEffect` triggers API call to `/api/videos`
3. Videos stored in state
4. Videos organized by category (trending, new releases, etc.)
5. Filtered based on search query
6. Passed to Carousel components

**Loading States:**
- **Loading**: Animated spinner with "Loading videos..." message
- **Error**: Error message with retry button
- **No Data**: "No videos available" message
- **Success**: Displays video carousels

### 2. VideoPlayerPage (`client/src/pages/VideoPlayerPage.jsx`)

**Changes:**
- Fetches video data from API using video ID from URL params
- Fetches recommended videos simultaneously
- Added error handling for invalid video IDs
- Removed dependency on local mock data

**State Management:**
```javascript
const [video, setVideo] = useState(null);
const [recommendedVideos, setRecommendedVideos] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

**Data Flow:**
1. Component receives video ID from URL (`/watch/:id`)
2. `useEffect` triggers parallel API calls:
   - Fetch main video by ID
   - Fetch recommended videos
3. Data stored in state
4. Video player renders with fetched data

## Error Handling

### Network Errors
```javascript
try {
  const data = await getAllVideos();
  setVideos(data);
} catch (err) {
  console.error('Failed to fetch videos:', err);
  setError('Failed to load videos. Please try again later.');
}
```

### API Error Responses
The API service automatically handles HTTP errors:
- 404: Video not found
- 500: Server error
- Network failure: Connection refused

### User-Friendly Messages
- Loading: Spinner with descriptive text
- Error: Clear error message with retry option
- Empty: "No videos available" message

## Running the Integrated Application

### Step 1: Start the Backend Server

```bash
cd server
npm run dev
```

Server will run on: **http://localhost:5000**

### Step 2: Start the Frontend Client

```bash
cd client
npm run dev
```

Client will run on: **http://localhost:5173**

### Step 3: Test the Integration

1. **Open browser**: http://localhost:5173
2. **Verify homepage loads**: Should show loading spinner then video carousels
3. **Click a video**: Should navigate to video player page
4. **Check recommended videos**: Should load in sidebar
5. **Test search**: Filter videos in real-time

## Testing Checklist

### HomePage Tests
- [ ] Loading spinner appears on initial load
- [ ] Videos load and display in carousels
- [ ] Search functionality works
- [ ] Clicking video card navigates to player
- [ ] Error state shows if backend is down
- [ ] Retry button works after error

### VideoPlayerPage Tests
- [ ] Video loads and plays automatically
- [ ] Video metadata displays correctly
- [ ] Recommended videos load in sidebar
- [ ] Clicking recommended video loads new video
- [ ] Back button returns to homepage
- [ ] Error handling for invalid video IDs

### Network Tests
- [ ] Works when backend is running
- [ ] Shows error when backend is down
- [ ] Handles slow network gracefully
- [ ] CORS is properly configured

## Troubleshooting

### Issue: Videos not loading

**Possible Causes:**
1. Backend server not running
2. Backend running on wrong port
3. CORS not configured

**Solutions:**
```bash
# Check if backend is running
curl http://localhost:5000/api/videos

# Check CORS configuration in server/src/server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

### Issue: CORS errors in browser console

**Solution:**
Verify backend CORS settings allow `http://localhost:5173`

### Issue: Data not updating after backend changes

**Solution:**
1. Refresh the browser page
2. Clear browser cache
3. Restart backend server

## API Response Format

### Successful Response
```json
{
  "success": true,
  "count": 11,
  "data": [
    {
      "id": "trend-1",
      "title": "Mountain Expedition",
      "description": "...",
      "thumbnail": "...",
      "videoUrl": "...",
      "duration": "15:42",
      "views": "2.5M",
      "category": "Adventure",
      "year": "2024",
      "rating": "PG",
      "uploadDate": "2024-10-20"
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Performance Considerations

### Optimizations Implemented:
1. **useMemo** for filtered video lists
2. **Promise.all** for parallel API calls
3. **Error boundaries** for graceful failure
4. **Loading states** for better UX

### Future Improvements:
- [ ] Implement caching (localStorage or state management)
- [ ] Add pagination for large video lists
- [ ] Implement lazy loading for images
- [ ] Add retry logic with exponential backoff
- [ ] Implement service worker for offline support

## Next Steps

1. **Add Authentication**: Secure admin endpoints
2. **Implement Caching**: Reduce API calls
3. **Add MongoDB**: Replace JSON file storage
4. **WebSocket Support**: Real-time updates
5. **CDN Integration**: Faster media delivery


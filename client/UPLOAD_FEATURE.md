# Upload Feature Documentation

## Overview

The Upload feature allows users to add new videos to the MongoDB database through a user-friendly web interface. Videos are immediately visible on the homepage after successful upload.

## How to Use

### Accessing the Upload Page

1. **From Navbar**: Click "Upload" button in the navigation bar
2. **Direct URL**: Navigate to `http://localhost:5173/upload`

### Upload Form Fields

#### Required Fields (marked with *)
- **Title**: The video title (max relevance for search)
- **Video URL**: Direct link to the video file (MP4, WebM, etc.)

#### Optional Fields
- **Description**: Detailed description of the video content
- **Thumbnail URL**: Custom thumbnail image (uses default if empty)
- **Category**: Choose from predefined categories
- **Duration**: Video length (e.g., "12:34")
- **Rating**: Content rating (G, PG, PG-13, R)

### Upload Process

1. Fill in the required fields (Title and Video URL)
2. Optionally fill in additional fields
3. Click "Upload Video" button
4. Wait for upload confirmation
5. Automatically redirected to homepage
6. New video appears in the video list

## Features

### Form Validation

**Client-side validation:**
- Title cannot be empty
- Video URL must be a valid URL format
- Thumbnail URL (if provided) must be valid
- Real-time error messages under each field

**Example:**
```
❌ Title is required
❌ Please enter a valid URL
```

### Loading States

**During Upload:**
- Button shows spinning loader
- Text changes to "Uploading..."
- Form fields are disabled
- Cannot navigate away accidentally

**After Success:**
- Green checkmark appears
- "Uploaded!" confirmation
- Success message displays
- Auto-redirect after 1.5 seconds

### Success Notification

After successful upload, homepage shows:
```
✅ Video uploaded successfully!
   Your video is now live
```

Notification:
- Appears top-right corner
- Auto-dismisses after 5 seconds
- Manually closeable with X button

### Error Handling

**Network Errors:**
- Shows red error message
- Displays specific error details
- Allows retry without losing form data

**Validation Errors:**
- Inline error messages
- Red border on invalid fields
- Prevents submission until fixed

## Technical Details

### API Integration

**Endpoint:** `POST http://localhost:5000/api/videos`

**Request Format:**
```javascript
{
  id: "user-1699123456789",  // Auto-generated
  title: "My Video",
  description: "Video description",
  thumbnail: "https://...",
  url: "https://video-url.mp4",
  category: "Adventure",
  duration: "12:34",
  rating: "PG",
  views: "0",
  year: "2024",
  uploadDate: "2024-11-04"
}
```

**Response Format:**
```javascript
{
  success: true,
  message: "Video created successfully",
  data: { /* video object */ }
}
```

### Data Flow

```
User fills form → Validates input → POST to API → MongoDB insert
                                                       ↓
Homepage ← Redirect with success message ← API returns success
```

### Auto-Generated Fields

- **id**: `user-{timestamp}` (unique identifier)
- **views**: Starts at "0"
- **year**: Current year
- **uploadDate**: Current date (ISO format)
- **thumbnail**: Default image if not provided

### Categories Available

- Uncategorized
- Adventure
- Documentary
- Travel
- Nature
- Science
- Technology
- Food
- Music
- Sports
- Education
- Entertainment

### Rating Options

- **G** - General Audience
- **PG** - Parental Guidance
- **PG-13** - Parents Cautioned
- **R** - Restricted

## Component Structure

### UploadPage.jsx

**Location:** `client/src/pages/UploadPage.jsx`

**State Management:**
```javascript
const [formData, setFormData] = useState({ ... });
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [success, setSuccess] = useState(false);
const [validationErrors, setValidationErrors] = useState({});
```

**Key Functions:**
- `handleChange()` - Updates form fields
- `validateForm()` - Client-side validation
- `handleSubmit()` - Processes upload
- `handleCancel()` - Returns to homepage

### HomePage.jsx Integration

**Success Notification:**
```javascript
// Receives upload success via React Router state
const location = useLocation();
if (location.state?.uploadSuccess) {
  // Show success message
}
```

### Navbar.jsx Integration

**Upload Button:**
```javascript
<button onClick={() => navigate('/upload')}>
  Upload
</button>
```

## Styling

### Tailwind Classes Used

**Layout:**
- Dark theme: `bg-black`, `text-white`
- Responsive grid: `md:grid-cols-3`
- Spacing: `space-y-6`, `gap-4`

**Form Elements:**
- Input styling: `bg-gray-900`, `border-gray-700`
- Focus states: `focus:border-red-500`
- Disabled states: `disabled:bg-gray-700`

**Buttons:**
- Primary: `bg-red-600 hover:bg-red-700`
- Secondary: `bg-gray-800 hover:bg-gray-700`
- Loading spinner animation

**Notifications:**
- Success: `bg-green-900`, `border-green-500`
- Error: `bg-red-900`, `border-red-500`

## User Experience

### Success Flow
```
1. User clicks "Upload" in navbar
2. Fill in video details
3. Click "Upload Video"
4. See loading spinner
5. See success message
6. Redirect to homepage
7. See upload confirmation
8. New video visible in carousel
```

### Error Flow
```
1. User submits invalid data
2. See validation errors
3. Fix the errors
4. Resubmit
OR
1. Network error occurs
2. See error message
3. Click "Upload Video" to retry
```

## Testing

### Manual Testing Checklist

**Form Validation:**
- [ ] Cannot submit without title
- [ ] Cannot submit without video URL
- [ ] Invalid URLs show error
- [ ] Valid data submits successfully

**Upload Process:**
- [ ] Loading spinner appears
- [ ] Form disabled during upload
- [ ] Success message shows
- [ ] Redirect to homepage works
- [ ] Video appears on homepage

**Error Handling:**
- [ ] Network error shows message
- [ ] Can retry after error
- [ ] Form data preserved on error

**UI/UX:**
- [ ] Back button works
- [ ] Cancel confirms before leaving
- [ ] Navbar upload button works
- [ ] Responsive on mobile
- [ ] All fields accessible

### Test Video URLs

**Public Test Videos:**
```
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4
```

**Test Thumbnail URLs:**
```
https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop
https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop
```

## Security Considerations

### Current Implementation

✅ **Client-side validation** - Prevents basic invalid data
✅ **URL validation** - Ensures valid URL format
✅ **MongoDB schema validation** - Backend validates data

### Recommended Enhancements

🔒 **Add Authentication**
- Require user login before upload
- Track who uploaded each video

🔒 **Add File Upload**
- Upload actual video files to cloud storage
- Generate thumbnail automatically

🔒 **Add Moderation**
- Review queue for new uploads
- Admin approval before showing

🔒 **Add Rate Limiting**
- Prevent spam uploads
- Limit uploads per user/IP

## Troubleshooting

### Issue: Upload button does nothing

**Check:**
1. Backend server is running
2. MongoDB is connected
3. Browser console for errors

**Solution:**
```bash
cd server
npm run dev
```

### Issue: Video doesn't appear after upload

**Check:**
1. Upload was successful (check console)
2. Refresh homepage
3. Check MongoDB has the video

**Solution:**
```bash
mongosh
use react-youtube
db.videos.find().sort({createdAt: -1}).limit(1)
```

### Issue: Validation error on valid URL

**Check:**
- URL includes `http://` or `https://`
- No typos in URL
- URL is accessible

### Issue: Success redirect doesn't work

**Check:**
- React Router is properly configured
- No browser extensions blocking navigation

## Future Enhancements

### Priority 1
- [ ] File upload instead of URL
- [ ] Auto-generate thumbnails
- [ ] Video preview before upload
- [ ] User authentication

### Priority 2
- [ ] Drag-and-drop file upload
- [ ] Multiple file upload
- [ ] Upload progress bar
- [ ] Edit/delete uploaded videos

### Priority 3
- [ ] Video processing (transcoding)
- [ ] Multiple resolutions
- [ ] Subtitle upload
- [ ] Video analytics

## Related Files

```
client/
├── src/
│   ├── pages/
│   │   ├── UploadPage.jsx       # Main upload component
│   │   └── HomePage.jsx         # Shows upload success
│   ├── components/
│   │   └── Navbar.jsx           # Upload navigation button
│   ├── services/
│   │   └── api.js               # addVideo() function
│   └── App.jsx                  # /upload route
```

## API Documentation

See [API_TESTING.md](../server/API_TESTING.md) for complete API documentation.

**Relevant Endpoint:**
```
POST /api/videos
Content-Type: application/json

Body: {
  id: string (optional, auto-generated if not provided),
  title: string (required),
  url: string (required),
  description: string (optional),
  thumbnail: string (optional),
  category: string (optional),
  duration: string (optional),
  rating: string (optional)
}
```

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend server logs
3. Verify MongoDB connection
4. Review this documentation

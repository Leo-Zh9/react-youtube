# React YouTube - Netflix UI (Interview Assessment)

A full-stack application with YouTube functionality and Netflix-style UI, powered by MongoDB.

## Project Structure

- `/client` - React frontend with Vite (dynamically fetches from API)
- `/server` - Node.js Express backend with MongoDB database

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Quick Start

### 1. Install MongoDB

**Option A: Local MongoDB**
- Download from https://www.mongodb.com/try/download/community
- Install and start the service
- MongoDB will run on `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create cluster and get connection string
- See [server/MONGODB_SETUP.md](server/MONGODB_SETUP.md) for details

### 2. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Configure Environment

Create `server/.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/react-youtube
```

### 4. Seed the Database

```bash
cd server
npm run seed
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 6. Open in Browser

Visit: **http://localhost:5173**

## Features

### Netflix-Style UI ✨
- 🎬 Hero section with featured video banner
- 🎞️ Multiple horizontal scrollable carousels
- 🔍 Real-time search filtering
- 🎨 Dark theme with red accents (Netflix-inspired)
- 📱 Fully responsive design (mobile, tablet, desktop)
- ✨ Smooth hover animations and transitions
- 🎯 Video cards with play icons and metadata
- 📺 Full-featured video player with HTML5 controls

### Video Upload Feature 🎥 (NEW!)
- 📤 Upload videos directly through web interface
- 📝 Complete form with validation
- ✅ Real-time input validation
- 🎯 Auto-categorization options
- ⏱️ Duration and rating settings
- 🖼️ Custom thumbnail support
- ✨ Success notifications
- 🔄 Auto-refresh home page
- See [client/UPLOAD_FEATURE.md](client/UPLOAD_FEATURE.md) for details

### MongoDB Backend 🗄️
- 🔌 RESTful API with Express
- 📊 MongoDB database with Mongoose ODM
- 🔄 Full CRUD operations
- 🌐 CORS enabled for frontend
- ✅ Data validation with Mongoose schemas
- 🚀 Async/await for all database operations

### Frontend Integration 🔗
- 📡 Dynamic data fetching from MongoDB API
- ⏳ Loading states with spinners
- ❌ Error handling with retry functionality
- 🔄 Automatic state management
- 🎯 Real-time search and filtering

## Application Routes

- `/` - Home Page (video carousels)
- `/watch/:id` - Video Player Page
- `/upload` - Upload New Video *(NEW!)*

## API Endpoints

### Videos
- `GET /api/videos` - Get all videos from MongoDB
- `GET /api/videos/:id` - Get single video by ID
- `POST /api/videos` - Create new video *(Upload feature)*
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

### Health
- `GET /api/health` - Health check endpoint

See [server/API_TESTING.md](server/API_TESTING.md) for detailed API documentation.

## Testing the Upload Feature

### Step 1: Start Backend & Frontend

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

### Step 2: Navigate to Upload Page

Click "Upload" in the navbar or go to: http://localhost:5173/upload

### Step 3: Fill the Form

**Use these test values:**

```
Title: My Test Video
Description: This is a test upload
Video URL: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
Thumbnail: https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop
Duration: 9:56
Category: Test
Rating: G
```

### Step 4: Submit

- Click "Upload Video"
- Wait for success message
- Auto-redirects to home page
- Verify new video appears

### Testing Checklist

- [ ] Upload page loads
- [ ] Form validation works
- [ ] Can submit with required fields only
- [ ] Loading spinner shows during upload
- [ ] Success message displays
- [ ] Redirects to home after success
- [ ] New video appears on home page
- [ ] Can play uploaded video
- [ ] Cancel button works

## Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Swiper.js (carousels)
- Fetch API (HTTP requests)

### Backend
- Node.js
- Express
- **MongoDB** (Database)
- **Mongoose** (ODM)
- CORS
- dotenv

## MongoDB Schema

```javascript
{
  id: String (unique, required),
  title: String (required),
  url: String (required),
  description: String,
  thumbnail: String,
  duration: String,
  views: String,
  category: String,
  year: String,
  rating: String,
  uploadDate: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Architecture

### Data Flow
```
React → API Service → Express → Mongoose → MongoDB
                    ← JSON     ← Model   ←
```

### Upload Flow
```
Upload Form → Validate → POST /api/videos → MongoDB → Home Page
              ↓                              ↓          ↓
         Show errors                    Save video  Display video
```

## File Structure

```
client/
├── src/
│   ├── services/
│   │   └── api.js              # API service
│   ├── pages/
│   │   ├── HomePage.jsx        # Home with carousels
│   │   ├── VideoPlayerPage.jsx # Video player
│   │   └── UploadPage.jsx      # Upload form (NEW)
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation with Upload link
│   │   ├── HeroSection.jsx
│   │   ├── Carousel.jsx
│   │   └── VideoCard.jsx
│   └── App.jsx                 # Router with /upload route
├── UPLOAD_FEATURE.md           # Upload documentation (NEW)
└── INTEGRATION.md              # Integration guide

server/
├── src/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── models/
│   │   └── Video.js            # Mongoose schema
│   ├── routes/
│   │   └── videoRoutes.js      # API routes (includes POST)
│   ├── scripts/
│   │   └── seedDatabase.js     # Database seeder
│   └── server.js               # Express app
├── MONGODB_SETUP.md            # MongoDB setup guide
├── DEBUGGING_GUIDE.md          # Troubleshooting
└── START_SERVER.md             # Quick start guide
```

## Development Scripts

### Server
```bash
npm run dev    # Start server with nodemon
npm start      # Start server (production)
npm run seed   # Seed database with sample data
```

### Client
```bash
npm run dev    # Start Vite dev server
npm run build  # Build for production
```

## Troubleshooting

### Upload not working?

1. **Check backend is running:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5000/api/health"
   ```

2. **Check MongoDB connection:**
   ```bash
   mongosh react-youtube --eval "db.videos.countDocuments()"
   ```

3. **Check browser console** for errors

4. **Verify CORS** - Backend should allow `http://localhost:5173`

### Videos not loading?

1. Ensure MongoDB is running and seeded
2. Check server console for MongoDB connection message
3. Test API directly: `http://localhost:5000/api/videos`

### Form validation errors?

1. Title and Video URL are required
2. URLs must be valid format (http:// or https://)
3. Check browser console for validation errors

## Documentation

- [MongoDB Setup Guide](server/MONGODB_SETUP.md) - Complete MongoDB installation
- [API Testing Guide](server/API_TESTING.md) - API endpoint documentation
- [Integration Guide](client/INTEGRATION.md) - Frontend-backend integration
- [Upload Feature Guide](client/UPLOAD_FEATURE.md) - Upload functionality *(NEW!)*
- [Debugging Guide](server/DEBUGGING_GUIDE.md) - Troubleshooting
- [Start Server Guide](server/START_SERVER.md) - Quick start instructions

## What's New in Step 6

✅ **Upload Page Implementation**
- Complete upload form with validation
- Real-time error display
- Success/error notifications
- Auto-redirect after upload
- Loading states

✅ **Navigation Updates**
- Added Upload link to navbar
- React Router navigation
- New `/upload` route

✅ **API Integration**
- POST request to create videos
- Error handling
- Success feedback
- Immediate home page update

## Future Enhancements

- [ ] User authentication with JWT
- [ ] File upload from local machine
- [ ] Video upload to cloud storage (AWS S3/Cloudinary)
- [ ] Thumbnail auto-generation
- [ ] Video transcoding
- [ ] Comments and ratings system
- [ ] User playlists and watch history
- [ ] Advanced search with filters
- [ ] Admin dashboard
- [ ] Upload progress bar
- [ ] Drag & drop upload

## License

ISC

---

## Complete Feature List

### Implemented ✅
- Netflix-style homepage with carousels
- Video player with HTML5 controls
- Search functionality
- MongoDB database integration
- RESTful API
- **Video upload feature** *(Step 6)*
- Responsive design
- Error handling
- Loading states

### In Progress 🚧
- User authentication
- Video upload to cloud storage

### Planned 📋
- Comments system
- User playlists
- Advanced search
- Admin panel

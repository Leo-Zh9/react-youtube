# React YouTube - Netflix UI (Interview Assessment)

A full-stack application with YouTube functionality and Netflix-style UI, now powered by MongoDB.

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
- See [MONGODB_SETUP.md](server/MONGODB_SETUP.md) for details

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

For MongoDB Atlas, use your connection string:
```env
MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/react-youtube
```

### 4. Seed the Database

```bash
cd server
npm run seed
```

This loads 11 sample videos into MongoDB.

### 5. Start the Backend Server

```bash
cd server
npm run dev
```

Server runs on: **http://localhost:5000**

You should see:
```
✅ MongoDB Connected: localhost
📂 Database: react-youtube
🚀 Server is running on http://localhost:5000
```

### 6. Start the Frontend Client

In a new terminal:

```bash
cd client
npm run dev
```

Client runs on: **http://localhost:5173**

### 7. Open in Browser

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

## API Endpoints

### Videos
- `GET /api/videos` - Get all videos from MongoDB
- `GET /api/videos/:id` - Get single video by ID
- `POST /api/videos` - Create new video in MongoDB
- `PUT /api/videos/:id` - Update video in MongoDB
- `DELETE /api/videos/:id` - Delete video from MongoDB

### Health
- `GET /api/health` - Health check endpoint

See [server/API_TESTING.md](server/API_TESTING.md) for detailed API documentation.

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

## Testing the Integration

### 1. Verify MongoDB Connection

```bash
mongosh
use react-youtube
db.videos.find()
```

### 2. Test Backend API

```powershell
# Get all videos from MongoDB
Invoke-RestMethod -Uri "http://localhost:5000/api/videos"

# Get specific video
Invoke-RestMethod -Uri "http://localhost:5000/api/videos/trend-1"
```

### 3. Test Frontend

1. Ensure MongoDB and backend are running
2. Open http://localhost:5173
3. Verify videos load from MongoDB
4. Click a video to test video player
5. Test search functionality
6. Check recommended videos sidebar

### Testing Checklist

**MongoDB:**
- [ ] MongoDB is running (local or Atlas)
- [ ] Database is seeded with sample data
- [ ] Can connect using mongosh or Compass

**Backend:**
- [ ] Server connects to MongoDB successfully
- [ ] API endpoints return data from MongoDB
- [ ] CRUD operations work correctly

**Frontend:**
- [ ] Videos load from MongoDB API
- [ ] Search filters videos
- [ ] Video player works
- [ ] Error handling displays properly

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

## Architecture

### Data Flow
```
React → API Service → Express → Mongoose → MongoDB
                    ← JSON     ← Model   ←
```

### File Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── models/
│   │   └── Video.js            # Mongoose schema (NEW)
│   ├── routes/
│   │   └── videoRoutes.js      # API routes (MongoDB)
│   ├── scripts/
│   │   └── seedDatabase.js     # Database seeder (NEW)
│   └── server.js               # Express app
├── data/
│   └── videos.json             # Used for seeding
├── MONGODB_SETUP.md            # MongoDB setup guide
└── package.json

client/
├── src/
│   ├── services/
│   │   └── api.js              # API service
│   ├── pages/
│   │   ├── HomePage.jsx        # Fetches from MongoDB API
│   │   └── VideoPlayerPage.jsx # Fetches from MongoDB API
│   └── components/
│       ├── Navbar.jsx
│       ├── HeroSection.jsx
│       ├── Carousel.jsx
│       └── VideoCard.jsx
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

### MongoDB not connecting?

1. **Check MongoDB is running:**
   ```bash
   mongosh --eval "db.version()"
   ```

2. **Verify connection string in `.env`**

3. **For Atlas:** Check IP whitelist and credentials

### Videos not loading?

1. **Ensure MongoDB is running and seeded:**
   ```bash
   cd server
   npm run seed
   ```

2. **Check server console for MongoDB connection message**

3. **Test API directly:**
   ```bash
   Invoke-RestMethod -Uri "http://localhost:5000/api/videos"
   ```

### CORS errors?

Update `server/src/server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

## Documentation

- [MongoDB Setup Guide](server/MONGODB_SETUP.md) - Complete MongoDB installation and configuration
- [API Testing Guide](server/API_TESTING.md) - API endpoint documentation
- [Integration Guide](client/INTEGRATION.md) - Frontend-backend integration

## What's New in Step 5

✅ **MongoDB Integration**
- Mongoose models and schemas
- Database connection configuration
- MongoDB-powered API routes
- Database seeding script

✅ **Improved Backend**
- Async/await database operations
- Mongoose validation
- Virtual fields for compatibility
- Better error handling

✅ **No Frontend Changes**
- Frontend works without modification
- Same API responses as before
- Seamless migration from JSON to MongoDB

## Migration Notes

### From JSON File to MongoDB

**Before (Step 4):**
- Data stored in `server/data/videos.json`
- File read/write operations
- No data validation
- Limited scalability

**After (Step 5):**
- Data stored in MongoDB database
- Mongoose ODM with validation
- Schema enforcement
- Production-ready scalability
- Advanced querying capabilities

**Frontend Impact:** None! The API responses are identical.

## Future Enhancements

- [ ] User authentication with JWT
- [ ] Video upload to cloud storage
- [ ] Comments and ratings system
- [ ] User playlists and watch history
- [ ] Advanced search with MongoDB text indexes
- [ ] Video recommendations algorithm
- [ ] Analytics and view tracking
- [ ] Admin dashboard

## License

ISC

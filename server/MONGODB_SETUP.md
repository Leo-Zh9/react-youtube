# MongoDB Setup Guide

## Prerequisites

- MongoDB installed locally OR
- MongoDB Atlas account (cloud database)

## Option 1: Local MongoDB

### Install MongoDB

**Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer
3. Install as a Windows Service (recommended)
4. MongoDB will run automatically on `mongodb://localhost:27017`

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh

# Or check the connection
mongosh --eval "db.version()"
```

## Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Add your IP address to the whitelist (or use `0.0.0.0/0` for development)
5. Create a database user
6. Get your connection string
7. Update `.env` file with the connection string

Example connection string:
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/react-youtube?retryWrites=true&w=majority
```

## Configuration

### 1. Create `.env` file

Copy `env.example` to `.env`:
```bash
cd server
cp env.example .env
```

### 2. Update MongoDB URI

Edit `server/.env`:

**For Local MongoDB:**
```env
MONGO_URI=mongodb://localhost:27017/react-youtube
```

**For MongoDB Atlas:**
```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/react-youtube?retryWrites=true&w=majority
```

## Database Seeding

Seed the database with sample video data:

```bash
cd server
npm run seed
```

This will:
1. Connect to MongoDB
2. Clear existing videos
3. Load videos from `data/videos.json`
4. Insert them into MongoDB

Expected output:
```
✅ Connected to MongoDB
🗑️  Cleared existing videos
✅ Seeded 11 videos to MongoDB
   1. featured-1 - Epic Adventure Awaits
   2. trend-1 - Mountain Expedition
   ...
🎉 Database seeding completed successfully!
```

## Starting the Server

```bash
cd server
npm run dev
```

Expected output:
```
🚀 Server is running on http://localhost:5000
📺 API Endpoints:
   - GET    http://localhost:5000/api/videos
   - GET    http://localhost:5000/api/videos/:id
   - POST   http://localhost:5000/api/videos
   - PUT    http://localhost:5000/api/videos/:id
   - DELETE http://localhost:5000/api/videos/:id

🗄️  Database: MongoDB
✨ CORS enabled for http://localhost:5173

✅ MongoDB Connected: localhost
📂 Database: react-youtube
```

## Testing MongoDB Integration

### 1. Check Database Connection

```bash
mongosh
use react-youtube
db.videos.find().pretty()
```

### 2. Test API Endpoints

**Get all videos:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/videos"
```

**Get single video:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/videos/trend-1"
```

**Create new video:**
```powershell
$body = @{
    id = "test-1"
    title = "Test Video"
    description = "A test video"
    thumbnail = "https://example.com/thumb.jpg"
    url = "https://example.com/video.mp4"
    category = "Test"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/videos" -Method Post -Body $body -ContentType "application/json"
```

## MongoDB Schema

### Video Model

```javascript
{
  id: String (unique, required) // Custom ID like 'trend-1'
  title: String (required)
  url: String (required)
  description: String
  thumbnail: String
  duration: String (default: '0:00')
  views: String (default: '0')
  category: String (default: 'Uncategorized')
  year: String
  rating: String (enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'])
  uploadDate: String (ISO date)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

### Virtual Field

- `videoUrl` - Virtual field that returns `url` for frontend compatibility

## Troubleshooting

### Error: "MongooseError: Operation failed"

**Solution:** Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

### Error: "Authentication failed"

**Solution:** Check your MongoDB Atlas credentials and IP whitelist.

### Error: "Connection refused"

**Solution:** 
1. Verify MongoDB is running
2. Check the connection string in `.env`
3. Ensure port 27017 is not blocked

### Server starts but "MongoDB Connection Error"

**Solution:** The server will run without MongoDB, but API calls will fail. Fix the MongoDB connection.

## MongoDB Compass (GUI Tool)

For a visual interface to manage your database:

1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect using your connection string
3. View and manage your data visually

## Database Management

### View all videos
```bash
mongosh
use react-youtube
db.videos.find()
```

### Count videos
```bash
db.videos.countDocuments()
```

### Delete all videos
```bash
db.videos.deleteMany({})
```

### Find specific video
```bash
db.videos.findOne({ id: "trend-1" })
```

### Update video
```bash
db.videos.updateOne(
  { id: "trend-1" },
  { $set: { views: "3.0M" } }
)
```

## Next Steps

1. ✅ MongoDB installed and running
2. ✅ Database seeded with sample data
3. ✅ Server connected to MongoDB
4. ✅ API endpoints working with MongoDB
5. 🚀 Frontend automatically works with MongoDB backend!

## Migration from JSON to MongoDB

The application now uses MongoDB instead of `videos.json`:

- **Before:** Data stored in `server/data/videos.json`
- **After:** Data stored in MongoDB database
- **Frontend:** No changes needed! The API responses are identical
- **Benefits:** 
  - Better performance
  - Advanced querying
  - Scalability
  - Data relationships
  - Transactions support


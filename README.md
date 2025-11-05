# ReactFlix - YouTube Clone with Netflix UI

A full-stack video streaming application built with React, Node.js, Express, MongoDB, and AWS S3. Features include video upload, authentication, comments, likes, playlists, search, and filtering.

## 🚀 Features

### Frontend
- **Netflix-inspired UI** with dark theme
- **Video Player** with recommended videos
- **Search & Filters** - Full-text search, category/year filtering, sorting
- **Authentication** - JWT-based auth with protected routes
- **Playlists** - Create and manage video playlists
- **Comments** - Add, edit, delete comments with pagination
- **Likes** - Like/unlike videos with optimistic UI updates
- **Social Sharing** - Native share or clipboard fallback
- **Responsive Design** - Works on all screen sizes
- **Accessibility** - Keyboard navigation, focus states, ARIA labels
- **Toast Notifications** - Global toast system for feedback
- **Error Boundaries** - Graceful error handling
- **Loading Skeletons** - Better UX during data fetching

### Backend
- **RESTful API** - Clean, consistent API design
- **MongoDB** - NoSQL database with Mongoose ODM
- **AWS S3** - Cloud storage for video files
- **JWT Authentication** - Secure token-based auth
- **Text Search** - MongoDB full-text search with indexing
- **Rate Limiting** - Protect against abuse
- **Request Validation** - Input validation with express-validator
- **Security** - Helmet middleware for HTTP headers
- **Error Handling** - Centralized error handler
- **Logging** - Morgan logging for requests

## 📋 Prerequisites

- **Node.js** (v16+ recommended)
- **MongoDB** (local or Atlas)
- **AWS Account** with S3 bucket configured
- **npm** or **yarn**

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd react-youtube
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/react-youtube
JWT_SECRET=your-super-secret-jwt-key-here

AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

### 4. AWS S3 Setup

1. Create an S3 bucket in AWS Console
2. Configure bucket policy for public read access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

3. Disable "Block all public access" for the bucket
4. Create IAM user with S3 permissions and get access keys

### 5. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com

# Start MongoDB
mongod --dbpath /path/to/data
```

**Option B: MongoDB Atlas** (recommended)
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## 🚀 Running the Application

### Development Mode

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

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

### Production Mode

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Video Endpoints

#### Get All Videos
```http
GET /api/videos?page=1&limit=20&sort=createdAt
```

#### Get Single Video
```http
GET /api/videos/:id
```

#### Search Videos
```http
GET /api/videos/search?q=mountain&category=Adventure&year=2024&sort=views&page=1&limit=20
```

#### Create Video (Protected)
```http
POST /api/videos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Video",
  "url": "https://s3.amazonaws.com/...",
  "thumbnail": "https://s3.amazonaws.com/...",
  "description": "Video description",
  "category": "Adventure",
  "duration": "15:42",
  "rating": "PG"
}
```

#### Increment View Count
```http
PATCH /api/videos/:id/view
```

#### Like/Unlike Video (Protected)
```http
POST /api/videos/:id/like
Authorization: Bearer <token>
```

#### Get Likes Info
```http
GET /api/videos/:id/likes
Authorization: Bearer <token> (optional)
```

### Comment Endpoints

#### Get Comments
```http
GET /api/videos/:videoId/comments?page=1&limit=10
```

#### Add Comment (Protected)
```http
POST /api/videos/:videoId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Great video!"
}
```

#### Delete Comment (Protected)
```http
DELETE /api/comments/:commentId
Authorization: Bearer <token>
```

### Playlist Endpoints (All Protected)

#### Get User Playlists
```http
GET /api/playlists
Authorization: Bearer <token>
```

#### Create Playlist
```http
POST /api/playlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Favorites"
}
```

#### Add Video to Playlist
```http
POST /api/playlists/:playlistId/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "videoId": "trend-1"
}
```

#### Remove Video from Playlist
```http
POST /api/playlists/:playlistId/remove
Authorization: Bearer <token>
Content-Type: application/json

{
  "videoId": "trend-1"
}
```

#### Delete Playlist
```http
DELETE /api/playlists/:playlistId
Authorization: Bearer <token>
```

### Upload Endpoint (Protected)

#### Upload File to S3
```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <video or image file>
}
```

## 🔒 Security Features

- **Helmet** - Secure HTTP headers
- **Rate Limiting** - Prevent abuse
  - General API: 100 req/15min
  - Auth: 5 req/15min
  - Comments: 10 req/5min
  - Upload: 3 req/hour
  - Search: 30 req/min
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Express-validator for all inputs
- **Error Handling** - Safe error messages in production
- **CORS** - Configured for frontend origin

## 📁 Project Structure

```
react-youtube/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── hooks/         # Custom React hooks
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Backend (Node + Express)
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # Express routes
│   │   ├── middleware/    # Custom middleware
│   │   └── server.js      # Entry point
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🧪 Environment Variables

### Server (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` / `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/react-youtube` |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `AWS_ACCESS_KEY_ID` | AWS access key | From AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | From AWS IAM |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_S3_BUCKET` | S3 bucket name | `my-bucket` |

## 📝 Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Frontend Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Check if MongoDB is running: `mongod`
- Verify `MONGODB_URI` in `.env`
- Check firewall settings

### AWS S3 Upload Errors
- Verify AWS credentials in `.env`
- Check bucket permissions
- Ensure bucket policy allows uploads
- Verify ACL settings disabled

### CORS Errors
- Check `CORS_ORIGIN` matches frontend URL
- Verify credentials: true in both frontend and backend

### Port Already in Use
```bash
# Find process using port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
```

## 🚧 Future Enhancements

- [ ] Video streaming with HLS
- [ ] Video transcoding
- [ ] Real-time notifications
- [ ] Live streaming
- [ ] Video recommendations AI
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] PWA support
- [ ] Multi-language support
- [ ] Dark/light theme toggle

## 📄 License

MIT License - feel free to use this project for learning or production.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Built with ❤️ using React, Node.js, MongoDB, and AWS**

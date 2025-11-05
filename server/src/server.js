import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables FIRST before any other imports
dotenv.config();

// Now import modules that depend on environment variables
import connectDB from './config/database.js';
import { initializeS3 } from './config/aws.js';
import videoRoutes from './routes/videoRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize AWS S3 configuration
initializeS3();

// Connect to MongoDB (non-blocking)
connectDB().catch(err => {
  console.log('⚠️  MongoDB connection failed, but server will continue running');
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Basic health check route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'React YouTube API Server',
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'MongoDB',
    endpoints: {
      videos: '/api/videos',
      health: '/api/health',
    },
  });
});

// API routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'MongoDB',
  });
});

// Auth routes - User authentication
app.use('/api/auth', authRoutes);

// Video routes - MongoDB powered
app.use('/api/videos', videoRoutes);

// Upload routes - S3 file upload (Protected)
app.use('/api/upload', uploadRoutes);

// Comment routes - Comments on videos
app.use('/api', commentRoutes);

// Playlist routes - User playlists (Protected)
app.use('/api/playlists', playlistRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📺 API Endpoints:`);
  console.log(`   - GET    http://localhost:${PORT}/api/videos`);
  console.log(`   - GET    http://localhost:${PORT}/api/videos/:id`);
  console.log(`   - POST   http://localhost:${PORT}/api/videos`);
  console.log(`   - PUT    http://localhost:${PORT}/api/videos/:id`);
  console.log(`   - DELETE http://localhost:${PORT}/api/videos/:id`);
  console.log(`\n🗄️  Database: MongoDB`);
  console.log(`✨ CORS enabled for http://localhost:5173\n`);
});

export default app;

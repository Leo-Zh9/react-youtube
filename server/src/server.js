import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

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
import searchRoutes from './routes/searchRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize AWS S3 configuration
initializeS3();

// Connect to MongoDB (non-blocking)
connectDB().catch(err => {
  console.log('⚠️  MongoDB connection failed, but server will continue running');
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      mediaSrc: ["'self'", 'https:', 'http:'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS middleware - Allow frontend from environment variable
const allowedOrigins = [
  'http://localhost:5173',  // Local Vite dev server
  'http://localhost:3000',  // Alternative local port
  process.env.FRONTEND_URL, // Production frontend URL (Vercel)
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General rate limiting for all API routes
app.use('/api/', generalLimiter);

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

// Search routes - Search and filter videos (MUST be before video routes)
app.use('/api/videos/search', searchRoutes);

// Video routes - MongoDB powered
app.use('/api/videos', videoRoutes);

// Upload routes - S3 file upload (Protected)
app.use('/api/upload', uploadRoutes);

// Comment routes - Comments on videos
app.use('/api', commentRoutes);

// Playlist routes - User playlists (Protected)
app.use('/api/playlists', playlistRoutes);

// Stats routes - User analytics (Protected)
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Centralized error handler (must be last)
app.use(errorHandler);

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

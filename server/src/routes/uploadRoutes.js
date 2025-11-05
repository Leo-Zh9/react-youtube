import express from 'express';
import { getUploadMiddleware, isS3Configured } from '../config/aws.js';
import Video from '../models/Video.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/upload - Upload video file to S3 and save metadata to MongoDB (Protected)
router.post('/', authenticateToken, async (req, res) => {
  // Check if S3 is configured
  if (!isS3Configured()) {
    return res.status(503).json({
      success: false,
      message: 'AWS S3 is not configured. Please configure AWS credentials in the backend.',
    });
  }

  // Get upload middleware
  const upload = getUploadMiddleware();
  
  if (!upload) {
    return res.status(503).json({
      success: false,
      message: 'File upload not available',
    });
  }

  // Apply multer middleware
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ])(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
      });
    }
    // Handle the upload result
    try {
      // Check if video file was uploaded
      if (!req.files || !req.files.video) {
        return res.status(400).json({
          success: false,
          message: 'No video file uploaded',
        });
      }

      // Get uploaded file information
      const videoFile = req.files.video[0];
      const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

      // Get S3 URLs
      const videoUrl = videoFile.location;
      
      // Determine thumbnail URL
      let thumbnailUrl;
      if (thumbnailFile) {
        // Use uploaded thumbnail
        thumbnailUrl = thumbnailFile.location;
        console.log('📷 Using uploaded thumbnail');
      } else {
        // Generate thumbnail from first frame of video
        console.log('📷 No custom thumbnail provided, generating from video...');
        try {
          const { generateThumbnailFromVideo } = await import('../utils/videoUtils.js');
          const videoId = `thumb-${Date.now()}`;
          thumbnailUrl = await generateThumbnailFromVideo(videoUrl, videoId);
          console.log('✅ Generated thumbnail from video first frame');
        } catch (error) {
          console.error('⚠️  Failed to generate thumbnail:', error.message);
          // Fall back to placeholder
          thumbnailUrl = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop&q=80';
          console.log('📷 Using default placeholder thumbnail');
        }
      }

      // Extract metadata from request body
      const {
        title,
        description,
        category,
        duration,
        rating,
      } = req.body;

      // Validate required fields
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Title is required',
        });
      }

      // Generate unique ID
      const videoId = `user-${Date.now()}`;

      // Create video document with owner
      const videoData = {
        id: videoId,
        title: title.trim(),
        description: description?.trim() || '',
        thumbnail: thumbnailUrl,
        url: videoUrl,
        category: category || 'Uncategorized',
        duration: duration || '0:00',
        rating: rating || 'G',
        views: '0',
        year: new Date().getFullYear().toString(),
        uploadDate: new Date().toISOString().split('T')[0],
        owner: req.user.userId, // Set owner from authenticated user
      };

      // Save to MongoDB
      const video = await Video.create(videoData);

      console.log(`✅ Video uploaded to S3 by ${req.user.email}: ${title}`);

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully',
        video: {
          _id: video._id,
          id: video.id,
          title: video.title,
          description: video.description,
          url: video.url,
          thumbnail: video.thumbnail,
          category: video.category,
          duration: video.duration,
          rating: video.rating,
          views: video.views,
          year: video.year,
          uploadDate: video.uploadDate,
        },
      });
    } catch (error) {
      console.error('❌ Upload error:', error);

      // Handle specific errors
      if (error.message === 'Only video files are allowed!') {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Please upload a video file.',
        });
      }

      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 500MB.',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error uploading video',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });
});

// GET /api/upload/status - Check S3 upload configuration
router.get('/status', (req, res) => {
  const configured = isS3Configured();

  res.json({
    success: true,
    configured: configured,
    region: process.env.AWS_REGION?.trim() || 'not set',
    bucket: process.env.S3_BUCKET_NAME?.trim() || 'not set',
  });
});

export default router;


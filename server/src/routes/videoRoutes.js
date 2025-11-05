import express from 'express';
import Video from '../models/Video.js';
import Like from '../models/Like.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/videos - Get all videos with sorting and pagination
router.get('/', async (req, res) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const sortParam = req.query.sort || 'createdAt';
    
    // Determine sort field and order
    let sortField = 'createdAt';
    let sortOrder = -1; // descending by default
    
    if (sortParam === 'views') {
      sortField = 'views';
      sortOrder = -1; // most views first
    } else if (sortParam === 'createdAt') {
      sortField = 'createdAt';
      sortOrder = -1; // newest first
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await Video.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);
    
    // Fetch videos with sorting and pagination
    const videos = await Video.find()
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: totalCount,
      data: videos,
      page: page,
      totalPages: totalPages,
      limit: limit,
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos',
      error: error.message,
    });
  }
});

// GET /api/videos/new - Get newest videos (most recent uploads)
router.get('/new', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // Fetch newest videos sorted by createdAt descending
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    console.error('Error fetching new videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching new videos',
      error: error.message,
    });
  }
});

// POST /api/videos/:id/like - Toggle like on a video (Protected)
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find video
    let video = await Video.findOne({ id });
    if (!video && id.match(/^[0-9a-fA-F]{24}$/)) {
      video = await Video.findById(id);
    }

    if (!video) {
      return res.status(404).json({
        success: false,
        message: `Video with ID '${id}' not found`,
      });
    }

    // Check if user already liked this video
    const existingLike = await Like.findOne({
      user: userId,
      videoId: video.id,
    });

    let liked = false;
    let likesCount = video.likesCount || 0;

    if (existingLike) {
      // Unlike: Remove like and decrement count
      await Like.deleteOne({ _id: existingLike._id });
      likesCount = Math.max(0, likesCount - 1);
      liked = false;
      
      console.log(`👎 User ${req.user.email} unliked: ${video.title}`);
    } else {
      // Like: Create like and increment count
      await Like.create({
        user: userId,
        videoId: video.id,
      });
      likesCount += 1;
      liked = true;
      
      console.log(`👍 User ${req.user.email} liked: ${video.title}`);
    }

    // Update video likes count
    const updatedVideo = await Video.findOneAndUpdate(
      { _id: video._id },
      { $set: { likesCount, updatedAt: Date.now() } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      liked,
      likesCount,
      video: updatedVideo,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Like status conflict. Please try again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating like status',
      error: error.message,
    });
  }
});

// GET /api/videos/:id/likes - Get likes count and current user's like status
router.get('/:id/likes', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find video
    let video = await Video.findOne({ id });
    if (!video && id.match(/^[0-9a-fA-F]{24}$/)) {
      video = await Video.findById(id);
    }

    if (!video) {
      return res.status(404).json({
        success: false,
        message: `Video with ID '${id}' not found`,
      });
    }

    const likesCount = video.likesCount || 0;
    let isLiked = false;

    // Check if current user liked this video (if authenticated)
    if (req.user) {
      const like = await Like.findOne({
        user: req.user.userId,
        videoId: video.id,
      });
      isLiked = !!like;
    }

    res.status(200).json({
      success: true,
      likesCount,
      isLiked,
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching likes',
      error: error.message,
    });
  }
});

// PATCH /api/videos/:id/view - Increment view count atomically
router.patch('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by custom id field first, then by MongoDB _id
    let video = await Video.findOne({ id });
    
    if (!video) {
      // Fallback to MongoDB _id if valid ObjectId
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        video = await Video.findById(id);
      }
    }

    if (!video) {
      return res.status(404).json({
        success: false,
        message: `Video with ID '${id}' not found`,
      });
    }

    // Parse current views (could be string like "1.2M" or number)
    let currentViews = 0;
    if (typeof video.views === 'string') {
      // If views is a string like "1.2M", convert to number
      const viewsStr = video.views.toLowerCase();
      if (viewsStr.includes('m')) {
        currentViews = Math.floor(parseFloat(viewsStr) * 1000000);
      } else if (viewsStr.includes('k')) {
        currentViews = Math.floor(parseFloat(viewsStr) * 1000);
      } else {
        currentViews = parseInt(viewsStr) || 0;
      }
    } else {
      currentViews = parseInt(video.views) || 0;
    }

    // Increment by 1
    currentViews += 1;

    // Format back to readable string
    let formattedViews;
    if (currentViews >= 1000000) {
      formattedViews = (currentViews / 1000000).toFixed(1) + 'M';
    } else if (currentViews >= 1000) {
      formattedViews = (currentViews / 1000).toFixed(1) + 'K';
    } else {
      formattedViews = currentViews.toString();
    }

    // Update video atomically using findOneAndUpdate
    const updatedVideo = await Video.findOneAndUpdate(
      { _id: video._id },
      { $set: { views: formattedViews, updatedAt: Date.now() } },
      { new: true }
    );

    console.log(`📊 View counted for video: ${video.title} (${formattedViews} views)`);

    res.status(200).json({
      success: true,
      views: formattedViews,
      video: updatedVideo,
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating view count',
      error: error.message,
    });
  }
});

// GET /api/videos/:id - Get single video by custom ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const video = await Video.findOne({ id: req.params.id });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: `Video with ID '${req.params.id}' not found`,
      });
    }

    // Include playlist info if user is authenticated
    let inPlaylists = [];
    if (req.user) {
      const Playlist = (await import('../models/Playlist.js')).default;
      const playlists = await Playlist.find({
        user: req.user.userId,
        videos: video.id,
      }).select('_id name');
      inPlaylists = playlists.map(p => ({ _id: p._id, name: p.name }));
    }

    res.status(200).json({
      success: true,
      data: {
        ...video.toObject(),
        inPlaylists,
      },
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video',
      error: error.message,
    });
  }
});

// POST /api/videos - Create a new video (Protected - requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      id,
      title,
      description,
      thumbnail,
      url,
      videoUrl, // Support both 'url' and 'videoUrl' for compatibility
      duration,
      views,
      category,
      year,
      rating,
      uploadDate,
    } = req.body;

    // Validate required fields
    if (!title || (!url && !videoUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title and url are required',
      });
    }

    // Check if video with same ID already exists
    if (id) {
      const existingVideo = await Video.findOne({ id });
      if (existingVideo) {
        return res.status(400).json({
          success: false,
          message: `Video with ID '${id}' already exists`,
        });
      }
    }

    // Create new video object
    const videoData = {
      id: id || `video-${Date.now()}`, // Generate ID if not provided
      title,
      description,
      thumbnail,
      url: url || videoUrl, // Use 'url' or fallback to 'videoUrl'
      duration,
      views,
      category,
      year,
      rating,
      uploadDate,
    };

    const video = await Video.create(videoData);

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video,
    });
  } catch (error) {
    console.error('Error creating video:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating video',
      error: error.message,
    });
  }
});

// PUT /api/videos/:id - Update a video
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Don't allow updating the custom ID
    delete updateData.id;
    
    // Support both 'url' and 'videoUrl'
    if (updateData.videoUrl && !updateData.url) {
      updateData.url = updateData.videoUrl;
    }

    const video = await Video.findOneAndUpdate(
      { id },
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: `Video with ID '${id}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: video,
    });
  } catch (error) {
    console.error('Error updating video:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating video',
      error: error.message,
    });
  }
});

// DELETE /api/videos/:id - Delete a video
router.delete('/:id', async (req, res) => {
  try {
    const video = await Video.findOneAndDelete({ id: req.params.id });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: `Video with ID '${req.params.id}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
      data: video,
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
      error: error.message,
    });
  }
});

export default router;

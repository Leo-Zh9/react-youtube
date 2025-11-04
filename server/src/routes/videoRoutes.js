import express from 'express';
import Video from '../models/Video.js';

const router = express.Router();

// GET /api/videos - Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
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

// GET /api/videos/:id - Get single video by custom ID
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findOne({ id: req.params.id });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: `Video with ID '${req.params.id}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: video,
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

// POST /api/videos - Create a new video
router.post('/', async (req, res) => {
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

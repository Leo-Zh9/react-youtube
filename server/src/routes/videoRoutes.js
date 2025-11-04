import express from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();

// Get current directory (ES modules compatibility)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const videosFilePath = join(__dirname, '../../data/videos.json');

// Helper function to read videos from JSON file
const readVideos = () => {
  try {
    const data = readFileSync(videosFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading videos.json:', error);
    return [];
  }
};

// Helper function to write videos to JSON file
const writeVideos = (videos) => {
  try {
    writeFileSync(videosFilePath, JSON.stringify(videos, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to videos.json:', error);
    return false;
  }
};

// GET /api/videos - Get all videos
router.get('/', (req, res) => {
  try {
    const videos = readVideos();
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching videos',
      error: error.message,
    });
  }
});

// GET /api/videos/:id - Get single video by ID
router.get('/:id', (req, res) => {
  try {
    const videos = readVideos();
    const video = videos.find((v) => v.id === req.params.id);

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
    res.status(500).json({
      success: false,
      message: 'Error fetching video',
      error: error.message,
    });
  }
});

// POST /api/videos - Add a new video (Admin functionality)
router.post('/', (req, res) => {
  try {
    const {
      id,
      title,
      description,
      thumbnail,
      videoUrl,
      duration,
      views,
      category,
      year,
      rating,
    } = req.body;

    // Validate required fields
    if (!id || !title || !description || !thumbnail || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: id, title, description, thumbnail, videoUrl',
      });
    }

    const videos = readVideos();

    // Check if video with same ID already exists
    if (videos.find((v) => v.id === id)) {
      return res.status(400).json({
        success: false,
        message: `Video with ID '${id}' already exists`,
      });
    }

    // Create new video object
    const newVideo = {
      id,
      title,
      description,
      thumbnail,
      videoUrl,
      duration: duration || '0:00',
      views: views || '0',
      category: category || 'Uncategorized',
      year: year || new Date().getFullYear().toString(),
      rating: rating || 'G',
      uploadDate: new Date().toISOString().split('T')[0],
    };

    // Add to videos array
    videos.push(newVideo);

    // Write back to file
    if (writeVideos(videos)) {
      res.status(201).json({
        success: true,
        message: 'Video added successfully',
        data: newVideo,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error saving video',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding video',
      error: error.message,
    });
  }
});

// PUT /api/videos/:id - Update a video (Admin functionality)
router.put('/:id', (req, res) => {
  try {
    const videos = readVideos();
    const videoIndex = videos.findIndex((v) => v.id === req.params.id);

    if (videoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Video with ID '${req.params.id}' not found`,
      });
    }

    // Update video with new data (merge with existing)
    videos[videoIndex] = {
      ...videos[videoIndex],
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
    };

    if (writeVideos(videos)) {
      res.status(200).json({
        success: true,
        message: 'Video updated successfully',
        data: videos[videoIndex],
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error updating video',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating video',
      error: error.message,
    });
  }
});

// DELETE /api/videos/:id - Delete a video (Admin functionality)
router.delete('/:id', (req, res) => {
  try {
    const videos = readVideos();
    const videoIndex = videos.findIndex((v) => v.id === req.params.id);

    if (videoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Video with ID '${req.params.id}' not found`,
      });
    }

    const deletedVideo = videos.splice(videoIndex, 1)[0];

    if (writeVideos(videos)) {
      res.status(200).json({
        success: true,
        message: 'Video deleted successfully',
        data: deletedVideo,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error deleting video',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
      error: error.message,
    });
  }
});

export default router;


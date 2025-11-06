import express from 'express';
import Playlist from '../models/Playlist.js';
import Video from '../models/Video.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All playlist routes require authentication
router.use(authenticateToken);

// POST /api/playlists - Create a new playlist
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Playlist name is required',
      });
    }

    // Create playlist
    const playlist = await Playlist.create({
      user: req.user.userId,
      name: name.trim(),
      videos: [],
    });

    console.log(`📁 Playlist created by ${req.user.email}: ${name}`);

    res.status(201).json({
      success: true,
      message: 'Playlist created successfully',
      data: playlist,
    });
  } catch (error) {
    console.error('Error creating playlist:', error);

    // Handle duplicate playlist name
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already have a playlist with this name',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating playlist',
      error: error.message,
    });
  }
});

// GET /api/playlists - Get user's playlists
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: playlists.length,
      data: playlists,
    });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching playlists',
      error: error.message,
    });
  }
});

// GET /api/playlists/:pid - Get single playlist with video details
router.get('/:pid', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.pid);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check ownership
    if (playlist.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this playlist',
      });
    }

    // Fetch full video details for videos in playlist
    const videos = await Video.find({ id: { $in: playlist.videos } });

    res.status(200).json({
      success: true,
      data: {
        ...playlist.toObject(),
        videoDetails: videos,
      },
    });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching playlist',
      error: error.message,
    });
  }
});

// POST /api/playlists/:pid/add - Add video to playlist
router.post('/:pid/add', async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Video ID is required',
      });
    }

    // Find playlist
    const playlist = await Playlist.findById(req.params.pid);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check ownership
    if (playlist.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this playlist',
      });
    }

    // Check if video exists
    const video = await Video.findOne({ id: videoId });
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    // Add video to playlist if not already present (unique)
    if (playlist.videos.includes(videoId)) {
      return res.status(400).json({
        success: false,
        message: 'Video already in playlist',
      });
    }

    playlist.videos.push(videoId);
    playlist.updatedAt = Date.now();
    await playlist.save();

    console.log(`➕ Video ${videoId} added to playlist: ${playlist.name}`);

    res.status(200).json({
      success: true,
      message: 'Video added to playlist',
      data: playlist,
    });
  } catch (error) {
    console.error('Error adding video to playlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding video to playlist',
      error: error.message,
    });
  }
});

// POST /api/playlists/:pid/remove - Remove video from playlist
router.post('/:pid/remove', async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Video ID is required',
      });
    }

    // Find playlist
    const playlist = await Playlist.findById(req.params.pid);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check ownership
    if (playlist.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this playlist',
      });
    }

    // Remove video from playlist
    const index = playlist.videos.indexOf(videoId);
    if (index === -1) {
      return res.status(400).json({
        success: false,
        message: 'Video not in playlist',
      });
    }

    playlist.videos.splice(index, 1);
    playlist.updatedAt = Date.now();
    await playlist.save();

    console.log(`➖ Video ${videoId} removed from playlist: ${playlist.name}`);

    res.status(200).json({
      success: true,
      message: 'Video removed from playlist',
      data: playlist,
    });
  } catch (error) {
    console.error('Error removing video from playlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing video from playlist',
      error: error.message,
    });
  }
});

// PATCH /api/playlists/:pid - Update playlist name and/or thumbnail
router.patch('/:pid', async (req, res) => {
  try {
    const { name, thumbnail } = req.body;

    // Find playlist
    const playlist = await Playlist.findById(req.params.pid);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check ownership
    if (playlist.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this playlist',
      });
    }

    // Update fields if provided
    if (name !== undefined && name.trim()) {
      playlist.name = name.trim();
    }
    
    if (thumbnail !== undefined) {
      playlist.thumbnail = thumbnail;
    }

    playlist.updatedAt = Date.now();
    await playlist.save();

    console.log(`✏️ Playlist updated by ${req.user.email}: ${playlist.name}`);

    res.status(200).json({
      success: true,
      message: 'Playlist updated successfully',
      data: playlist,
    });
  } catch (error) {
    console.error('Error updating playlist:', error);

    // Handle duplicate playlist name
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already have a playlist with this name',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating playlist',
      error: error.message,
    });
  }
});

// DELETE /api/playlists/:pid - Delete a playlist
router.delete('/:pid', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.pid);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check ownership
    if (playlist.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this playlist',
      });
    }

    await Playlist.deleteOne({ _id: playlist._id });

    console.log(`🗑️ Playlist deleted by ${req.user.email}: ${playlist.name}`);

    res.status(200).json({
      success: true,
      message: 'Playlist deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting playlist',
      error: error.message,
    });
  }
});

export default router;


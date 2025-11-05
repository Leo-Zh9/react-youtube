import express from 'express';
import Video from '../models/Video.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All stats routes require authentication
router.use(authenticateToken);

// GET /api/stats - Get user's overall statistics
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's videos
    const userVideos = await Video.find({ owner: userId });
    const videoIds = userVideos.map(v => v.id);

    // Calculate total uploads
    const totalUploads = userVideos.length;

    // Calculate total views
    const parseViews = (viewString) => {
      if (!viewString || viewString === '0') return 0;
      const str = viewString.toLowerCase();
      const num = parseFloat(str);
      if (str.includes('k')) return num * 1000;
      if (str.includes('m')) return num * 1000000;
      if (str.includes('b')) return num * 1000000000;
      return parseInt(viewString) || 0;
    };

    const totalViews = userVideos.reduce((sum, video) => {
      return sum + parseViews(video.views);
    }, 0);

    // Calculate total likes (from likesCount field)
    const totalLikes = userVideos.reduce((sum, video) => {
      return sum + (video.likesCount || 0);
    }, 0);

    // Calculate total comments on user's videos
    const totalComments = await Comment.countDocuments({ 
      videoId: { $in: videoIds } 
    });

    console.log(`📊 Stats for ${req.user.email}: ${totalUploads} uploads, ${totalViews} views, ${totalLikes} likes, ${totalComments} comments`);

    res.status(200).json({
      success: true,
      data: {
        totalUploads,
        totalViews,
        totalLikes,
        totalComments,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
});

export default router;


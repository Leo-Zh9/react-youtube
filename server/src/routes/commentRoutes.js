import express from 'express';
import Comment from '../models/Comment.js';
import Video from '../models/Video.js';
import { authenticateToken } from '../middleware/auth.js';
import { sanitizeText, validateCommentText } from '../utils/sanitize.js';

const router = express.Router();

// GET /api/videos/:id/comments - Get comments for a video with cursor-based pagination
router.get('/videos/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor; // ISO date string for cursor

    // Verify video exists
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

    // Build query
    const query = { videoId: video.id };
    
    // If cursor provided, get comments older than cursor
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    // Fetch comments (newest first) with pagination
    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1) // Fetch one extra to check if there are more
      .populate('user', 'email'); // Populate user email

    // Check if there are more comments
    const hasMore = comments.length > limit;
    const commentsToReturn = hasMore ? comments.slice(0, limit) : comments;

    // Get next cursor (createdAt of last comment)
    const nextCursor = hasMore
      ? commentsToReturn[commentsToReturn.length - 1].createdAt.toISOString()
      : null;

    res.status(200).json({
      success: true,
      count: commentsToReturn.length,
      data: commentsToReturn,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message,
    });
  }
});

// POST /api/videos/:id/comments - Add a comment (Protected)
router.post('/videos/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    // Validate and sanitize text
    const validation = validateCommentText(text);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    // Verify video exists
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

    // Create comment
    const comment = await Comment.create({
      videoId: video.id,
      user: req.user.userId,
      text: validation.sanitized,
    });

    // Populate user info for response
    await comment.populate('user', 'email');

    console.log(`💬 Comment added by ${req.user.email} on video: ${video.title}`);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message,
    });
  }
});

// DELETE /api/comments/:commentId - Delete a comment (Protected, owner only)
router.delete('/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    // Find comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user owns the comment (or is admin in the future)
    if (comment.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments',
      });
    }

    // Delete comment
    await Comment.deleteOne({ _id: commentId });

    console.log(`🗑️ Comment deleted by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message,
    });
  }
});

export default router;


import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    index: true, // Index for faster queries
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: [2000, 'Comment must not exceed 2000 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true, // Index for cursor-based pagination
  },
});

// Compound index for efficient queries
commentSchema.index({ videoId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;


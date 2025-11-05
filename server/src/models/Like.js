import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index to prevent duplicate likes
likeSchema.index({ user: 1, videoId: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

export default Like;


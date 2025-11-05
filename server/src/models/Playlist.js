import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Playlist name is required'],
    trim: true,
    maxlength: [100, 'Playlist name must not exceed 100 characters'],
  },
  videos: {
    type: [String], // Array of video IDs
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index to prevent duplicate playlist names per user
playlistSchema.index({ user: 1, name: 1 }, { unique: true });

// Update the updatedAt timestamp before saving
playlistSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;


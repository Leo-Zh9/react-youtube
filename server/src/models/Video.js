import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  // Custom ID field (e.g., 'trend-1', 'new-2')
  id: {
    type: String,
    required: true,
    unique: true,
  },
  // Required fields
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Video URL is required'],
    trim: true,
  },
  // Optional fields
  description: {
    type: String,
    default: '',
    trim: true,
  },
  thumbnail: {
    type: String,
    default: '',
    trim: true,
  },
  duration: {
    type: String,
    default: '0:00',
  },
  views: {
    type: String,
    default: '0',
  },
  category: {
    type: String,
    default: 'Uncategorized',
    trim: true,
  },
  year: {
    type: String,
    default: new Date().getFullYear().toString(),
  },
  rating: {
    type: String,
    default: 'G',
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
  },
  uploadDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  likesCount: {
    type: Number,
    default: 0,
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

// Update the updatedAt timestamp before saving
videoSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create a virtual field for videoUrl to maintain compatibility
videoSchema.virtual('videoUrl').get(function () {
  return this.url;
});

// Ensure virtuals are included in JSON output
videoSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    // Remove MongoDB-specific fields
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

videoSchema.set('toObject', {
  virtuals: true,
});

const Video = mongoose.model('Video', videoSchema);

export default Video;


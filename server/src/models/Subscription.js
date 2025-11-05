import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subscribedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate subscriptions and improve query performance
subscriptionSchema.index({ subscriber: 1, subscribedTo: 1 }, { unique: true });

// Index for efficient lookups
subscriptionSchema.index({ subscribedTo: 1, createdAt: -1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;


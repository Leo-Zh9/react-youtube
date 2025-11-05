import express from 'express';
import Subscription from '../models/Subscription.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/subscriptions/:userId - Subscribe to a user
router.post('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const subscriberId = req.user.userId;

    // Don't allow subscribing to yourself
    if (userId === subscriberId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot subscribe to yourself',
      });
    }

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({
      subscriber: subscriberId,
      subscribedTo: userId,
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'Already subscribed to this user',
      });
    }

    // Create subscription
    const subscription = new Subscription({
      subscriber: subscriberId,
      subscribedTo: userId,
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed',
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error subscribing to user',
    });
  }
});

// DELETE /api/subscriptions/:userId - Unsubscribe from a user
router.delete('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const subscriberId = req.user.userId;

    const result = await Subscription.findOneAndDelete({
      subscriber: subscriberId,
      subscribedTo: userId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unsubscribing from user',
    });
  }
});

// GET /api/subscriptions/check/:userId - Check if subscribed to a user
router.get('/check/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const subscriberId = req.user.userId;

    const subscription = await Subscription.findOne({
      subscriber: subscriberId,
      subscribedTo: userId,
    });

    res.json({
      success: true,
      isSubscribed: !!subscription,
    });
  } catch (error) {
    console.error('Check subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking subscription',
    });
  }
});

// GET /api/subscriptions - Get all subscriptions for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const subscriberId = req.user.userId;

    const subscriptions = await Subscription.find({ subscriber: subscriberId })
      .populate('subscribedTo', 'email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptions: subscriptions.map(sub => ({
        userId: sub.subscribedTo._id,
        email: sub.subscribedTo.email,
        subscribedAt: sub.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions',
    });
  }
});

// GET /api/subscriptions/count/:userId - Get subscriber count for a user
router.get('/count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Subscription.countDocuments({ subscribedTo: userId });

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Get subscriber count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriber count',
    });
  }
});

export default router;


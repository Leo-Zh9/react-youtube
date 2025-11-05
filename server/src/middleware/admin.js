import User from '../models/User.js';

// Middleware to check if user is admin
// Must be used after authenticateToken middleware
export const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Fetch user from database to verify admin status
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    // User is admin, proceed
    req.user.isAdmin = true;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying admin status',
    });
  }
};


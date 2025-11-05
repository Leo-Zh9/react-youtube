import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };

      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error authenticating request',
    });
  }
};

// Optional auth - doesn't fail if no token, just sets req.user if token exists
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token, but that's okay
      req.user = null;
      return next();
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Invalid token, but continue without user
        req.user = null;
      } else {
        // Valid token, attach user
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
        };
      }
      next();
    });
  } catch (error) {
    // Continue without authentication
    req.user = null;
    next();
  }
};


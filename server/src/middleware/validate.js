import { body, param, query, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Auth validation rules
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  validate,
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

// Comment validation rules
export const createCommentValidation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters'),
  param('videoId')
    .notEmpty()
    .withMessage('Video ID is required'),
  validate,
];

export const deleteCommentValidation = [
  param('commentId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid comment ID is required'),
  validate,
];

// Video upload validation rules
export const createVideoValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must not exceed 50 characters'),
  body('duration')
    .optional()
    .matches(/^(\d+:)?\d{1,2}:\d{2}$/)
    .withMessage('Duration must be in format MM:SS or H:MM:SS'),
  body('rating')
    .optional()
    .isIn(['G', 'PG', 'PG-13', 'R', 'NC-17'])
    .withMessage('Invalid rating'),
  validate,
];

// Playlist validation rules
export const createPlaylistValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Playlist name must be between 1 and 100 characters'),
  validate,
];

export const addToPlaylistValidation = [
  param('pid')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid playlist ID is required'),
  body('videoId')
    .trim()
    .notEmpty()
    .withMessage('Video ID is required'),
  validate,
];

export const removeFromPlaylistValidation = [
  param('pid')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid playlist ID is required'),
  body('videoId')
    .trim()
    .notEmpty()
    .withMessage('Video ID is required'),
  validate,
];

// Search validation rules
export const searchValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['relevance', 'views', 'createdAt'])
    .withMessage('Sort must be one of: relevance, views, createdAt'),
  validate,
];


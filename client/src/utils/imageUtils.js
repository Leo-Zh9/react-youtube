// Utility functions for handling images and thumbnails

// Default placeholder image for videos without thumbnails
export const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop&q=80';

/**
 * Get thumbnail URL with fallback
 * @param {string} thumbnail - Thumbnail URL from video data
 * @returns {string} Valid thumbnail URL or fallback
 */
export const getThumbnailUrl = (thumbnail) => {
  if (!thumbnail || thumbnail.trim() === '') {
    return DEFAULT_THUMBNAIL;
  }
  return thumbnail;
};

/**
 * Handle image load error with fallback
 * @param {Event} event - Image error event
 */
export const handleImageError = (event) => {
  if (event.target.src !== DEFAULT_THUMBNAIL) {
    event.target.src = DEFAULT_THUMBNAIL;
  }
};


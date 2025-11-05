// Utility function to sanitize user input text

/**
 * Sanitize text input by removing/escaping dangerous HTML
 * @param {string} text - Raw text input
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text) => {
  if (!text) return '';
  
  // Remove any HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Escape special HTML characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

/**
 * Validate comment text
 * @param {string} text - Comment text
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateCommentText = (text) => {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Comment text is required' };
  }
  
  const sanitized = sanitizeText(text);
  
  if (sanitized.length === 0) {
    return { valid: false, error: 'Comment cannot be empty' };
  }
  
  if (sanitized.length > 2000) {
    return { valid: false, error: 'Comment must not exceed 2000 characters' };
  }
  
  return { valid: true, sanitized };
};


/**
 * Fetch with automatic retry and exponential backoff
 * Handles 429 (Too Many Requests) and network errors
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @returns {Promise<Response>} - The fetch response
 */
export const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If we get a 429 (Too Many Requests), retry with exponential backoff
      if (response.status === 429) {
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.warn(`⚠️ Rate limited (429). Retrying in ${backoffTime / 1000}s... (Attempt ${attempt + 1}/${maxRetries})`);
          await sleep(backoffTime);
          continue; // Retry
        } else {
          // Max retries exceeded
          throw new Error('Too many requests. Please try again in a few moments.');
        }
      }
      
      // If we get any other error status, check if we should retry
      if (!response.ok) {
        // For 5xx errors (server errors), retry
        if (response.status >= 500 && response.status < 600 && attempt < maxRetries) {
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.warn(`⚠️ Server error (${response.status}). Retrying in ${backoffTime / 1000}s...`);
          await sleep(backoffTime);
          continue;
        }
        
        // For other errors (4xx except 429), don't retry
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      
      // Success! Return the response
      return response;
      
    } catch (error) {
      lastError = error;
      
      // If it's a network error (not an HTTP error), retry
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        if (attempt < maxRetries) {
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.warn(`⚠️ Network error. Retrying in ${backoffTime / 1000}s...`);
          await sleep(backoffTime);
          continue;
        }
      }
      
      // If it's another type of error, throw immediately
      throw error;
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error('Request failed after multiple retries');
};

/**
 * Wrapper for GET requests with automatic JSON parsing
 */
export const fetchJSON = async (url, options = {}, maxRetries = 3) => {
  const response = await fetchWithRetry(url, options, maxRetries);
  return response.json();
};

/**
 * Simple in-memory cache for API responses
 */
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute default

/**
 * Fetch with caching support
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @param {number} cacheDuration - Cache duration in ms (default: 60000 = 1 minute)
 */
export const fetchWithCache = async (url, options = {}, cacheDuration = CACHE_TTL) => {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);
  
  // Return cached response if it's still valid
  if (cached && Date.now() - cached.timestamp < cacheDuration) {
    console.log(`📦 Using cached response for: ${url}`);
    return cached.data;
  }
  
  // Fetch fresh data
  const response = await fetchWithRetry(url, options);
  const data = await response.json();
  
  // Store in cache
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
  
  // Clean up old cache entries (simple memory management)
  if (cache.size > 50) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  
  return data;
};

/**
 * Clear cache (useful for after mutations like upload, delete, etc.)
 */
export const clearCache = () => {
  cache.clear();
  console.log('🗑️ API cache cleared');
};


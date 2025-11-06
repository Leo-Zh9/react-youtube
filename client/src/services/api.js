// API service for fetching video data from the backend

import { getAuthHeader } from './authService';
import { fetchWithRetry, fetchWithCache, clearCache } from '../utils/fetchWithRetry';

// Use environment variable for API base URL (falls back to localhost for development)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to handle API errors
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred while fetching data',
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Export clearCache for use after mutations
export { clearCache };

// Get home page data (combined endpoint to reduce requests)
export const getHomeData = async (limit = 100) => {
  try {
    const url = `${API_BASE_URL}/videos/home?limit=${limit}`;
    // Cache for 10 minutes (600000ms)
    const data = await fetchWithCache(url, {}, 600000);
    return data.data; // Return { allVideos, newReleases, counts }
  } catch (error) {
    console.error('Error fetching home data:', error);
    throw error;
  }
};

// Get all videos with optional sorting and pagination
export const getAllVideos = async (options = {}) => {
  try {
    const { page = 1, limit = 24, sort = 'createdAt' } = options;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });
    
    const url = `${API_BASE_URL}/videos?${queryParams}`;
    // Cache for 5 minutes
    const data = await fetchWithCache(url, {}, 300000);
    return data; // Return full response with pagination info
  } catch (error) {
    console.error('Error fetching all videos:', error);
    throw error;
  }
};

// Get new releases (newest videos)
export const getNewReleases = async (limit = 20) => {
  try {
    const url = `${API_BASE_URL}/videos/new?limit=${limit}`;
    // Cache for 5 minutes
    const data = await fetchWithCache(url, {}, 300000);
    return data.data; // Extract the data array from the API response
  } catch (error) {
    console.error('Error fetching new releases:', error);
    throw error;
  }
};

// Get single video by ID
export const getVideoById = async (id) => {
  try {
    const url = `${API_BASE_URL}/videos/${id}`;
    // Cache for 5 minutes
    const data = await fetchWithCache(url, {}, 300000);
    return data.data; // Extract the data object from the API response
  } catch (error) {
    console.error(`Error fetching video ${id}:`, error);
    throw error;
  }
};

// Add new video (Requires authentication)
export const addVideo = async (videoData) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(), // Add Authorization header
      },
      body: JSON.stringify(videoData),
    });
    const data = await handleResponse(response);
    // Clear cache after adding
    clearCache();
    return data.data;
  } catch (error) {
    console.error('Error adding video:', error);
    throw error;
  }
};

// Update video (Admin functionality)
export const updateVideo = async (id, videoData) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/videos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoData),
    });
    const data = await handleResponse(response);
    // Clear cache after updating
    clearCache();
    return data.data;
  } catch (error) {
    console.error(`Error updating video ${id}:`, error);
    throw error;
  }
};

// Delete video (Owner or Admin only)
export const deleteVideo = async (id) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/videos/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(), // Add Authorization header
      },
    });
    const data = await handleResponse(response);
    // Clear cache after deleting
    clearCache();
    return data;
  } catch (error) {
    console.error(`Error deleting video ${id}:`, error);
    throw error;
  }
};

// Get recommended videos (excludes current video)
export const getRecommendedVideos = async (currentVideoId, limit = 10) => {
  try {
    const response = await getAllVideos({ limit: 100 });
    const allVideos = response.data || [];
    
    if (!Array.isArray(allVideos)) {
      console.error('Expected array but got:', typeof allVideos);
      return [];
    }
    
    return allVideos
      .filter((video) => video.id !== currentVideoId)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recommended videos:', error);
    throw error;
  }
};

// Increment view count for a video
export const incrementViewCount = async (videoId) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/videos/${videoId}/view`, {
      method: 'PATCH',
    }, 1); // Only retry once for view counts
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error(`Error incrementing views for ${videoId}:`, error);
    // Don't throw - view count is not critical
    return null;
  }
};

// Toggle like on a video (requires authentication)
export const toggleLike = async (videoId) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/videos/${videoId}/like`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error(`Error toggling like for ${videoId}:`, error);
    throw error;
  }
};

// Get likes info for a video
export const getLikesInfo = async (videoId) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/videos/${videoId}/likes`, {
      headers: {
        ...getAuthHeader(), // Include auth if available
      },
    });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error(`Error fetching likes for ${videoId}:`, error);
    throw error;
  }
};

// Get comments for a video
export const getComments = async (videoId, cursor = null, limit = 20) => {
  try {
    const queryParams = new URLSearchParams({ limit: limit.toString() });
    if (cursor) {
      queryParams.append('cursor', cursor);
    }
    
    const response = await fetchWithRetry(`${API_BASE_URL}/videos/${videoId}/comments?${queryParams}`);
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error(`Error fetching comments for ${videoId}:`, error);
    throw error;
  }
};

// Add a comment to a video (requires authentication)
export const addComment = async (videoId, text) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/videos/${videoId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ text }),
    });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error(`Error adding comment to ${videoId}:`, error);
    throw error;
  }
};

// Delete a comment (requires authentication and ownership)
export const deleteComment = async (commentId) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
};

// ===== PLAYLIST OPERATIONS =====

// Get user's playlists
export const getUserPlaylists = async () => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/playlists`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }
};

// Get single playlist with video details
export const getPlaylist = async (playlistId) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/playlists/${playlistId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error(`Error fetching playlist ${playlistId}:`, error);
    throw error;
  }
};

// Create a new playlist
export const createPlaylist = async (name) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ name }),
    });
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
};

// Add video to playlist
export const addToPlaylist = async (playlistId, videoId) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/playlists/${playlistId}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ videoId }),
    });
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error(`Error adding video to playlist:`, error);
    throw error;
  }
};

// Remove video from playlist
export const removeFromPlaylist = async (playlistId, videoId) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/playlists/${playlistId}/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ videoId }),
    });
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error(`Error removing video from playlist:`, error);
    throw error;
  }
};

// Upload playlist thumbnail
export const uploadPlaylistThumbnail = async (playlistId, thumbnailFile) => {
  try {
    const formData = new FormData();
    formData.append('thumbnail', thumbnailFile);

    const response = await fetchWithRetry(`${API_BASE_URL}/playlists/${playlistId}/upload-thumbnail`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error(`Error uploading playlist thumbnail:`, error);
    throw error;
  }
};

// Update a playlist (name and/or thumbnail)
export const updatePlaylist = async (playlistId, updates) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/playlists/${playlistId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error(`Error updating playlist ${playlistId}:`, error);
    throw error;
  }
};

// Delete a playlist
export const deletePlaylist = async (playlistId) => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error(`Error deleting playlist ${playlistId}:`, error);
    throw error;
  }
};

// ===== SEARCH OPERATIONS =====

// Search videos with filters
export const searchVideos = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.append('q', params.q);
    if (params.category) queryParams.append('category', params.category);
    if (params.year) queryParams.append('year', params.year);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await fetchWithRetry(`${API_BASE_URL}/videos/search?${queryParams.toString()}`);
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
};

// Get available filter options
export const getSearchFilters = async () => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/videos/search/filters`);
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error fetching search filters:', error);
    throw error;
  }
};

// ===== USER UPLOADS & STATS =====

// Get user's uploaded videos
export const getMyVideos = async (page = 1, limit = 20) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/videos?mine=true&page=${page}&limit=${limit}`,
      {
        headers: {
          ...getAuthHeader(),
        },
      }
    );
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Error fetching user videos:', error);
    throw error;
  }
};

// Get user's overall statistics
export const getUserStats = async () => {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/stats`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};


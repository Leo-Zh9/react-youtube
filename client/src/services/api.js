// API service for fetching video data from the backend

const API_BASE_URL = 'http://localhost:5000/api';

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

// Get all videos
export const getAllVideos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos`);
    const data = await handleResponse(response);
    return data.data; // Extract the data array from the API response
  } catch (error) {
    console.error('Error fetching all videos:', error);
    throw error;
  }
};

// Get single video by ID
export const getVideoById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`);
    const data = await handleResponse(response);
    return data.data; // Extract the data object from the API response
  } catch (error) {
    console.error(`Error fetching video ${id}:`, error);
    throw error;
  }
};

// Add new video (Admin functionality)
export const addVideo = async (videoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoData),
    });
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error adding video:', error);
    throw error;
  }
};

// Update video (Admin functionality)
export const updateVideo = async (id, videoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoData),
    });
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error(`Error updating video ${id}:`, error);
    throw error;
  }
};

// Delete video (Admin functionality)
export const deleteVideo = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: 'DELETE',
    });
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error(`Error deleting video ${id}:`, error);
    throw error;
  }
};

// Get recommended videos (excludes current video)
export const getRecommendedVideos = async (currentVideoId, limit = 10) => {
  try {
    const allVideos = await getAllVideos();
    return allVideos
      .filter((video) => video.id !== currentVideoId)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recommended videos:', error);
    throw error;
  }
};


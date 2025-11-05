// Service for handling file uploads to S3 via backend

import axios from 'axios';
import { getToken } from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Upload video file with metadata to S3
 * @param {File} videoFile - Video file to upload
 * @param {Object} metadata - Video metadata (title, description, etc.)
 * @param {File} thumbnailFile - Optional thumbnail file
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} Uploaded video data
 */
export const uploadVideoFile = async (videoFile, metadata, thumbnailFile = null, onProgress = null) => {
  try {
    // Get auth token
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required. Please login.');
    }

    // Create FormData object
    const formData = new FormData();
    
    // Append video file
    formData.append('video', videoFile);
    
    // Append thumbnail if provided
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    
    // Append metadata
    formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.category) formData.append('category', metadata.category);
    if (metadata.duration) formData.append('duration', metadata.duration);
    if (metadata.rating) formData.append('rating', metadata.rating);

    // Upload with axios for better progress tracking
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentComplete = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(percentComplete);
        }
      },
    });

    if (response.data.success) {
      return response.data.video;
    } else {
      throw new Error(response.data.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle axios error response
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw new Error(error.message || 'Upload failed. Please try again.');
  }
};

/**
 * Check if S3 upload is configured on backend
 * @returns {Promise<Object>} Configuration status
 */
export const checkUploadStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload/status`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking upload status:', error);
    return { configured: false };
  }
};


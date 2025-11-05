// Service for handling file uploads to S3 via backend

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

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Set Authorization header
      xhr.open('POST', `${API_BASE_URL}/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.video);
        } else {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || 'Upload failed'));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Send request
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
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


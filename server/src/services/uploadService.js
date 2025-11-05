// Service for handling file uploads to S3
// This file provides helper functions for upload operations

import { addVideo } from '../services/api.js';

/**
 * Upload video with file
 * @param {FormData} formData - Form data containing video file and metadata
 * @returns {Promise<Object>} Upload result
 */
export const uploadVideoWithFile = async (formData) => {
  try {
    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Upload failed',
      }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.video;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Check if S3 upload is configured
 * @returns {Promise<Object>} Configuration status
 */
export const checkUploadConfig = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/upload/status');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking upload config:', error);
    return { configured: false };
  }
};


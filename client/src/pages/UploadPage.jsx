import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addVideo } from '../services/api';

const UploadPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    url: '',
    category: 'Uncategorized',
    duration: '',
    rating: 'G',
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.url.trim()) {
      errors.url = 'Video URL is required';
    } else if (!isValidUrl(formData.url)) {
      errors.url = 'Please enter a valid URL';
    }

    if (formData.thumbnail && !isValidUrl(formData.thumbnail)) {
      errors.thumbnail = 'Please enter a valid URL';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Generate unique ID
      const videoId = `user-${Date.now()}`;

      // Prepare video data
      const videoData = {
        id: videoId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        thumbnail: formData.thumbnail.trim() || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop',
        url: formData.url.trim(),
        category: formData.category || 'Uncategorized',
        duration: formData.duration || '0:00',
        rating: formData.rating || 'G',
        views: '0',
        year: new Date().getFullYear().toString(),
        uploadDate: new Date().toISOString().split('T')[0],
      };

      // Send POST request to backend
      await addVideo(videoData);

      // Show success message
      setSuccess(true);

      // Wait a moment to show success message
      setTimeout(() => {
        // Redirect to home page
        navigate('/', { state: { uploadSuccess: true, videoTitle: formData.title } });
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload video. Please try again.');
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All data will be lost.')) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-black to-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Home</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">Upload Video</h1>
          <p className="text-gray-400">Share your content with the world</p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {success && (
          <div className="bg-green-900 bg-opacity-50 border border-green-500 text-green-200 px-6 py-4 rounded-lg mb-6 flex items-center">
            <svg
              className="w-6 h-6 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold">Video uploaded successfully!</p>
              <p className="text-sm">Redirecting to home page...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6 flex items-center">
            <svg
              className="w-6 h-6 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold">Upload failed</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title - Required */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter video title"
              className={`w-full bg-gray-900 border ${
                validationErrors.title ? 'border-red-500' : 'border-gray-700'
              } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors`}
              disabled={loading || success}
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell viewers about your video"
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
              disabled={loading || success}
            />
          </div>

          {/* Video URL - Required */}
          <div>
            <label htmlFor="url" className="block text-sm font-semibold mb-2">
              Video URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com/video.mp4"
              className={`w-full bg-gray-900 border ${
                validationErrors.url ? 'border-red-500' : 'border-gray-700'
              } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors`}
              disabled={loading || success}
            />
            {validationErrors.url && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.url}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Direct link to the video file (MP4, WebM, etc.)
            </p>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label htmlFor="thumbnail" className="block text-sm font-semibold mb-2">
              Thumbnail URL
            </label>
            <input
              type="text"
              id="thumbnail"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/thumbnail.jpg (optional)"
              className={`w-full bg-gray-900 border ${
                validationErrors.thumbnail ? 'border-red-500' : 'border-gray-700'
              } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors`}
              disabled={loading || success}
            />
            {validationErrors.thumbnail && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.thumbnail}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Leave empty to use default thumbnail
            </p>
          </div>

          {/* Additional Fields Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                disabled={loading || success}
              >
                <option value="Uncategorized">Uncategorized</option>
                <option value="Adventure">Adventure</option>
                <option value="Documentary">Documentary</option>
                <option value="Travel">Travel</option>
                <option value="Nature">Nature</option>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="Food">Food</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-semibold mb-2">
                Duration
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="12:34"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                disabled={loading || success}
              />
            </div>

            {/* Rating */}
            <div>
              <label htmlFor="rating" className="block text-sm font-semibold mb-2">
                Rating
              </label>
              <select
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                disabled={loading || success}
              >
                <option value="G">G - General Audience</option>
                <option value="PG">PG - Parental Guidance</option>
                <option value="PG-13">PG-13 - Parents Cautioned</option>
                <option value="R">R - Restricted</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </>
              ) : success ? (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Uploaded!
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload Video
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={loading || success}
              className="sm:w-auto bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Required Fields Note */}
          <p className="text-gray-500 text-sm text-center">
            <span className="text-red-500">*</span> Required fields
          </p>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;

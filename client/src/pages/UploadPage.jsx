import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadVideoFile, checkUploadStatus } from '../services/uploadService';

const UploadPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [s3Configured, setS3Configured] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Uncategorized',
    duration: '',
    rating: 'G',
  });

  const [files, setFiles] = useState({
    video: null,
    thumbnail: null,
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Check if S3 is configured
  useEffect(() => {
    const checkConfig = async () => {
      const status = await checkUploadStatus();
      setS3Configured(status.configured);
      if (!status.configured) {
        setError('AWS S3 is not configured. Please configure AWS credentials in the backend.');
      }
    };
    checkConfig();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      if (name === 'video' && !file.type.startsWith('video/')) {
        setValidationErrors(prev => ({
          ...prev,
          video: 'Please select a video file'
        }));
        return;
      }
      
      if (name === 'thumbnail' && !file.type.startsWith('image/')) {
        setValidationErrors(prev => ({
          ...prev,
          thumbnail: 'Please select an image file'
        }));
        return;
      }

      // Check file size (500MB for video, 10MB for thumbnail)
      const maxSize = name === 'video' ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: `File too large. Maximum size is ${name === 'video' ? '500MB' : '10MB'}`
        }));
        return;
      }

      setFiles((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Auto-detect video duration
      if (name === 'video') {
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        
        videoElement.onloadedmetadata = function() {
          window.URL.revokeObjectURL(videoElement.src);
          const duration = Math.floor(videoElement.duration);
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          setFormData(prev => ({
            ...prev,
            duration: formattedDuration,
          }));
          
          console.log(`📹 Auto-detected duration: ${formattedDuration}`);
        };
        
        videoElement.src = URL.createObjectURL(file);
      }

      // Clear any previous errors
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!files.video) {
      errors.video = 'Please select a video file to upload';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!s3Configured) {
      setError('AWS S3 is not configured. Cannot upload files.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setUploadProgress(0);

    try {
      // Upload video file with metadata
      const metadata = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        duration: formData.duration,
        rating: formData.rating,
      };

      // Upload with progress tracking
      await uploadVideoFile(
        files.video,
        metadata,
        files.thumbnail,
        (progress) => {
          setUploadProgress(Math.round(progress));
        }
      );

      // Show success message
      setSuccess(true);
      setUploadProgress(100);

      // Wait a moment to show success message
      setTimeout(() => {
        // Redirect to home page
        navigate('/', {
          state: {
            uploadSuccess: true,
            videoTitle: formData.title,
          },
        });
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload video. Please try again.');
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (
      window.confirm(
        'Are you sure you want to cancel? All data will be lost.'
      )
    ) {
      navigate('/');
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-900">
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors mb-4 group"
          >
            <svg
              className="w-4 h-4"
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
            <span className="text-sm">Back</span>
          </button>

          <h1 className="text-2xl md:text-3xl font-semibold mb-1 tracking-tight">
            Upload Video
          </h1>
          <p className="text-sm text-gray-500">
            Share your content with the world
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8">
        {/* S3 Not Configured Warning */}
        {!s3Configured && (
          <div className="bg-gray-900 border-l-4 border-white px-6 py-4 mb-6">
            <p className="font-semibold text-white mb-1">Configuration Required</p>
            <p className="text-sm text-gray-400">
              AWS S3 credentials must be configured in the backend to enable uploads.
            </p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-gray-900 border-l-4 border-white px-6 py-4 mb-6 flex items-center">
            <svg
              className="w-5 h-5 mr-3 flex-shrink-0 text-white"
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
              <p className="font-semibold text-white">
                Upload successful
              </p>
              <p className="text-sm text-gray-400">Redirecting...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-gray-900 border-l-4 border-white px-6 py-4 mb-6 flex items-center">
            <svg
              className="w-5 h-5 mr-3 flex-shrink-0 text-white"
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
              <p className="font-semibold text-white">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {loading && uploadProgress > 0 && (
          <div className="bg-gray-950 border border-gray-800 p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">
                Uploading...
              </span>
              <span className="text-sm text-gray-400 font-mono">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-900 h-1">
              <div
                className="bg-white h-1 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Do not close this window
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Video File Upload - Required */}
          <div>
            <label
              htmlFor="video"
              className="block text-sm font-medium text-gray-400 mb-3"
            >
              Video File <span className="text-white">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                id="video"
                name="video"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading || success}
              />
              <label
                htmlFor="video"
                className={`block w-full bg-gray-950 border-2 ${
                  validationErrors.video
                    ? 'border-white'
                    : files.video
                    ? 'border-gray-700'
                    : 'border-gray-800'
                } hover:border-gray-600 transition-all px-6 py-10 text-center cursor-pointer ${
                  loading || success ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {files.video ? (
                  <div>
                    <svg
                      className="w-10 h-10 mx-auto mb-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-white font-medium text-sm">
                      {files.video.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1.5">
                      {formatFileSize(files.video.size)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <svg
                      className="w-10 h-10 mx-auto mb-3 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-gray-400 text-sm font-medium">
                      Select video file
                    </p>
                    <p className="text-xs text-gray-600 mt-1.5">
                      MP4, WebM, AVI • Max 500MB
                    </p>
                  </div>
                )}
              </label>
            </div>
            {validationErrors.video && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.video}
              </p>
            )}
          </div>

          {/* Thumbnail File Upload - Optional */}
          <div>
            <label
              htmlFor="thumbnail"
              className="block text-sm font-medium text-gray-400 mb-3"
            >
              Thumbnail
              <span className="text-gray-600 font-normal ml-2 text-xs">
                (Optional - Default will be used if not provided)
              </span>
            </label>
            <div className="relative">
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading || success}
              />
              <label
                htmlFor="thumbnail"
                className={`block w-full bg-gray-950 border-2 ${
                  validationErrors.thumbnail
                    ? 'border-white'
                    : files.thumbnail
                    ? 'border-gray-700'
                    : 'border-gray-800'
                } hover:border-gray-600 transition-all px-6 py-8 text-center cursor-pointer ${
                  loading || success ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {files.thumbnail ? (
                  <div className="flex items-center justify-center space-x-4">
                    <img
                      src={URL.createObjectURL(files.thumbnail)}
                      alt="Thumbnail preview"
                      className="w-32 h-20 object-cover border border-gray-800"
                    />
                    <div className="text-left">
                      <p className="text-white font-medium text-sm">
                        {files.thumbnail.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(files.thumbnail.size)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <svg
                      className="w-8 h-8 mx-auto mb-3 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-400 text-sm font-medium">
                      Select thumbnail image
                    </p>
                    <p className="text-xs text-gray-600 mt-1.5">
                      JPG, PNG • Max 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
            {validationErrors.thumbnail && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.thumbnail}
              </p>
            )}
          </div>

          {/* Title - Required */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-400 mb-3"
            >
              Title <span className="text-white">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter video title"
              className={`w-full bg-black border ${
                validationErrors.title
                  ? 'border-white'
                  : 'border-gray-800'
              } px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:bg-gray-950 transition-all`}
              disabled={loading || success}
            />
            {validationErrors.title && (
              <p className="text-white text-xs mt-2">
                {validationErrors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-400 mb-3"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your video"
              rows={4}
              className="w-full bg-black border border-gray-800 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:bg-gray-950 transition-all resize-none"
              disabled={loading || success}
            />
          </div>

          {/* Additional Fields Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-semibold mb-2"
              >
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

            {/* Duration - Auto-detected */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-400 mb-3"
              >
                Duration
                {formData.duration && (
                  <span className="text-white font-normal ml-2 text-xs">
                    ✓
                  </span>
                )}
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                readOnly
                placeholder="Auto-detected"
                className="w-full bg-gray-900 border border-gray-800 px-4 py-3 text-gray-500 placeholder-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Rating */}
            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium text-gray-400 mb-3"
              >
                Rating
              </label>
              <select
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full bg-black border border-gray-800 px-4 py-3 text-white focus:outline-none focus:border-white focus:bg-gray-950 transition-all cursor-pointer"
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
              disabled={loading || success || !s3Configured}
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
                  Uploading to S3...
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
                  Uploaded to S3!
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
                  <span>Publish</span>
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

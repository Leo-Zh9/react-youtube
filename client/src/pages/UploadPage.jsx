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

          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Upload Video
          </h1>
          <p className="text-gray-400">
            Upload your video file to AWS S3
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* S3 Not Configured Warning */}
        {!s3Configured && (
          <div className="bg-yellow-900 bg-opacity-50 border border-yellow-500 text-yellow-200 px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold">⚠️ AWS S3 Not Configured</p>
            <p className="text-sm">
              Please configure AWS credentials in the backend .env file to enable file uploads.
            </p>
          </div>
        )}

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
              <p className="font-semibold">
                Video uploaded to S3 successfully!
              </p>
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

        {/* Upload Progress */}
        {loading && uploadProgress > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">
                Uploading to AWS S3...
              </span>
              <span className="text-sm text-gray-400">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div
                className="bg-red-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Please don't close this page...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video File Upload - Required */}
          <div>
            <label
              htmlFor="video"
              className="block text-sm font-semibold mb-2"
            >
              Video File <span className="text-red-500">*</span>
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
                className={`block w-full bg-gray-900 border ${
                  validationErrors.video
                    ? 'border-red-500'
                    : 'border-gray-700'
                } rounded-lg px-4 py-8 text-center cursor-pointer hover:border-red-500 transition-colors ${
                  loading || success ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {files.video ? (
                  <div>
                    <svg
                      className="w-12 h-12 mx-auto mb-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-white font-medium">
                      {files.video.name}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {formatFileSize(files.video.size)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <svg
                      className="w-12 h-12 mx-auto mb-2 text-gray-500"
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
                    <p className="text-gray-400">
                      Click to select video file
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP4, WebM, AVI, etc. (Max 500MB)
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
              className="block text-sm font-semibold mb-2"
            >
              Thumbnail Image (Optional)
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
                className={`block w-full bg-gray-900 border ${
                  validationErrors.thumbnail
                    ? 'border-red-500'
                    : 'border-gray-700'
                } rounded-lg px-4 py-6 text-center cursor-pointer hover:border-red-500 transition-colors ${
                  loading || success ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {files.thumbnail ? (
                  <div className="flex items-center justify-center space-x-4">
                    <img
                      src={URL.createObjectURL(files.thumbnail)}
                      alt="Thumbnail preview"
                      className="w-32 h-20 object-cover rounded"
                    />
                    <div className="text-left">
                      <p className="text-white font-medium">
                        {files.thumbnail.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatFileSize(files.thumbnail.size)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <svg
                      className="w-8 h-8 mx-auto mb-2 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-400 text-sm">
                      Click to select thumbnail
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, etc. (Max 10MB)
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
              className="block text-sm font-semibold mb-2"
            >
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
                validationErrors.title
                  ? 'border-red-500'
                  : 'border-gray-700'
              } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors`}
              disabled={loading || success}
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold mb-2"
            >
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

            {/* Duration */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-semibold mb-2"
              >
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
              <label
                htmlFor="rating"
                className="block text-sm font-semibold mb-2"
              >
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
                  Upload to S3
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

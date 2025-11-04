import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVideoById, getRecommendedVideos } from '../data/mockData';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay and fetch video data
    setLoading(true);
    window.scrollTo(0, 0); // Scroll to top when video changes

    setTimeout(() => {
      const videoData = getVideoById(id);
      if (videoData) {
        setVideo(videoData);
        setRecommendedVideos(getRecommendedVideos(id, 12));
      } else {
        // If video not found, redirect to home
        navigate('/');
      }
      setLoading(false);
    }, 500); // Simulate network delay
  }, [id, navigate]);

  // Format upload date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-white text-xl">Loading video...</p>
        </div>
      </div>
    );
  }

  // Video not found
  if (!video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Video not found</p>
          <button
            onClick={() => navigate('/')}
            className="text-red-600 hover:text-red-500 underline"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back to Home Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 bg-black bg-opacity-70 hover:bg-opacity-90 px-4 py-2 rounded-full backdrop-blur-sm transition-all"
        >
          <svg
            className="w-6 h-6"
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
          <span className="font-semibold">Back to Home</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player and Info - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              {/* Video Player */}
              <div className="relative bg-black rounded-lg overflow-hidden mb-6">
                <video
                  key={video.id}
                  className="w-full aspect-video"
                  controls
                  autoPlay
                  controlsList="nodownload"
                  poster={video.thumbnail}
                >
                  <source src={video.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                {video.title}
              </h1>

              {/* Video Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
                <span className="flex items-center space-x-1">
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>{video.views} views</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{formatDate(video.uploadDate)}</span>
                </span>
                <span>•</span>
                <span className="px-2 py-1 border border-gray-600 rounded text-xs">
                  {video.rating}
                </span>
                <span>•</span>
                <span className="bg-red-600 px-3 py-1 rounded text-xs font-semibold">
                  {video.category}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition-all font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>Like</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-800 px-6 py-3 rounded hover:bg-gray-700 transition-all font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add to List</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-800 px-6 py-3 rounded hover:bg-gray-700 transition-all font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>

              {/* Description Box */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {video.description}
                </p>
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Duration: {video.duration}</span>
                    <span>•</span>
                    <span>Year: {video.year}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Videos Sidebar - Takes 1 column on large screens */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold mb-4">Recommended Videos</h2>
              <div className="space-y-4">
                {recommendedVideos.map((recommendedVideo) => (
                  <button
                    key={recommendedVideo.id}
                    onClick={() => navigate(`/watch/${recommendedVideo.id}`)}
                    className="block w-full group text-left"
                  >
                    <div className="flex gap-3 hover:bg-gray-900 rounded-lg p-2 transition-all">
                      {/* Thumbnail */}
                      <div className="relative w-40 flex-shrink-0">
                        <img
                          src={recommendedVideo.thumbnail}
                          alt={recommendedVideo.title}
                          className="w-full h-24 object-cover rounded"
                        />
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
                          {recommendedVideo.duration}
                        </div>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-red-500 transition-colors">
                          {recommendedVideo.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {recommendedVideo.category}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {recommendedVideo.views} views
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;


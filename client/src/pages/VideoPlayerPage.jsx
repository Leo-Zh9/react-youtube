import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVideoById, getRecommendedVideos, incrementViewCount, toggleLike, getLikesInfo } from '../services/api';
import { isAuthenticated } from '../services/authService';
import { getThumbnailUrl, handleImageError } from '../utils/imageUtils';
import CommentsSection from '../components/CommentsSection';
import PlaylistModal from '../components/PlaylistModal';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Like state
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  
  // Modals
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  
  // Refs for view tracking
  const videoRef = useRef(null);
  const viewCounted = useRef(false);
  const watchStartTime = useRef(null);
  const viewTrackingTimer = useRef(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo(0, 0);

        // Fetch the main video, recommended videos, and likes info
        const [videoData, recommended, likesData] = await Promise.all([
          getVideoById(id),
          getRecommendedVideos(id, 12),
          getLikesInfo(id).catch(() => ({ likesCount: 0, isLiked: false })),
        ]);

        setVideo(videoData);
        setRecommendedVideos(recommended);
        setLikesCount(likesData.likesCount || videoData.likesCount || 0);
        setLiked(likesData.isLiked || false);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError(err.message || 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
    
    // Reset view tracking when video changes
    viewCounted.current = false;
    watchStartTime.current = null;
    if (viewTrackingTimer.current) {
      clearTimeout(viewTrackingTimer.current);
    }
  }, [id]);

  // Parse duration to seconds
  const parseDuration = (durationStr) => {
    if (!durationStr) return 0;
    
    // Handle formats like "12:34", "1:23:45", "2h 15m", etc.
    const timeMatch = durationStr.match(/(\d+):(\d+):?(\d+)?/);
    if (timeMatch) {
      const hours = timeMatch[3] ? parseInt(timeMatch[1]) : 0;
      const minutes = timeMatch[3] ? parseInt(timeMatch[2]) : parseInt(timeMatch[1]);
      const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : parseInt(timeMatch[2]);
      return hours * 3600 + minutes * 60 + seconds;
    }
    
    // Handle "2h 15m" format
    const hourMatch = durationStr.match(/(\d+)h/);
    const minMatch = durationStr.match(/(\d+)m/);
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minMatch ? parseInt(minMatch[1]) : 0;
    return hours * 3600 + minutes * 60;
  };

  // Handle view counting logic
  const handleViewCount = async () => {
    if (viewCounted.current || !video) return;

    try {
      await incrementViewCount(video.id);
      viewCounted.current = true;
      console.log('✅ View counted for video:', video.title);
      
      // Update local video state with new view count
      setVideo(prev => ({
        ...prev,
        views: prev.views ? (parseInt(prev.views) + 1).toString() : '1'
      }));
    } catch (error) {
      console.error('Failed to count view:', error);
    }
  };

  // Set up video event listeners for view tracking
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !video) return;

    const durationSeconds = parseDuration(video.duration);
    const isShortVideo = durationSeconds < 15;
    
    // Determine threshold for counting view
    const viewThreshold = isShortVideo 
      ? 3  // 3 seconds for short videos
      : Math.min(10, durationSeconds * 0.2); // 10s or 20% of duration

    const handlePlay = () => {
      if (viewCounted.current) return;
      
      // Start tracking watch time
      if (!watchStartTime.current) {
        watchStartTime.current = Date.now();
      }

      // Set up timer to count view after threshold
      if (viewTrackingTimer.current) {
        clearTimeout(viewTrackingTimer.current);
      }

      viewTrackingTimer.current = setTimeout(() => {
        handleViewCount();
      }, viewThreshold * 1000);
    };

    const handlePause = () => {
      // Clear timer if paused before threshold
      if (viewTrackingTimer.current && !viewCounted.current) {
        clearTimeout(viewTrackingTimer.current);
      }
    };

    const handleTimeUpdate = () => {
      if (viewCounted.current) return;
      
      // Check if user has watched enough
      const currentTime = videoElement.currentTime;
      const duration = videoElement.duration;
      
      if (duration && currentTime >= viewThreshold) {
        handleViewCount();
      }
    };

    // Add event listeners
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    // Cleanup
    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      
      if (viewTrackingTimer.current) {
        clearTimeout(viewTrackingTimer.current);
      }
    };
  }, [video]);

  // Handle like button click
  const handleLike = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/watch/${id}` } });
      return;
    }

    if (likeLoading) return;

    // Optimistic UI update
    const wasLiked = liked;
    const previousCount = likesCount;
    
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    setLikeLoading(true);

    try {
      const result = await toggleLike(id);
      
      // Update with server response
      setLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (err) {
      console.error('Error toggling like:', err);
      
      // Revert on error
      setLiked(wasLiked);
      setLikesCount(previousCount);
      
      if (err.message.includes('401') || err.message.includes('403')) {
        navigate('/login', { state: { from: `/watch/${id}` } });
      }
    } finally {
      setLikeLoading(false);
    }
  };

  // Handle save to playlist
  const handleSave = () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/watch/${id}` } });
      return;
    }
    setShowPlaylistModal(true);
  };

  const handleClosePlaylistModal = () => {
    setShowPlaylistModal(false);
  };

  // Handle share
  const handleShare = async () => {
    const shareData = {
      title: video.title,
      text: `Check out "${video.title}" on ReactFlix!`,
      url: window.location.href,
    };

    try {
      // Try native share API (mobile/modern browsers)
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('✅ Shared successfully');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          setShowShareToast(true);
          setTimeout(() => setShowShareToast(false), 3000);
        } catch (clipboardErr) {
          console.error('Clipboard error:', clipboardErr);
        }
      }
    }
  };

  // Format upload date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format likes count
  const formatLikesCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <p className="text-white text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold transition-colors"
          >
            Return to Home
          </button>
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
                  ref={videoRef}
                  key={video.id}
                  className="w-full aspect-video"
                  controls
                  autoPlay
                  controlsList="nodownload"
                  poster={getThumbnailUrl(video.thumbnail)}
                >
                  <source src={video.videoUrl || video.url} type="video/mp4" />
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
                  <span className="font-semibold">{video.views} views</span>
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
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`flex items-center space-x-2 ${
                    liked
                      ? 'bg-white text-black'
                      : 'bg-gray-800 text-white'
                  } px-6 py-3 rounded hover:opacity-80 transition-all font-semibold disabled:opacity-50`}
                >
                  {liked ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 20 20" strokeWidth={2}>
                      <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  )}
                  <span>{liked ? 'Liked' : 'Like'} {likesCount > 0 && `(${formatLikesCount(likesCount)})`}</span>
                </button>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-gray-800 px-6 py-3 rounded hover:bg-gray-700 transition-all font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Save to Playlist</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 bg-gray-800 px-6 py-3 rounded hover:bg-gray-700 transition-all font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>

              {/* Share Toast */}
              {showShareToast && (
                <div className="fixed bottom-8 right-8 bg-green-900 bg-opacity-90 border border-green-500 text-green-200 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Link copied to clipboard!</span>
                  </div>
                </div>
              )}

              {/* Playlist Modal */}
              {showPlaylistModal && (
                <PlaylistModal
                  videoId={video.id || id}
                  onClose={handleClosePlaylistModal}
                />
              )}

              {/* Description Box */}
              <div className="bg-gray-900 rounded-lg p-6 mb-8">
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

              {/* Comments Section */}
              <CommentsSection videoId={video.id || id} />
            </div>

            {/* Recommended Videos Sidebar - Takes 1 column on large screens */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold mb-4">Recommended Videos</h2>
              {recommendedVideos.length > 0 ? (
                <div className="space-y-4">
                  {recommendedVideos.map((recommendedVideo) => (
                    <button
                      key={recommendedVideo.id || recommendedVideo._id}
                      onClick={() => navigate(`/watch/${recommendedVideo.id || recommendedVideo._id}`)}
                      className="block w-full group text-left"
                    >
                      <div className="flex gap-3 hover:bg-gray-900 rounded-lg p-2 transition-all">
                        {/* Thumbnail */}
                        <div className="relative w-40 flex-shrink-0">
                          <img
                            src={getThumbnailUrl(recommendedVideo.thumbnail)}
                            alt={recommendedVideo.title}
                            onError={handleImageError}
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
              ) : (
                <p className="text-gray-400">No recommendations available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;

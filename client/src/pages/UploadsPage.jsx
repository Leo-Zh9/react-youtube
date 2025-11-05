import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyVideos, getUserStats, deleteVideo } from '../services/api';
import { isAuthenticated, isAdmin } from '../services/authService';
import { getThumbnailUrl, handleImageError } from '../utils/imageUtils';
import ErrorRetry from '../components/ErrorRetry';

const UploadsPage = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/uploads' } });
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both user videos and stats in parallel
      const [videosData, statsData] = await Promise.all([
        getMyVideos(1, 50), // Get up to 50 videos
        getUserStats(),
      ]);

      setVideos(videosData.data || []);
      setPagination({
        page: videosData.page,
        total: videosData.total,
        totalPages: videosData.totalPages,
      });
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching uploads:', err);
      setError('Failed to load your uploads');
    } finally {
      setLoading(false);
    }
  };

  const formatViews = (views) => {
    if (typeof views === 'string') return views;
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDeleteVideo = async (videoId, videoTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${videoTitle}"?`)) {
      return;
    }

    try {
      await deleteVideo(videoId);
      // Remove video from state
      setVideos(prevVideos => prevVideos.filter(v => (v.id || v._id) !== videoId));
      // Refresh stats
      const statsData = await getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-white text-xl">Loading your uploads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors mb-3 group"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back</span>
              </button>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">My Uploads</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your content</p>
            </div>
            
            {/* Create New Video Button */}
            <button
              onClick={() => navigate('/upload')}
              className="bg-white hover:bg-gray-200 text-black font-semibold px-6 py-3 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create
            </button>
          </div>

          {/* Analytics Summary Bar */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-950 border border-gray-900 p-4 hover:border-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xl font-semibold text-white">{stats.totalUploads}</p>
                    <p className="text-xs text-gray-600">Videos</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-900 p-4 hover:border-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <div>
                    <p className="text-xl font-semibold text-white">{formatViews(stats.totalViews)}</p>
                    <p className="text-xs text-gray-600">Views</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-900 p-4 hover:border-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xl font-semibold text-white">{stats.totalLikes}</p>
                    <p className="text-xs text-gray-600">Likes</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-900 p-4 hover:border-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div>
                    <p className="text-xl font-semibold text-white">{stats.totalComments}</p>
                    <p className="text-xs text-gray-600">Comments</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {error ? (
          <ErrorRetry message={error} onRetry={fetchData} />
        ) : videos.length === 0 ? (
            <div className="text-center py-24">
            <svg className="w-16 h-16 mx-auto mb-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2 text-white">No content yet</h2>
            <p className="text-gray-600 mb-8 text-sm">Start sharing your videos with the world</p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-white hover:bg-gray-200 text-black font-semibold px-8 py-3 transition-all inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Upload First Video
            </button>
          </div>
        ) : (
          <>
            {/* Videos Table/Grid */}
            <div className="bg-gray-950 border border-gray-900 overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-900">
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-600 uppercase tracking-wider">Video</th>
                      <th className="text-left py-4 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">Views</th>
                      <th className="text-left py-4 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">Likes</th>
                      <th className="text-left py-4 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">Comments</th>
                      <th className="text-left py-4 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((video) => (
                      <tr 
                        key={video.id || video._id} 
                        className="border-b border-gray-900 hover:bg-gray-900 transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="relative w-40 flex-shrink-0">
                              <img
                                src={getThumbnailUrl(video.thumbnail)}
                                alt={video.title}
                                onError={handleImageError}
                                className="w-full h-24 object-cover border border-gray-900 group-hover:border-gray-800 transition-colors"
                              />
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-95 text-white text-xs font-medium px-1.5 py-0.5">
                                {video.duration}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white mb-1 line-clamp-2 group-hover:text-gray-300 transition-colors">
                                {video.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {video.description || 'No description'}
                              </p>
                              <div className="flex gap-2 mt-1.5">
                                <span className="text-xs text-gray-600 border border-gray-800 px-2 py-0.5">
                                  {video.category}
                                </span>
                                <span className="text-xs text-gray-600 border border-gray-800 px-2 py-0.5">
                                  {video.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-400">
                          {video.views || '0'}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-400">
                          {video.likesCount || 0}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-400">
                          {video.commentsCount || 0}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {formatDate(video.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => navigate(`/watch/${video.id || video._id}`)}
                              className="bg-white hover:bg-gray-200 text-black px-4 py-2 transition-all text-sm font-medium"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id || video._id, video.title)}
                              className="bg-gray-900 hover:bg-gray-800 text-gray-500 hover:text-white px-4 py-2 border border-gray-800 hover:border-gray-700 transition-all text-sm font-medium"
                              title="Delete video"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden divide-y divide-gray-800">
                {videos.map((video) => (
                  <div 
                    key={video.id || video._id}
                    className="p-4 hover:bg-gray-850 transition-colors"
                  >
                    <div className="flex gap-4 mb-3">
                      <div className="relative w-32 flex-shrink-0">
                        <img
                          src={getThumbnailUrl(video.thumbnail)}
                          alt={video.title}
                          onError={handleImageError}
                          className="w-full h-20 object-cover rounded"
                        />
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1 line-clamp-2">
                          {video.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                          <span>{video.category}</span>
                          <span>•</span>
                          <span>{formatDate(video.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {video.views || '0'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          {video.likesCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {video.commentsCount || 0}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/watch/${video.id || video._id}`)}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors text-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadsPage;


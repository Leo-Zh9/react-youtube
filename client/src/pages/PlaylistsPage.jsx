import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserPlaylists, getPlaylist, deletePlaylist } from '../services/api';
import { isAuthenticated } from '../services/authService';

const PlaylistsPage = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/playlists' } });
      return;
    }

    fetchPlaylists();
  }, [navigate]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserPlaylists();
      setPlaylists(data);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setError('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPlaylist = async (playlistId) => {
    try {
      const data = await getPlaylist(playlistId);
      setSelectedPlaylist(data);
      setSelectedVideos(data.videoDetails || []);
      setViewMode('detail');
    } catch (err) {
      console.error('Error loading playlist:', err);
      alert('Failed to load playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId, playlistName) => {
    if (!window.confirm(`Delete playlist "${playlistName}"?`)) {
      return;
    }

    try {
      await deletePlaylist(playlistId);
      setPlaylists(prev => prev.filter(p => p._id !== playlistId));
      
      // If viewing this playlist, go back to list
      if (selectedPlaylist?._id === playlistId) {
        setViewMode('list');
        setSelectedPlaylist(null);
      }
    } catch (err) {
      console.error('Error deleting playlist:', err);
      alert('Failed to delete playlist');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPlaylist(null);
    setSelectedVideos([]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-white text-xl">Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-black to-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <button
            onClick={() => viewMode === 'detail' ? handleBackToList() : navigate('/')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{viewMode === 'detail' ? 'Back to Playlists' : 'Back to Home'}</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-bold">
            {viewMode === 'detail' ? selectedPlaylist?.name : 'My Playlists'}
          </h1>
          {viewMode === 'detail' && (
            <p className="text-gray-400 mt-2">
              {selectedVideos.length} video{selectedVideos.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {viewMode === 'list' ? (
          // Playlists List View
          error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchPlaylists}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="text-xl font-bold mb-2">No playlists yet</h2>
              <p className="text-gray-400 mb-6">Create your first playlist to organize your favorite videos</p>
              <button
                onClick={() => navigate('/')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold transition-colors"
              >
                Browse Videos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-850 transition-colors group"
                >
                  <button
                    onClick={() => handleOpenPlaylist(playlist._id)}
                    className="w-full text-left"
                  >
                    <div className="aspect-video bg-gradient-to-br from-red-900 to-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        <p className="text-white font-semibold">
                          {playlist.videos.length} videos
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-500 transition-colors">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Updated {new Date(playlist.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => handleDeletePlaylist(playlist._id, playlist.name)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-900 text-gray-400 hover:text-red-500 py-2 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-sm">Delete Playlist</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Playlist Detail View
          <div>
            {selectedVideos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">This playlist is empty</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold transition-colors"
                >
                  Add Videos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedVideos.map((video) => (
                  <button
                    key={video.id || video._id}
                    onClick={() => navigate(`/watch/${video.id || video._id}`)}
                    className="group"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-red-500 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{video.category}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistsPage;


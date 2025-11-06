import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserPlaylists, getPlaylist, deletePlaylist } from '../services/api';
import { isAuthenticated } from '../services/authService';
import { getThumbnailUrl, handleImageError } from '../utils/imageUtils';
import EditPlaylistModal from '../components/EditPlaylistModal';
import { toast } from '../hooks/useToast';

const PlaylistsPage = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [editingPlaylist, setEditingPlaylist] = useState(null);

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

  const handleEditPlaylist = (playlist, e) => {
    e.stopPropagation();
    setEditingPlaylist(playlist);
  };

  const handleUpdatePlaylist = (updatedPlaylist) => {
    setPlaylists(prev => prev.map(p => 
      p._id === updatedPlaylist._id ? updatedPlaylist : p
    ));
    
    // Update selectedPlaylist if it's the one being edited
    if (selectedPlaylist?._id === updatedPlaylist._id) {
      setSelectedPlaylist(updatedPlaylist);
    }
  };

  const handleDeletePlaylist = async (playlistId, playlistName, e) => {
    e.stopPropagation();
    
    if (!window.confirm(`Delete playlist "${playlistName}"?`)) {
      return;
    }

    try {
      await deletePlaylist(playlistId);
      setPlaylists(prev => prev.filter(p => p._id !== playlistId));
      toast.success(`Deleted "${playlistName}"`);
      
      // If viewing this playlist, go back to list
      if (selectedPlaylist?._id === playlistId) {
        setViewMode('list');
        setSelectedPlaylist(null);
      }
    } catch (err) {
      console.error('Error deleting playlist:', err);
      toast.error('Failed to delete playlist');
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
          <button
            onClick={() => viewMode === 'detail' ? handleBackToList() : navigate('/')}
            className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors mb-3 group"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">{viewMode === 'detail' ? 'Back' : 'Back'}</span>
          </button>

          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {viewMode === 'detail' ? selectedPlaylist?.name : 'My Playlists'}
          </h1>
          {viewMode === 'detail' && (
            <p className="text-sm text-gray-500 mt-1">
              {selectedVideos.length} video{selectedVideos.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        {viewMode === 'list' ? (
          // Playlists List View
          error ? (
            <div className="text-center py-16">
              <p className="text-white mb-6">{error}</p>
              <button
                onClick={fetchPlaylists}
                className="bg-white hover:bg-gray-200 text-black px-8 py-3 font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Retry
              </button>
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-24">
              <svg className="w-16 h-16 mx-auto mb-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">No playlists yet</h2>
              <p className="text-gray-600 mb-8 text-sm">Create playlists to organize your favorite videos</p>
              <button
                onClick={() => navigate('/')}
                className="bg-white hover:bg-gray-200 text-black px-8 py-3 font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Browse Videos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  className="bg-gray-950 border border-gray-900 hover:border-gray-800 transition-all group"
                >
                  <button
                    onClick={() => handleOpenPlaylist(playlist._id)}
                    className="w-full text-left"
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center border-b border-gray-900 overflow-hidden">
                      {playlist.thumbnail ? (
                        <img
                          src={playlist.thumbnail}
                          alt={playlist.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div className={`text-center ${playlist.thumbnail ? 'hidden' : ''}`}>
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        <p className="text-gray-500 font-medium text-sm">
                          {playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-medium text-white mb-1 group-hover:text-gray-300 transition-colors">
                        {playlist.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        Updated {new Date(playlist.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={(e) => handleEditPlaylist(playlist, e)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-gray-500 hover:text-white py-2 border border-gray-800 hover:border-gray-700 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={(e) => handleDeletePlaylist(playlist._id, playlist.name, e)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-red-900/50 text-gray-500 hover:text-red-400 py-2 border border-gray-800 hover:border-red-700 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-sm">Delete</span>
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
              <div className="text-center py-24">
                <p className="text-gray-600 mb-8 text-sm">This playlist is empty</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-white hover:bg-gray-200 text-black px-8 py-3 font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Add Videos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {selectedVideos.map((video) => (
                  <button
                    key={video.id || video._id}
                    onClick={() => navigate(`/watch/${video.id || video._id}`)}
                    className="group text-left"
                  >
                    <div className="relative aspect-video overflow-hidden mb-2 bg-gray-900">
                      <img
                        src={getThumbnailUrl(video.thumbnail)}
                        alt={video.title}
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-75"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* Play Button - Center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 ease-out">
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {/* Duration Badge */}
                      <div className="absolute bottom-1.5 right-1.5 bg-black bg-opacity-90 text-white text-xs font-medium px-1.5 py-0.5">
                        {video.duration}
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-white mb-1 line-clamp-2 leading-tight group-hover:text-gray-300 transition-colors duration-200">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-200">{video.category}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Playlist Modal */}
        {editingPlaylist && (
          <EditPlaylistModal
            playlist={editingPlaylist}
            onClose={() => setEditingPlaylist(null)}
            onUpdate={handleUpdatePlaylist}
          />
        )}
      </div>
    </div>
  );
};

export default PlaylistsPage;


import { useState, useEffect } from 'react';
import { getUserPlaylists, createPlaylist, addToPlaylist, removeFromPlaylist } from '../services/api';
import { toast } from '../hooks/useToast';

const PlaylistModal = ({ videoId, videoTitle = 'Video', onClose, initialPlaylists = [] }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlaylists, setSelectedPlaylists] = useState(new Set());
  const [creatingNew, setCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const data = await getUserPlaylists();
      setPlaylists(data);
      
      // Mark playlists that already contain this video
      const inPlaylist = new Set();
      data.forEach(playlist => {
        if (playlist.videos.includes(videoId)) {
          inPlaylist.add(playlist._id);
        }
      });
      setSelectedPlaylists(inPlaylist);
    } catch (err) {
      setError('Failed to load playlists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlaylist = async (playlistId) => {
    const isSelected = selectedPlaylists.has(playlistId);
    const playlist = playlists.find(p => p._id === playlistId);
    const playlistName = playlist?.name || 'playlist';
    
    // Optimistic update
    const newSelected = new Set(selectedPlaylists);
    if (isSelected) {
      newSelected.delete(playlistId);
    } else {
      newSelected.add(playlistId);
    }
    setSelectedPlaylists(newSelected);

    try {
      if (isSelected) {
        await removeFromPlaylist(playlistId, videoId);
        toast.info(`Removed "${videoTitle}" from "${playlistName}"`);
      } else {
        await addToPlaylist(playlistId, videoId);
        toast.success(`Successfully added "${videoTitle}" to "${playlistName}"`);
      }
    } catch (err) {
      console.error('Error toggling playlist:', err);
      toast.error(`Failed to ${isSelected ? 'remove from' : 'add to'} playlist`);
      // Revert on error
      setSelectedPlaylists(selectedPlaylists);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    
    if (!newPlaylistName.trim()) {
      setCreateError('Playlist name is required');
      return;
    }

    try {
      const newPlaylist = await createPlaylist(newPlaylistName.trim());
      
      // Add to playlists list
      setPlaylists(prev => [newPlaylist, ...prev]);
      
      // Automatically add current video to new playlist
      await addToPlaylist(newPlaylist._id, videoId);
      setSelectedPlaylists(prev => new Set([...prev, newPlaylist._id]));
      
      // Show success toast
      toast.success(`Created "${newPlaylist.name}" and added "${videoTitle}"`);
      
      // Reset form
      setNewPlaylistName('');
      setCreatingNew(false);
      setCreateError('');
    } catch (err) {
      setCreateError(err.message || 'Failed to create playlist');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">Save to Playlist</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600 mr-3"></div>
            <span className="text-gray-400">Loading playlists...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchPlaylists}
              className="text-sm text-gray-400 hover:text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Create New Playlist */}
            {creatingNew ? (
              <form onSubmit={handleCreatePlaylist} className="mb-4 p-4 bg-gray-800 rounded-lg">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => {
                    setNewPlaylistName(e.target.value);
                    setCreateError('');
                  }}
                  placeholder="Enter playlist name"
                  maxLength={100}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 mb-2"
                  autoFocus
                />
                {createError && (
                  <p className="text-red-500 text-sm mb-2">{createError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingNew(false);
                      setNewPlaylistName('');
                      setCreateError('');
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setCreatingNew(true)}
                className="w-full mb-4 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New Playlist</span>
              </button>
            )}

            {/* Playlists List */}
            {playlists.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">You don't have any playlists yet</p>
                <p className="text-gray-500 text-sm">Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-2 mb-6">
                {playlists.map((playlist) => (
                  <label
                    key={playlist._id}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlaylists.has(playlist._id)}
                      onChange={() => handleTogglePlaylist(playlist._id)}
                      className="w-5 h-5 rounded border-gray-600 text-red-600 focus:ring-red-500 focus:ring-offset-gray-900"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">{playlist.name}</p>
                      <p className="text-gray-400 text-sm">
                        {playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Done Button */}
            {!loading && (
              <div className="border-t border-gray-700 pt-4 mt-4">
                <button
                  onClick={onClose}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Done</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlaylistModal;


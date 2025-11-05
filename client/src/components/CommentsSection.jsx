import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComments, addComment, deleteComment } from '../services/api';
import { isAuthenticated, getUser } from '../services/authService';

const CommentsSection = ({ videoId }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const loggedIn = isAuthenticated();
  const currentUser = getUser();

  // Fetch initial comments
  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async (cursor = null, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await getComments(videoId, cursor, 20);
      
      if (append) {
        setComments(prev => [...prev, ...data.data]);
      } else {
        setComments(data.data || []);
      }
      
      setHasMore(data.hasMore || false);
      setNextCursor(data.nextCursor || null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      fetchComments(nextCursor, true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!loggedIn) {
      navigate('/login', { state: { from: `/watch/${videoId}` } });
      return;
    }

    if (!commentText.trim()) {
      setSubmitError('Comment cannot be empty');
      return;
    }

    if (commentText.length > 2000) {
      setSubmitError('Comment must not exceed 2000 characters');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const result = await addComment(videoId, commentText);
      
      // Optimistic update: Add new comment to top of list
      const newComment = {
        ...result.data,
        user: currentUser, // Use current user info
      };
      
      setComments(prev => [newComment, ...prev]);
      setCommentText(''); // Clear input
      
      console.log('✅ Comment added successfully');
    } catch (err) {
      console.error('Error adding comment:', err);
      setSubmitError(err.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    // Optimistic update: Remove from UI immediately
    const previousComments = [...comments];
    setComments(prev => prev.filter(c => c._id !== commentId));

    try {
      await deleteComment(commentId);
      console.log('✅ Comment deleted successfully');
    } catch (err) {
      console.error('Error deleting comment:', err);
      // Revert on error
      setComments(previousComments);
      alert('Failed to delete comment: ' + err.message);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        Comments {comments.length > 0 && `(${comments.length}${hasMore ? '+' : ''})`}
      </h2>

      {/* Comment Input */}
      {loggedIn ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {currentUser?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  setSubmitError('');
                }}
                placeholder="Add a comment..."
                rows={3}
                maxLength={2000}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
                disabled={submitting}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {commentText.length} / 2000 characters
                </span>
                <div className="flex gap-2">
                  {commentText && (
                    <button
                      type="button"
                      onClick={() => {
                        setCommentText('');
                        setSubmitError('');
                      }}
                      className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded transition-colors"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submitting}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2 rounded transition-colors"
                  >
                    {submitting ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </div>
              {submitError && (
                <p className="text-red-500 text-sm mt-2">{submitError}</p>
              )}
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8 text-center">
          <p className="text-gray-400 mb-3">Sign in to leave a comment</p>
          <button
            onClick={() => navigate('/login', { state: { from: `/watch/${videoId}` } })}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded transition-colors"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600 mr-3"></div>
          <span className="text-gray-400">Loading comments...</span>
        </div>
      ) : error ? (
        <div className="bg-gray-900 rounded-lg p-6 text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => fetchComments()}
            className="mt-3 text-sm text-gray-400 hover:text-white"
          >
            Retry
          </button>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <p className="text-gray-400">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 bg-gray-900 rounded-lg p-4">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {comment.user?.email?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              
              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <span className="text-white font-semibold text-sm">
                      {comment.user?.email || 'Unknown User'}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  
                  {/* Delete Button (only for comment owner) */}
                  {currentUser && comment.user?._id === currentUser._id && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete comment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap break-words">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 text-white px-6 py-3 rounded font-semibold transition-colors inline-flex items-center"
              >
                {loadingMore ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4"
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
                    Loading more...
                  </>
                ) : (
                  'Load More Comments'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;


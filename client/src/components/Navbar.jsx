import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getUser, logout } from '../services/authService';

const Navbar = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check authentication status
  useEffect(() => {
    setLoggedIn(isAuthenticated());
    setUser(getUser());
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
  };

  // Handle scroll effect for navbar background
  useState(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black' : 'bg-gradient-to-b from-black to-transparent'
      }`}
    >
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          {/* Netflix-style Logo */}
          <div className="text-red-600 font-bold text-2xl md:text-3xl tracking-tight">
            REACTFLIX
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-gray-300 transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={() => navigate(loggedIn ? '/upload' : '/login')}
              className="text-white hover:text-gray-300 transition-colors font-medium"
            >
              Upload
            </button>
            {loggedIn && (
              <button
                onClick={() => navigate('/playlists')}
                className="text-white hover:text-gray-300 transition-colors font-medium"
              >
                Playlists
              </button>
            )}
          </div>
        </div>

        {/* Right side - Search and Auth */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              className="bg-black bg-opacity-70 border border-gray-700 text-white px-4 py-2 pr-10 rounded w-48 md:w-64 focus:outline-none focus:border-white transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>

          {/* Auth Section */}
          {loggedIn ? (
            // Logged in - Show user menu
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors"
              >
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-800 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-800">
                    <p className="text-sm text-gray-400">Signed in as</p>
                    <p className="text-sm text-white font-semibold truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/upload');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Upload Video
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-800 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not logged in - Show login/register buttons
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/login')}
                className="text-white hover:text-gray-300 transition-colors font-medium text-sm px-4 py-2"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2 rounded transition-colors"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


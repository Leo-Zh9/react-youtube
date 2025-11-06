import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Carousel from '../components/Carousel';
import VideoCard from '../components/VideoCard';
import { getHomeData } from '../services/api';

const HomePage = () => {
  const location = useLocation();
  const [videos, setVideos] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Fetch all home data in one request (reduces API calls from 2 to 1)
  useEffect(() => {
    let isMounted = true;
    
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Single API call gets all homepage data
        const homeData = await getHomeData(100);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setVideos(homeData.allVideos || []);
          setNewReleases(homeData.newReleases || []);
        }
      } catch (err) {
        console.error('Failed to fetch home data:', err);
        if (isMounted) {
          // Show user-friendly error for rate limiting
          if (err.message.includes('Too many requests')) {
            setError('Too many requests. Please wait a moment and refresh the page.');
          } else {
            setError('Failed to load videos. Please try again later.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHomeData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  // Show upload success message if redirected from upload page
  useEffect(() => {
    if (location.state?.uploadSuccess) {
      setUploadSuccess(true);
      const videoTitle = location.state?.videoTitle || 'Your video';
      
      // Clear the success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 5000);

      // Clear the location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Handle search filtering
  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  // Filter videos based on search query
  const filterVideos = (videoList) => {
    if (!searchQuery) return videoList;
    return videoList.filter(
      (video) =>
        video.title.toLowerCase().includes(searchQuery) ||
        video.description.toLowerCase().includes(searchQuery) ||
        video.category.toLowerCase().includes(searchQuery)
    );
  };

  // Helper to parse view counts
  const parseViews = (viewsString) => {
    if (!viewsString) return 0;
    if (viewsString.endsWith('M')) return parseFloat(viewsString) * 1000000;
    if (viewsString.endsWith('K')) return parseFloat(viewsString) * 1000;
    return parseInt(viewsString) || 0;
  };

  // Organize videos by category
  const videosByCategory = useMemo(() => {
    if (!videos.length) return {};

    // Sort videos by views for trending
    const sortedByViews = [...videos].sort((a, b) => {
      return parseViews(b.views) - parseViews(a.views);
    });

    const categories = {
      featured: videos[0], // First video as featured
      trending: sortedByViews.slice(0, 10), // Top 10 most viewed
      allVideos: videos, // All videos for grid display
    };

    return categories;
  }, [videos]);

  // Memoize filtered results for performance
  const filteredTrending = useMemo(
    () => filterVideos(videosByCategory.trending || []),
    [searchQuery, videosByCategory.trending]
  );
  const filteredNewReleases = useMemo(
    () => filterVideos(newReleases),
    [searchQuery, newReleases]
  );
  const filteredAllVideos = useMemo(
    () => filterVideos(videosByCategory.allVideos || []),
    [searchQuery, videosByCategory.allVideos]
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-white text-xl">Loading videos...</p>
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
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No videos state
  if (!videos.length) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">No videos available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Navigation Bar */}
      <Navbar onSearch={handleSearch} />

      {/* Upload Success Message */}
      {uploadSuccess && (
        <div className="fixed top-20 right-4 z-50 bg-green-900 bg-opacity-90 border border-green-500 text-green-200 px-6 py-4 rounded-lg shadow-lg animate-fade-in">
          <div className="flex items-center">
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
              <p className="font-semibold">Video uploaded successfully!</p>
              <p className="text-sm">Your video is now live</p>
            </div>
            <button
              onClick={() => setUploadSuccess(false)}
              className="ml-4 text-green-200 hover:text-white"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section - Featured Video */}
      <HeroSection featuredVideo={videosByCategory.featured} />

      {/* Video Carousels */}
      <div className="relative -mt-32 md:-mt-40 z-10 space-y-8 pb-12">
        {/* Show search results message if searching */}
        {searchQuery && (
          <div className="px-4 md:px-8 lg:px-12 pt-4">
            <p className="text-white text-lg">
              Search results for: <span className="font-bold">"{searchQuery}"</span>
            </p>
          </div>
        )}

        {/* Trending Now */}
        {filteredTrending.length > 0 && (
          <Carousel title="Trending Now" videos={filteredTrending} uniqueId="trending" />
        )}

        {/* New Releases - From API */}
        {!loading && filteredNewReleases.length > 0 && (
          <Carousel title="New Releases" videos={filteredNewReleases} uniqueId="new-releases" />
        )}

        {/* All Videos Grid - YouTube Style */}
        {!searchQuery && filteredAllVideos.length > 0 && (
          <div className="px-4 md:px-8 lg:px-12 mt-12">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-6 tracking-wide">
              Browse All Videos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAllVideos.map((video) => (
                <VideoCard key={video.id || video._id} video={video} />
              ))}
            </div>
          </div>
        )}

        {/* No results message */}
        {searchQuery &&
          filteredTrending.length === 0 &&
          filteredNewReleases.length === 0 &&
          filteredAllVideos.length === 0 && (
            <div className="px-4 md:px-8 lg:px-12 text-center py-20">
              <p className="text-gray-400 text-xl">
                No videos found for "{searchQuery}"
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Try searching for something else
              </p>
            </div>
          )}
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h3 className="text-gray-400 font-semibold mb-3">Navigation</h3>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Upload
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    My List
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-400 font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-400 font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-400 font-semibold mb-3">Social</h3>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 ReactFlix. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

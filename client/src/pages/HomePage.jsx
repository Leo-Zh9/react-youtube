import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Carousel from '../components/Carousel';
import { getAllVideos } from '../services/api';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch videos from backend on component mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllVideos();
        setVideos(data);
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

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

  // Organize videos by category
  const videosByCategory = useMemo(() => {
    if (!videos.length) return {};

    const categories = {
      featured: videos.find((v) => v.id === 'featured-1') || videos[0],
      trending: videos.filter((v) => v.id.startsWith('trend-')),
      newReleases: videos.filter((v) => v.id.startsWith('new-')),
      topPicks: videos.filter((v) => v.id.startsWith('top-')),
      watchAgain: videos.filter((v) => v.id.startsWith('watch-')),
    };

    return categories;
  }, [videos]);

  // Memoize filtered results for performance
  const filteredTrending = useMemo(
    () => filterVideos(videosByCategory.trending || []),
    [searchQuery, videosByCategory.trending]
  );
  const filteredNewReleases = useMemo(
    () => filterVideos(videosByCategory.newReleases || []),
    [searchQuery, videosByCategory.newReleases]
  );
  const filteredTopPicks = useMemo(
    () => filterVideos(videosByCategory.topPicks || []),
    [searchQuery, videosByCategory.topPicks]
  );
  const filteredWatchAgain = useMemo(
    () => filterVideos(videosByCategory.watchAgain || []),
    [searchQuery, videosByCategory.watchAgain]
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
          <Carousel title="Trending Now" videos={filteredTrending} />
        )}

        {/* New Releases */}
        {filteredNewReleases.length > 0 && (
          <Carousel title="New Releases" videos={filteredNewReleases} />
        )}

        {/* Top Picks for You */}
        {filteredTopPicks.length > 0 && (
          <Carousel title="Top Picks for You" videos={filteredTopPicks} />
        )}

        {/* Watch Again */}
        {filteredWatchAgain.length > 0 && (
          <Carousel title="Watch Again" videos={filteredWatchAgain} />
        )}

        {/* No results message */}
        {searchQuery &&
          filteredTrending.length === 0 &&
          filteredNewReleases.length === 0 &&
          filteredTopPicks.length === 0 &&
          filteredWatchAgain.length === 0 && (
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

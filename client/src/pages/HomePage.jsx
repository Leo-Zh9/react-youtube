import { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Carousel from '../components/Carousel';
import {
  featuredVideo,
  trendingVideos,
  newReleases,
  topPicks,
  watchAgain,
} from '../data/mockData';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search filtering
  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  // Filter videos based on search query
  const filterVideos = (videos) => {
    if (!searchQuery) return videos;
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(searchQuery) ||
        video.description.toLowerCase().includes(searchQuery) ||
        video.category.toLowerCase().includes(searchQuery)
    );
  };

  // Memoize filtered results for performance
  const filteredTrending = useMemo(() => filterVideos(trendingVideos), [searchQuery]);
  const filteredNewReleases = useMemo(() => filterVideos(newReleases), [searchQuery]);
  const filteredTopPicks = useMemo(() => filterVideos(topPicks), [searchQuery]);
  const filteredWatchAgain = useMemo(() => filterVideos(watchAgain), [searchQuery]);

  return (
    <div className="bg-black min-h-screen">
      {/* Navigation Bar */}
      <Navbar onSearch={handleSearch} />

      {/* Hero Section - Featured Video */}
      <HeroSection featuredVideo={featuredVideo} />

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
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Upload</a></li>
                <li><a href="#" className="hover:text-white transition-colors">My List</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-400 font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-400 font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-400 font-semibold mb-3">Social</h3>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
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


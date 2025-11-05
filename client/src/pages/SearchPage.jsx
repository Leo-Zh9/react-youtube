import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchVideos, getSearchFilters } from '../services/api';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    year: '',
    sort: 'relevance',
  });
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    years: [],
    sortOptions: [],
  });

  // Get query params
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const year = searchParams.get('year') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page')) || 1;

  // Fetch available filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const data = await getSearchFilters();
        setAvailableFilters(data);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          q,
          category,
          year,
          sort,
          page,
          limit: 20,
        };

        const data = await searchVideos(params);
        setVideos(data.data || []);
        setPagination(data.pagination);
        setFilters(data.filters);
      } catch (err) {
        console.error('Error searching videos:', err);
        setError('Failed to load search results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q, category, year, sort, page]);

  // Update URL with new filters
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.q) params.set('q', newFilters.q);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.year) params.set('year', newFilters.year);
    if (newFilters.sort) params.set('sort', newFilters.sort);
    if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page);
    
    setSearchParams(params);
  };

  const handleCategoryChange = (e) => {
    updateFilters({ q, category: e.target.value, year, sort, page: 1 });
  };

  const handleYearChange = (e) => {
    updateFilters({ q, category, year: e.target.value, sort, page: 1 });
  };

  const handleSortChange = (e) => {
    updateFilters({ q, category, year, sort: e.target.value, page: 1 });
  };

  const handleClearFilters = () => {
    updateFilters({ q, category: '', year: '', sort: 'relevance', page: 1 });
  };

  const handlePageChange = (newPage) => {
    updateFilters({ q, category, year, sort, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-black to-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {q ? `Search Results for "${q}"` : 'Browse Videos'}
          </h1>
          {pagination && (
            <p className="text-gray-400">
              {pagination.total === 0 
                ? 'No results found'
                : `Found ${pagination.total} result${pagination.total !== 1 ? 's' : ''}`
              }
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Category Filter */}
            <div className="flex-1 min-w-[150px]">
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full bg-gray-800 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value="">All Categories</option>
                {availableFilters.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex-1 min-w-[150px]">
              <select
                value={year}
                onChange={handleYearChange}
                className="w-full bg-gray-800 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                <option value="">All Years</option>
                {availableFilters.years.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex-1 min-w-[150px]">
              <select
                value={sort}
                onChange={handleSortChange}
                className="w-full bg-gray-800 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer"
              >
                {q && (
                  <option value="relevance">Relevance</option>
                )}
                <option value="createdAt">Latest</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(category || year) && (
              <button
                onClick={handleClearFilters}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {(category || year) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {category && (
                <span className="bg-red-900 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  Category: {category}
                  <button
                    onClick={() => updateFilters({ q, category: '', year, sort, page: 1 })}
                    className="hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              )}
              {year && (
                <span className="bg-red-900 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  Year: {year}
                  <button
                    onClick={() => updateFilters({ q, category, year: '', sort, page: 1 })}
                    className="hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mr-3"></div>
            <span className="text-xl text-gray-400">Searching...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">No Results Found</h2>
            <p className="text-gray-400 mb-6">
              {q ? `No videos match "${q}"` : 'Try adjusting your filters'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              Browse All Videos
            </button>
          </div>
        ) : (
          <>
            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {videos.map((video) => (
                <button
                  key={video.id || video._id}
                  onClick={() => handleVideoClick(video.id || video._id)}
                  className="group text-left"
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
                  <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-red-500 transition-colors mb-1">
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-400">{video.category}</p>
                  <p className="text-xs text-gray-500">{video.views} views</p>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {[...Array(pagination.totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    // Show first, last, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded transition-colors ${
                            pageNum === page
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-800 hover:bg-gray-700 text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return <span key={pageNum} className="px-2 py-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;


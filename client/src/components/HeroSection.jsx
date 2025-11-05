const HeroSection = ({ featuredVideo }) => {
  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={featuredVideo.thumbnail}
          alt={featuredVideo.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay - Bottom to top fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        {/* Side gradient for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex items-end md:items-center px-4 md:px-12 lg:px-16 pb-24 md:pb-32">
        <div className="max-w-2xl space-y-4 md:space-y-6">
          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white">
            {featuredVideo.title}
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-200 line-clamp-3 md:line-clamp-4">
            {featuredVideo.description}
          </p>

          {/* Buttons */}
          <div className="flex space-x-3 md:space-x-4 pt-2">
            {/* Play Button */}
            <button className="flex items-center space-x-2 bg-white text-black px-6 md:px-8 py-2.5 md:py-3 rounded-sm font-bold hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl">
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              <span className="text-base md:text-lg">Play</span>
            </button>

            {/* More Info Button */}
            <button className="flex items-center space-x-2 bg-gray-800 bg-opacity-80 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-sm font-semibold hover:bg-gray-700 transition-all border border-gray-700 hover:border-gray-600">
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-base md:text-lg">More Info</span>
            </button>
          </div>

          {/* Meta Information */}
          <div className="flex items-center space-x-3 text-sm text-gray-400 pt-2 font-medium">
            <span className="px-2.5 py-0.5 border border-gray-600 text-gray-300 rounded-sm">
              {featuredVideo.rating || 'PG-13'}
            </span>
            <span>{featuredVideo.year || '2024'}</span>
            <span>•</span>
            <span>{featuredVideo.duration || '2h 15m'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;


import { useState } from 'react';

const VideoCard = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group cursor-pointer transition-all duration-300 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Thumbnail */}
      <div
        className={`relative overflow-hidden rounded-md transition-all duration-300 ${
          isHovered ? 'scale-110 z-10' : 'scale-100'
        }`}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-36 md:h-40 object-cover"
        />

        {/* Hover Overlay with Play Icon */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center transition-opacity duration-300">
            <div className="bg-white bg-opacity-30 rounded-full p-3 backdrop-blur-sm">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
          {video.duration || '12:34'}
        </div>
      </div>

      {/* Video Info - Shows on hover */}
      {isHovered && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900 rounded-b-md p-3 shadow-xl z-20 transition-all duration-300">
          <h4 className="text-white font-semibold text-sm mb-1 line-clamp-1">
            {video.title}
          </h4>
          <p className="text-gray-400 text-xs mb-2 line-clamp-2">
            {video.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Play button */}
              <button className="p-1.5 bg-white rounded-full hover:bg-gray-200 transition-colors">
                <svg
                  className="w-3 h-3 text-black"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
              {/* Add to list button */}
              <button className="p-1.5 border-2 border-gray-500 rounded-full hover:border-white transition-colors">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
            <span className="text-xs text-gray-400">{video.views || '1.2M'} views</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;


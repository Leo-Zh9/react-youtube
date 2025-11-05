import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThumbnailUrl, handleImageError } from '../utils/imageUtils';

const VideoCard = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/watch/${video.id}`);
  };

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Video Thumbnail Container */}
      <div className="relative overflow-hidden rounded-sm mb-2 bg-gray-900">
        <div className="aspect-video relative">
          <img
            src={getThumbnailUrl(video.thumbnail)}
            alt={video.title}
            onError={handleImageError}
            className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-75"
          />
          
          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
            {/* Play Button - Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 ease-out">
                <svg
                  className="w-5 h-5 text-white ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-1.5 right-1.5 bg-black bg-opacity-90 text-white text-xs font-medium px-1.5 py-0.5 rounded-sm">
            {video.duration || '0:00'}
          </div>
        </div>
      </div>

      {/* Video Title - Always Visible */}
      <h3 className="text-sm font-medium text-white mb-1 line-clamp-2 leading-tight group-hover:text-gray-300 transition-colors duration-200">
        {video.title}
      </h3>
      
      {/* Video Metadata */}
      <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-200">
        {video.views || '0'} views
      </p>
    </div>
  );
};

export default VideoCard;

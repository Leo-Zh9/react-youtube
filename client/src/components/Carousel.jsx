import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import VideoCard from './VideoCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Carousel = ({ title, videos, uniqueId = 'default' }) => {
  // Generate unique class names for this carousel instance to prevent conflicts
  const prevClass = `swiper-button-prev-${uniqueId}`;
  const nextClass = `swiper-button-next-${uniqueId}`;

  return (
    <div className="mb-12 md:mb-16">
      {/* Section Title */}
      <h2 className="text-lg md:text-xl font-semibold text-white mb-3 px-4 md:px-8 lg:px-12 tracking-wide">
        {title}
      </h2>

      {/* Carousel Container */}
      <div className="relative group px-4 md:px-8 lg:px-12">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={12}
          slidesPerView={2}
          navigation={{
            nextEl: `.${nextClass}`,
            prevEl: `.${prevClass}`,
          }}
          breakpoints={{
            640: {
              slidesPerView: 3,
              spaceBetween: 12,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 16,
            },
            1280: {
              slidesPerView: 6,
              spaceBetween: 16,
            },
          }}
          className="mySwiper"
        >
          {videos.map((video) => (
            <SwiperSlide key={video.id || video._id}>
              <VideoCard video={video} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons - Netflix Style - Unique per carousel */}
        <div className={`${prevClass} absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-black to-transparent flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 hover:w-16`}>
          <svg
            className="w-10 h-10 text-white drop-shadow-lg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div className={`${nextClass} absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-black to-transparent flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 hover:w-16`}>
          <svg
            className="w-10 h-10 text-white drop-shadow-lg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Carousel;

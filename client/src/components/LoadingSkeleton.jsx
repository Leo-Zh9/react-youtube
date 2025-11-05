// Loading skeleton components for consistent loading states

export const VideoCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-video bg-gray-800 rounded-lg mb-2"></div>
    <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-800 rounded w-1/2"></div>
  </div>
);

export const CarouselSkeleton = () => (
  <div className="mb-8">
    <div className="h-8 bg-gray-800 rounded w-48 mb-4 animate-pulse"></div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {[...Array(6)].map((_, idx) => (
        <VideoCardSkeleton key={idx} />
      ))}
    </div>
  </div>
);

export const VideoPlayerSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-video bg-gray-800 rounded-lg mb-4"></div>
    <div className="h-8 bg-gray-800 rounded w-3/4 mb-4"></div>
    <div className="flex gap-4 mb-6">
      <div className="h-10 bg-gray-800 rounded w-24"></div>
      <div className="h-10 bg-gray-800 rounded w-32"></div>
      <div className="h-10 bg-gray-800 rounded w-24"></div>
    </div>
    <div className="bg-gray-900 rounded-lg p-6 mb-8">
      <div className="h-6 bg-gray-800 rounded w-32 mb-3"></div>
      <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-800 rounded w-5/6"></div>
    </div>
  </div>
);

export const CommentSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex gap-3 mb-4">
      <div className="w-10 h-10 bg-gray-800 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-800 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-800 rounded w-4/5"></div>
      </div>
    </div>
  </div>
);

export const CommentsSkeleton = () => (
  <div>
    <div className="h-6 bg-gray-800 rounded w-32 mb-4 animate-pulse"></div>
    {[...Array(3)].map((_, idx) => (
      <CommentSkeleton key={idx} />
    ))}
  </div>
);

export const HeroSkeleton = () => (
  <div className="relative h-[70vh] animate-pulse">
    <div className="absolute inset-0 bg-gray-800"></div>
    <div className="relative z-10 h-full flex items-center px-4 md:px-8">
      <div className="max-w-2xl">
        <div className="h-12 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6 mb-6"></div>
        <div className="flex gap-4">
          <div className="h-12 bg-gray-700 rounded w-32"></div>
          <div className="h-12 bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    </div>
  </div>
);


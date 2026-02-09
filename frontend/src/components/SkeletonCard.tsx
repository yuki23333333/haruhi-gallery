import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="relative mb-6">
      {/* Image placeholder */}
      <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-white/40 to-white/20 relative overflow-hidden">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      </div>

      {/* Title placeholder */}
      <div className="mt-3 px-1">
        <div className="h-4 bg-white/30 rounded w-3/4 mb-2 animate-pulse" />
        <div className="h-3 bg-white/20 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
};

export default SkeletonCard;

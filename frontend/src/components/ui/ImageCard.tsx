import React from 'react';
import { motion } from 'framer-motion';

interface ImageCardProps {
  id: number;
  url: string;
  title: string;
  category?: string;
  likes?: number;
  uploader_name?: string;
  uploader_avatar_url?: string;
  uploader_type?: string;
  activeId?: number | null;
  onSelect?: (id: number) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  id,
  url,
  title,
  category = 'image',
  likes = 0,
  uploader_name = 'Unknown',
  uploader_avatar_url,
  uploader_type = 'user',
  activeId,
  onSelect
}) => {
  const fullUrl = url.startsWith('http') ? url : `http://localhost:8081${url}`;

  const handleClick = () => {
    if (onSelect) {
      onSelect(id);
    }
  };

  // When this card is active, hide it visually but keep it in DOM for layout animation
  const isHidden = activeId === id;

  return (
    <motion.div
      layoutId={`card-${id}`}
      onClick={handleClick}
      className="break-inside-avoid mb-2 cursor-pointer group"
      whileHover={{ y: -4 }}
      animate={{
        opacity: isHidden ? 0 : 1,
        scale: isHidden ? 0.95 : 1
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      style={{
        // Keep element in DOM layout even when hidden
        pointerEvents: isHidden ? 'none' : 'auto'
      }}
    >
      {/* Card Container - Glass Morphism */}
      <div className="relative overflow-hidden rounded-2xl bg-white/30 backdrop-blur-xl border-[0.5px] border-white/50 shadow-2xl">
        {/* Image - Shared layout animation with DetailOverlay */}
        <motion.img
          layoutId={`image-${id}`}
          src={fullUrl}
          alt={title}
          className="w-full h-auto object-cover block transition-transform duration-500 group-hover:scale-105"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          style={{ opacity: isHidden ? 0 : 1, visibility: 'visible' }}
        />

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Title with ZCOOL KuaiLe font */}
            <h3 className="text-white text-lg font-medium mb-2 font-zcool truncate">
              {title}
            </h3>

            {/* Metadata */}
            <div className="flex items-center justify-between">
              {/* Uploader Info */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/30">
                  {uploader_avatar_url ? (
                    <img
                      src={uploader_avatar_url}
                      alt={uploader_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xs font-medium">
                      {uploader_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-white text-sm font-zcool">
                    {uploader_name}
                  </span>
                  <span className="text-white/60 text-xs capitalize">
                    {uploader_type}
                  </span>
                </div>
              </div>

              {/* Likes */}
              {likes > 0 && (
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/30">
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="#ff3b30"
                    stroke="#ff3b30"
                    strokeWidth={2}
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className="text-white text-xs font-semibold">{likes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Like Button - Heart Icon */}
        <div className="absolute top-2 right-2 z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle like functionality here
            }}
            className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 shadow-sm hover:bg-white/30 transition-all"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageCard;

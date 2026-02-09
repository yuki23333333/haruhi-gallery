import React from 'react';
import { motion } from 'framer-motion';
import type { ImageData } from '../../types';
import { useActiveImage } from '../../contexts/ActiveImageContext';

interface ImageCardProps {
  url: string;
  title: string;
  id: number;
  index: number;
  imageData?: ImageData;
}

const ImageCard: React.FC<ImageCardProps> = ({ url, title, id, index, imageData }) => {
  const fullUrl = url.startsWith('http') ? url : `http://localhost:8081${url}`;
  const { setActiveImage } = useActiveImage();

  const handleClick = () => {
    if (imageData) {
      setActiveImage(imageData);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05, // Stagger effect
        type: "spring",
        stiffness: 150,
        damping: 28
      }}
      onClick={handleClick}
      className="relative z-20 mb-6 break-inside-avoid cursor-pointer"
      whileHover={{ y: -4 }}
    >
      {/* Card Container - Glass Effect */}
      <div className="relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-sm shadow-lg">
        {/* Image with Shared Element Transition - CRITICAL: layoutId matches overlay */}
        <motion.img
          layoutId={`image-${id}`}
          src={fullUrl}
          alt={title}
          className="w-full h-auto object-cover relative z-20"
          transition={{
            type: "spring",
            stiffness: 150,  // 更快的过渡
            damping: 28,      // 略高的阻尼
            mass: 1.2         // 更轻的质量
          }}
          style={{ opacity: 1, visibility: 'visible' }}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white text-sm font-medium truncate font-zcool">
              {title}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageCard;

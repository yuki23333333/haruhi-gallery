import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCard from './ImageCard';
import type { ImageData } from '../../types';

interface MasonryGridProps {
  images: ImageData[];
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ images }) => {
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-400 text-lg font-zcool">暂无图片</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {images.map((image, index) => (
            <ImageCard
              key={image.id}
              url={image.url}
              title={image.title}
              id={image.id}
              index={index}
              imageData={image}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MasonryGrid;

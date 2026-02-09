import React from 'react';
import { motion } from 'framer-motion';
import LiquidGlass from './LiquidGlass';

interface FloatingUploadButtonProps {
  onClick: () => void;
}

const FloatingUploadButton: React.FC<FloatingUploadButtonProps> = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-8 z-30"
    >
      <LiquidGlass className="w-16 h-16 flex items-center justify-center shadow-lg">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-apple-text"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </LiquidGlass>
    </motion.button>
  );
};

export default FloatingUploadButton;

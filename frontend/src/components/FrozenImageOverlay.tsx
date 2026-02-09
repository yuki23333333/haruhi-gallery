import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveImage } from '../contexts/ActiveImageContext';
import { useLocation } from 'react-router-dom';

interface FrozenImageOverlayProps {
  imageUrl: string;
  imageId: number;
  imageTitle: string;
}

const FrozenImageOverlay: React.FC = () => {
  const { activeImage, setActiveImage } = useActiveImage();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  // Show overlay when we have an active image and not on image detail page
  const showOverlay = activeImage !== null && !location.pathname.startsWith('/image/');

  // Clear active image when route changes to detail page
  useEffect(() => {
    if (location.pathname.startsWith('/image/') && activeImage !== null) {
      // Keep overlay visible for a moment during transition
      const timer = setTimeout(() => {
        setActiveImage(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, activeImage, setActiveImage]);

  // Track mount state
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!showOverlay || !mounted) return null;

  const activeImageId = activeImage?.id ?? null;

  return (
    <AnimatePresence>
      {activeImageId !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[10000] pointer-events-none"
          style={{
            // This overlay will hold the "frozen" image
            // The actual image will be rendered via a portal-like mechanism
          }}
        >
          {/* The frozen image will be positioned here */}
          <div id={`frozen-image-${activeImageId}`} className="w-full h-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FrozenImageOverlay;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import SOSLogo from './SOSLogo';

interface HeroEntranceProps {
  onComplete: () => void;
}

const HeroEntrance: React.FC<HeroEntranceProps> = ({ onComplete }) => {
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    // Start disappearance after 2 seconds
    const timer = setTimeout(() => {
      setShowContent(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Call onComplete when animation finishes
    if (!showContent) {
      const finishTimer = setTimeout(onComplete, 800);
      return () => clearTimeout(finishTimer);
    }
  }, [showContent, onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-apple-bg z-50">
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={{
              initial: {
                opacity: 0,
                scale: 0.3,
                y: 50,
                transition: {
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  mass: 0.8,
                },
              },
              animate: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  mass: 0.8,
                },
              },
              exit: {
                opacity: 0,
                scale: 1.1,
                y: -30,
                filter: 'blur(20px)',
                transition: {
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1],
                },
              },
            }}
          >
            <LiquidGlass className="px-16 py-12">
              <SOSLogo />
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroEntrance;

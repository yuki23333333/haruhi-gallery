import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidGlass from './LiquidGlass';
import SOSLogo from './SOSLogo';

interface SplashScreenProps {
  children: React.ReactNode;
}

/**
 * Global splash screen component that manages the SOS entrance animation.
 * The animation plays only once per browser session using sessionStorage.
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ children }) => {
  const [showSplash, setShowSplash] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if this is the first visit in this session
    const hasVisited = sessionStorage.getItem('app_visited');

    if (!hasVisited) {
      // First visit - show splash screen
      setShowSplash(true);
    } else {
      // Not first visit - skip splash screen
      setShowSplash(false);
    }

    // Mark as ready to render children
    setIsReady(true);
  }, []);

  // Handle splash screen animation completion
  useEffect(() => {
    if (!showSplash) return;

    // Start exit animation after 2 seconds
    const timer = setTimeout(() => {
      setShowContent(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [showSplash]);

  // Mark as visited and finish splash screen
  useEffect(() => {
    if (showSplash && !showContent) {
      // Wait for exit animation to complete (0.8s)
      const timer = setTimeout(() => {
        sessionStorage.setItem('app_visited', 'true');
        setShowSplash(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [showSplash, showContent]);

  // Don't render anything until we've checked sessionStorage
  if (!isReady) {
    return null;
  }

  return (
    <>
      {/* Splash Screen Overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[100]"
            style={{
              background: 'linear-gradient(to bottom right, #F2F2F2, #E8EEDC, #D1D8C5)'
            }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App Content */}
      {children}
    </>
  );
};

export default SplashScreen;

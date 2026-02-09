import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionLayoutProps {
  children: React.ReactNode;
}

// Page slide variants for route transitions
const pageVariants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96], // Custom easing for smooth sliding
    },
  },
  exit: {
    x: '-20%',
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

const PageTransitionLayout: React.FC<PageTransitionLayoutProps> = ({ children }) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransitionLayout;

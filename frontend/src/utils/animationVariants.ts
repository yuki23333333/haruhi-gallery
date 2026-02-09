/**
 * Shared animation variants for page entry effects
 * Used across Gallery, User Profile, and other pages for consistent animations
 * Optimized for "slower, silkier" transitions with inverse exit animations
 */

import type { Variants } from 'framer-motion';

// Container variants - controls the stagger timing for child elements
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Increased interval for more pronounced domino effect
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05, // Slightly faster on exit, but still organized
      staggerDirection: -1, // Reverse exit: disappear from last to first
    },
  },
};

// Item variants - individual element fade-up animation with blur
export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50, // Start from below (increased from 20)
    filter: "blur(10px)", // Add blur for "atmospheric" feel
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 60, // Reduced stiffness (from 100+) for slower, gentler motion
      damping: 20,    // Prevent excessive bounce
      mass: 1.2,      // Add mass for heavier, more deliberate feel
    },
  },
  exit: {
    opacity: 0,
    y: 50, // Exit: sink back down (inverse of entry)
    filter: "blur(10px)",
    transition: {
      duration: 0.6, // Longer exit time
      ease: [0.43, 0.13, 0.23, 0.96], // Elegant bezier curve
    },
  },
};

// Text variants - slightly faster animation for text elements
export const textVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: "blur(5px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 18,
      mass: 1,
    },
  },
  exit: {
    opacity: 0,
    y: 30,
    filter: "blur(5px)",
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

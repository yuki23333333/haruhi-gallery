import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LoginPage from '../pages/LoginPage';
import UserProfilePage from '../pages/UserProfilePage';
import ImageDetailPage from '../pages/ImageDetailPage';
import MusicPage from '../pages/MusicPage';
import AppContent from './AppContent';

// Page variants - ONLY control background, don't affect shared elements
const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <LoginPage />
          </motion.div>
        } />
        <Route path="/user/:id" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <UserProfilePage />
          </motion.div>
        } />
        <Route path="/image/:id" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <ImageDetailPage />
          </motion.div>
        } />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/*" element={
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <AppContent />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import WhiteCard from './ui/WhiteCard';
import AppleButton from './ui/AppleButton';
import GalleryList from './GalleryList';
import FloatingUploadButton from './FloatingUploadButton';
import UploadModal from './UploadModal';

// Content slide animation variants - Only for text, buttons, cards (not images)
const contentVariants = {
  initial: {
    x: 0,
    opacity: 1,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  },
  exit: {
    x: "-100%",  // Slide content to the left
    opacity: 0.5,
    transition: {
      duration: 0.8,
      ease: [0.4, 0.0, 0.2, 1]
    }
  },
};

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenUploadModal = () => {
    if (!user) {
      showToast('请先登录', 'error');
      setTimeout(() => {
        navigate('/auth');
      }, 1000);
      return;
    }
    setUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
  };

  const handleUploadSuccess = () => {
    setGalleryRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <motion.div
        className="min-h-screen relative"
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Layer Z-0: Atmospheric Background - Conditional Rendering */}
        {location.pathname === '/' || location.pathname.startsWith('/auth') ? (
          /* ============================================ */
          /* SCENARIO A: Homepage - Morandi/Pale Moss Gradient */
          /* ============================================ */
          <>
            {/* Layer 1: Base gradient - Custom hex values */}
            <div
              className="fixed inset-0 z-[-1]"
              style={{
                background: 'linear-gradient(to bottom right, #F2F2F2, #E8EEDC, #D1D8C5)'
              }}
            />

            {/* Layer 2: White overlay with extreme blur - Creates misty/foggy effect */}
            <div className="fixed inset-0 z-[-1] bg-white/20 backdrop-blur-[100px]" />
          </>
        ) : (
          /* ============================================ */
          /* SCENARIO B: Profile pages - Original Twilight */
          /* ============================================ */
          <div
            className="
              fixed inset-0 z-[-1]
              bg-[url('/IMG_0871.JPG')] bg-cover bg-center bg-no-repeat
              blur-2xl brightness-110
              transition-all duration-500
            "
          >
            {/* Original white overlay for profile pages */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl" />
          </div>
        )}
        {/* Header */}
        <header className="pt-12 pb-8 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <WhiteCard padding="sm" className="inline-block">
                <h1 className="text-2xl font-bold text-apple-text tracking-tight">
                  SOS 团
                </h1>
              </WhiteCard>

              {/* Navigation Links */}
              <nav className="flex gap-2">
                <AppleButton
                  variant={location.pathname === '/' ? 'primary' : 'secondary'}
                  size="md"
                  onClick={() => navigate('/')}
                >
                  画廊
                </AppleButton>
                <AppleButton
                  variant={location.pathname === '/music' ? 'primary' : 'secondary'}
                  size="md"
                  onClick={() => navigate('/music')}
                >
                  HipHop
                </AppleButton>
              </nav>
            </div>

            {/* User Info & Login/Logout */}
            <WhiteCard padding="md" className="px-6 py-3 flex items-center gap-4">
              {user ? (
                <>
                  <button
                    onClick={() => navigate(`/user/${user.id}`)}
                    className="flex-shrink-0"
                  >
                    {user?.avatar_url && (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white/40 hover:scale-105 transition-transform cursor-pointer"
                      />
                    )}
                  </button>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-apple-text">{user?.username}</p>
                    <p className="text-xs text-apple-text/60">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-apple-text/10 hover:bg-apple-text/20 rounded-xl text-apple-text text-sm font-semibold transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="px-6 py-2.5 bg-apple-text hover:bg-apple-text/90 rounded-xl text-white text-sm font-semibold transition-colors shadow-lg shadow-black/10"
                >
                  登录 / 注册
                </button>
              )}
            </WhiteCard>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Gallery */}
            <section>
              <GalleryList
                key={galleryRefreshKey}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
              />
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <WhiteCard padding="md" className="inline-block">
              <p className="text-sm text-apple-text/50">
                © 2025 SOS 团画廊. 保留所有权利.
              </p>
            </WhiteCard>
          </div>
        </footer>

        {/* Floating Upload Button */}
        <FloatingUploadButton onClick={handleOpenUploadModal} />
      </motion.div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={handleCloseUploadModal}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
};

export default AppContent;

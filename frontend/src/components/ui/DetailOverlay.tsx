import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ImageData } from '../../types';
import { convertToIframe } from '../../utils/musicPlayer';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useLikeStore } from '../../store/likeStore';

interface DetailOverlayProps {
  image: ImageData | null;
  onClose: () => void;
}

const DetailOverlay: React.FC<DetailOverlayProps> = ({ image, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Global like state from Zustand
  const { likedByMap, likesMap, syncImageLikes, toggleLike } = useLikeStore();

  // Music player state
  const [showPlayer, setShowPlayer] = useState(false);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (image) {
      document.body.style.overflow = 'hidden';
      setShowPlayer(false); // Reset player state when image changes

      // Sync image data to global store
      // Backend sends is_liked boolean, we convert it to liked_by array for global store
      if (user && image.is_liked !== undefined && image.likes !== undefined) {
        const likedBy = image.is_liked ? [user.id] : [];
        syncImageLikes(image.id, likedBy, image.likes);
        console.log('[DetailOverlay] Synced likes from backend', {
          imageId: image.id,
          is_liked: image.is_liked,
          likedBy,
          likes: image.likes
        });
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [image, user, syncImageLikes]);

  // Get current like status and count from global store
  const currentIsLiked = image && user ? (likedByMap[image.id] || []).includes(user.id) : false;
  const currentLikes = image ? (likesMap[image.id] ?? image.likes ?? 0) : 0;

  // Handle like action
  const handleLike = async () => {
    if (!image) return;
    if (!user) {
      showToast('请先登录', 'error');
      return;
    }

    try {
      // Use global store's toggleLike method
      await toggleLike(image.id, user.id);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      showToast('操作失败', 'error');
    }
  };

  // Handle uploader click
  const handleUploaderClick = () => {
    if (!image) return;
    if (image.uploader_id) {
      navigate(`/user/${image.uploader_id}`);
      onClose();
    }
  };

  if (!image) return null;

  const fullUrl = image.url.startsWith('http') ? image.url : `http://localhost:8081${image.url}`;
  const isMusic = image.category === 'hiphop';

  // Prepare iframe HTML for music player
  const iframeHtml = React.useMemo(() => {
    if (isMusic && image.redirect_url) {
      return convertToIframe(image.redirect_url);
    }
    return '';
  }, [image, isMusic]);

  // Use description as fallback for iframe if redirect_url is empty
  const descriptionIframe = React.useMemo(() => {
    if (isMusic && image.description && !iframeHtml) {
      return image.description;
    }
    return '';
  }, [image.description, iframeHtml, isMusic]);

  return (
    <AnimatePresence>
      {/* Backdrop - Black semi-transparent with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-hidden"
        onClick={onClose}
      >
        {/* Backdrop overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Main Content Container - Flex Layout for Image + Panel */}
        <div
          className="relative z-10 w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row gap-3 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left/Top Section: Image - SHARED ELEMENT TRANSITION */}
          <div className="flex-[2] flex items-center justify-center min-h-0 overflow-hidden">
            <motion.div
              className="relative w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 28,
              }}
            >
              {/* Image with layoutId for smooth expansion */}
              <motion.img
                layoutId={`image-${image.id}`}
                src={fullUrl}
                alt={image.title}
                className="w-full h-auto object-contain rounded-3xl shadow-2xl max-h-[85vh]"
                transition={{
                  type: "spring",
                  stiffness: 150,  // 提高刚度：更快
                  damping: 28,      // 稍高阻尼：减少回弹时间
                  mass: 1.2         // 略微降低质量：更快响应
                }}
              />

              {/* Close Button - Floating above image */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.3, duration: 0.2 }}
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors shadow-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </motion.div>
          </div>

          {/* Right/Bottom Section: Glass Info Panel - SIDE FLY-IN ANIMATION */}
          <motion.div
            // Initial state: from right side, invisible
            initial={{ x: 60, opacity: 0 }}
            // Animate state: slide in to position, visible
            animate={{ x: 0, opacity: 1 }}
            // Exit state: slide out to right
            exit={{ x: 60, opacity: 0 }}
            // Transition with delay - KEY TIMING CONTROL
            transition={{
              type: "spring",
              stiffness: 150,    // 提高刚度：更快
              damping: 22,        // 稍低阻尼：保持一些弹性
              delay: 0.25         // 减少延迟：0.3s → 0.25s
            }}
            // Glass morphism styling
            className="flex-[1] bg-white/5 backdrop-blur-[2px] border border-white/10 shadow-lg rounded-2xl p-6 overflow-y-auto max-h-[85vh]"
          >
            {/* Content - All text with ZCOOL KuaiLe font */}
            <div className="space-y-4">
              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-zcool">
                {image.title}
              </h2>

              {/* Music Player Embed (for HipHop category) */}
              {isMusic && image.description && (
                <div className="bg-white/15 rounded-xl p-4 backdrop-blur-[1px] border border-white/5">
                  <p className="text-xs text-gray-500 mb-2 font-zcool">音乐播放器</p>
                  <div
                    dangerouslySetInnerHTML={{ __html: image.description }}
                    className="w-full"
                  />
                </div>
              )}

              {/* Regular Description (non-music) */}
              {!isMusic && image.description && (
                <div className="bg-white/15 rounded-xl p-4 backdrop-blur-[1px] border border-white/5">
                  <p className="text-sm text-gray-700 leading-relaxed font-zcool">
                    {image.description}
                  </p>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div className="bg-white/15 rounded-xl p-3 backdrop-blur-[1px] border border-white/5">
                  <p className="text-xs text-gray-500 mb-1 font-zcool">类别</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize font-zcool">
                    {image.category}
                  </p>
                </div>

                {/* Likes - Clickable */}
                <div
                  className="bg-white/15 rounded-xl p-3 backdrop-blur-[1px] border border-white/5 cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                  }}
                >
                  <p className="text-xs text-gray-500 mb-1 font-zcool">点赞</p>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill={currentIsLiked ? "#ff3b30" : "none"}
                      stroke={currentIsLiked ? "#ff3b30" : "currentColor"}
                      strokeWidth={2}
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900 font-zcool">
                      {currentLikes}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploader Info - Clickable */}
              <div
                className="flex items-center gap-3 bg-white/15 rounded-xl p-4 backdrop-blur-[1px] border border-white/5 cursor-pointer hover:bg-white/20 transition-colors"
                onClick={handleUploaderClick}
              >
                <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-[1px] flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
                  {image.uploader_avatar_url ? (
                    <img
                      src={image.uploader_avatar_url}
                      alt={image.uploader_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-lg font-semibold font-zcool">
                      {image.uploader_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-900 font-zcool truncate">
                    {image.uploader_name}
                  </span>
                  <span className="text-xs text-gray-500 capitalize font-zcool">
                    {image.uploader_type}
                  </span>
                </div>
              </div>

              {/* Created Date */}
              <div className="text-center pt-2 border-t border-white/5">
                <p className="text-xs text-gray-400 font-zcool">
                  {new Date(image.created_at).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {/* Play Music Button - for HipHop category with player */}
                {isMusic && (image.redirect_url || image.description) && (
                  <button
                    onClick={() => setShowPlayer(!showPlayer)}
                    className="w-full"
                  >
                    <div className="bg-white/15 hover:bg-white/20 backdrop-blur-[1px] border border-white/5 rounded-xl p-3 flex items-center justify-center gap-2 transition-all duration-200 group">
                      <svg
                        className={`w-4 h-4 text-gray-700 group-hover:text-gray-900 transition-all ${showPlayer ? 'rotate-90' : ''}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 font-zcool transition-colors">
                        {showPlayer ? '收起播放器' : '播放音乐'}
                      </span>
                    </div>
                  </button>
                )}

                {/* External Link Button - for non-music images with redirect_url */}
                {!isMusic && image.redirect_url && (
                  <a
                    href={image.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <div className="bg-white/15 hover:bg-white/20 backdrop-blur-[1px] border border-white/5 rounded-xl p-3 flex items-center justify-center gap-2 transition-all duration-200 group">
                      <svg
                        className="w-4 h-4 text-gray-700 group-hover:text-gray-900 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 font-zcool transition-colors">
                        打开外链
                      </span>
                    </div>
                  </a>
                )}
              </div>

              {/* Music Player - Embedded in bottom of right panel */}
              {isMusic && showPlayer && (iframeHtml || descriptionIframe) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pt-4"
                >
                  <div className="bg-white/10 backdrop-blur-[1px] border border-white/5 rounded-xl p-4">
                    <div
                      dangerouslySetInnerHTML={{ __html: iframeHtml || descriptionIframe }}
                      className="w-full overflow-hidden"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DetailOverlay;

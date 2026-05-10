import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useActiveImage } from '../contexts/ActiveImageContext';
import LiquidGlass from '../components/LiquidGlass';
import { deleteImage } from '../utils/api';
import type { ImageData } from '../types';
import { api } from '../lib/apiClient';

// Content slide animation variants - Only for text, buttons, cards (not images)
const detailContentVariants = {
  initial: {
    x: "100%",   // Start from right
    opacity: 0,
  },
  animate: {
    x: 0,        // Slide into position
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.4, 0.0, 0.2, 1]
    }
  },
  exit: {
    x: "100%",   // Exit to right
    opacity: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0.0, 0.2, 1]
    }
  },
};

const ImageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { setActiveImage } = useActiveImage();
  const navigate = useNavigate();
  const [image, setImage] = useState<ImageData | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<ImageData | null>(null);

  // Clear active image ID when detail page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveImage(null);
    }, 300); // Clear after animation starts
    return () => clearTimeout(timer);
  }, [id, setActiveImage]);

  React.useEffect(() => {
    const fetchImage = async () => {
      try {
        const data = await api.images.getById(parseInt(id || '0'));
        setImage(data.data);
      } catch (error) {
        console.error('Failed to fetch image:', error);
      }
    };

    fetchImage();
  }, [id]);

  // Create a preview image object for immediate rendering with layoutId
  React.useEffect(() => {
    if (id && !image) {
      // Use a basic placeholder structure to maintain layoutId during loading
      setPreviewImage({
        id: parseInt(id),
        url: '',
        title: '',
        category: '',
        likes: 0,
        created_at: '',
        uploader_name: '',
        uploader_type: '',
        uploader_id: 0
      });
    }
  }, [id, image]);

  // Use actual image when loaded, otherwise use preview
  const displayImage = image || previewImage;

  if (!displayImage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-apple-text/60">图片不存在</div>
      </div>
    );
  }

  const isOwner = user && displayImage.uploader_id && user.id === displayImage.uploader_id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `${window.location.origin}${displayImage.url}`;
    link.download = displayImage.title || `image-${displayImage.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/image/${displayImage.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleDeleteImage = async () => {
    const confirmed = window.confirm('确定要删除这张图片吗？此操作无法撤销。');
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await deleteImage(displayImage.id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete image:', error);
      const errorMessage = error instanceof Error ? error.message : '删除失败，请重试';
      alert(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-transparent">
      {/* Header - Animated */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        variants={detailContentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="max-w-7xl mx-auto">
          <LiquidGlass className="inline-flex items-center gap-4 px-6 py-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-apple-text hover:opacity-70 transition-opacity"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span className="font-medium">返回</span>
            </Link>
            <div className="w-px h-6 bg-apple-text/20" />
            <h1 className="text-lg font-semibold text-apple-text truncate">
              {displayImage.title}
            </h1>
          </LiquidGlass>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Image Container */}
            <div className="lg:w-2/3">
              <LiquidGlass className="p-8">
                {/* Shared Element - Morph animation from grid */}
                {displayImage.url && (
                  <motion.img
                    layoutId={`image-${String(displayImage.id)}`}
                    src={displayImage.url}
                    alt={displayImage.title}
                    className="w-full h-auto rounded-2xl shadow-2xl z-50 relative"
                    transition={{
                      duration: 0.5,
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                    style={{ opacity: 1, visibility: 'visible' }}
                  />
                )}
                {!displayImage.url && (
                  <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <p className="text-gray-400">图片地址无效</p>
                  </div>
                )}
              </LiquidGlass>
            </div>

            {/* Right: Metadata - Animated */}
            <motion.div
              className="lg:w-1/3"
              variants={detailContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="sticky top-28 space-y-6">
                {/* Title Card */}
                <LiquidGlass className="p-6">
                  <h2 className="text-3xl font-bold text-apple-text mb-4">
                    {displayImage.title}
                  </h2>

                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block bg-apple-text/10 px-4 py-2 rounded-full text-sm font-medium text-apple-text capitalize">
                      {displayImage.category}
                    </span>
                  </div>

                  {/* Upload Date */}
                  {displayImage.created_at && (
                    <div className="text-sm text-apple-text/60">
                      上传于 {formatDate(displayImage.created_at)}
                    </div>
                  )}
                </LiquidGlass>

                {/* Uploader Card */}
                <Link
                  to={displayImage.uploader_id ? `/user/${displayImage.uploader_id}` : '#'}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <LiquidGlass className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
                        {displayImage.uploader_avatar_url ? (
                          <img
                            src={displayImage.uploader_avatar_url}
                            alt={displayImage.uploader_name || 'Uploader'}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>{displayImage.uploader_name?.charAt(0).toUpperCase() || '?'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-apple-text truncate">
                          {displayImage.uploader_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-apple-text/60 capitalize">
                          {displayImage.uploader_type || 'User'}
                        </div>
                      </div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-apple-text/40 flex-shrink-0"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </LiquidGlass>
                </Link>

                {/* Likes Card */}
                {displayImage.likes !== undefined && displayImage.likes > 0 && (
                  <LiquidGlass className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="#ff3b30"
                          stroke="#ff3b30"
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-apple-text">
                          {displayImage.likes}
                        </div>
                        <div className="text-xs text-apple-text/60">喜欢</div>
                      </div>
                    </div>
                  </LiquidGlass>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  {/* Download */}
                  <button
                    onClick={handleDownload}
                    className="w-full"
                  >
                    <LiquidGlass className="w-full px-6 py-4 text-center cursor-pointer hover:bg-white/70 transition-colors">
                      <span className="text-apple-text font-medium flex items-center justify-center gap-2">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        下载原图
                      </span>
                    </LiquidGlass>
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={handleCopyLink}
                    className="w-full"
                  >
                    <LiquidGlass className="w-full px-6 py-4 text-center cursor-pointer hover:bg-white/70 transition-colors">
                      <span className="text-apple-text font-medium flex items-center justify-center gap-2">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        {copySuccess ? '链接已复制!' : '复制链接'}
                      </span>
                    </LiquidGlass>
                  </button>

                  {/* Delete Button (Only show for image owner) */}
                  {isOwner && (
                    <button
                      onClick={handleDeleteImage}
                      disabled={deleteLoading}
                      className="w-full"
                    >
                      <LiquidGlass className="w-full px-6 py-4 text-center cursor-pointer hover:bg-red-50 transition-colors">
                        <span className="text-red-500 font-medium flex items-center justify-center gap-2">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                          {deleteLoading ? '删除中...' : '删除图片'}
                        </span>
                      </LiquidGlass>
                    </button>
                  )}
                </div>

                {/* Image ID */}
                <div className="text-center text-xs text-apple-text/40 font-mono">
                  #{displayImage.id}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImageDetailPage;

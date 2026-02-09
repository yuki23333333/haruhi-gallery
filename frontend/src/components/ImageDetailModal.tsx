import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import LiquidGlass from './LiquidGlass';
import { deleteImage } from '../utils/api';
import type { ImageData } from '../types';
import { api } from '../lib/apiClient';

interface ImageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageData | null;
}

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  isOpen,
  onClose,
  image,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (!image) return null;

  const isOwner = user && image.uploader_id && user.id === image.uploader_id;

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
    link.href = `http://localhost:8081${image.url}`;
    link.download = image.title || `image-${image.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/image/${image.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleUploaderClick = async () => {
    // If uploader_id exists, navigate directly
    if (image.uploader_id) {
      navigate(`/user/${image.uploader_id}`);
      return;
    }

    // Legacy data: No uploader_id, fetch user by username
    try {
      const data = await api.auth.getUserByUsername(image.uploader_name);
      const userId = data.data.id;
      navigate(`/user/${userId}`);
    } catch (error) {
      console.error('Failed to fetch user by username:', error);
      toast.error('无法加载用户信息');
    }
  };

  const handleDeleteImage = async () => {
    const confirmed = window.confirm('确定要删除这张图片吗？此操作无法撤销。');
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await deleteImage(image.id);
      toast.success('图片已删除');
      onClose();
      // Refresh the page to update the image list
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete image:', error);
      const errorMessage = error instanceof Error ? error.message : '删除失败，请重试';
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <LiquidGlass className="overflow-hidden shadow-lg max-h-[90vh]">
              <div className="flex flex-col lg:flex-row max-h-[90vh]">
                {/* Left: Image - Shared Element Transition */}
                <motion.div
                  className="lg:w-2/3 bg-black/5 flex items-center justify-center p-8 min-h-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <motion.img
                    layoutId={`image-${String(image.id)}`}
                    src={`http://localhost:8081${image.url}`}
                    alt={image.title}
                    className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
                    transition={{
                      type: "spring",
                      stiffness: 80,
                      damping: 20
                    }}
                  />
                </motion.div>

          {/* Right: Metadata Panel - Slide In Animation */}
                <motion.div
                  className="lg:w-1/3 p-8 flex flex-col overflow-y-auto"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 25,
                    delay: 0.15
                  }}
                >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="self-end mb-6 w-10 h-10 rounded-full bg-white/40 hover:bg-white/60 flex items-center justify-center transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <h2 className="text-4xl font-bold text-apple-text mb-6">
              {image.title}
            </h2>

            {/* Metadata */}
            <div className="space-y-6 flex-1">
              {/* Uploader */}
              <div>
                <div className="text-sm text-apple-text/50 mb-2 uppercase tracking-wide">
                  Uploader
                </div>
                {image?.uploader_id ? (
                  <Link
                    to={`/user/${image.uploader_id}`}
                    className="flex items-center gap-2 hover:opacity-80 transition block w-full"
                  >
                    <LiquidGlass className="px-4 py-3 inline-block w-full text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {image.uploader_avatar_url ? (
                            <img
                              src={image.uploader_avatar_url}
                              alt={image.uploader_name || 'Uploader'}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span>{image.uploader_name?.charAt(0).toUpperCase() || '?'}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-apple-text truncate">
                            {image.uploader_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-apple-text/60 capitalize">
                            {image.uploader_type || 'User'}
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
                ) : (
                  <button
                    onClick={handleUploaderClick}
                    className="flex items-center gap-2 hover:opacity-80 transition block w-full cursor-pointer"
                  >
                    <LiquidGlass className="px-4 py-3 inline-block w-full text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {image.uploader_avatar_url ? (
                            <img
                              src={image.uploader_avatar_url}
                              alt={image.uploader_name || 'Uploader'}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span>{image.uploader_name?.charAt(0).toUpperCase() || '?'}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-apple-text truncate">
                            {image.uploader_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-apple-text/60 capitalize">
                            {image.uploader_type || 'User'}
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
                  </button>
                )}
              </div>

              {/* Category */}
              <div>
                <div className="text-sm text-apple-text/50 mb-2 uppercase tracking-wide">
                  Category
                </div>
                <LiquidGlass className="px-4 py-3 inline-block">
                  <span className="capitalize text-apple-text font-medium">
                    {image.category}
                  </span>
                </LiquidGlass>
              </div>

              {/* Upload Date */}
              <div>
                <div className="text-sm text-apple-text/50 mb-2 uppercase tracking-wide">
                  Upload Date
                </div>
                <div className="text-apple-text/80">
                  {formatDate(image.created_at)}
                </div>
              </div>

              {/* Image ID */}
              <div>
                <div className="text-sm text-apple-text/50 mb-2 uppercase tracking-wide">
                  Image ID
                </div>
                <div className="text-apple-text/60 font-mono text-sm">
                  #{image.id}
                </div>
              </div>

              {/* Likes Count */}
              {image.likes !== undefined && image.likes > 0 && (
                <div>
                  <div className="text-sm text-apple-text/50 mb-2 uppercase tracking-wide">
                    Likes
                  </div>
                  <LiquidGlass className="px-4 py-3 inline-flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="#ff3b30"
                      stroke="#ff3b30"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="text-apple-text font-semibold">
                      {image.likes}
                    </span>
                  </LiquidGlass>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-6 flex-shrink-0">
              {/* Download Original */}
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
                </motion.div>
              </div>
            </LiquidGlass>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default ImageDetailModal;

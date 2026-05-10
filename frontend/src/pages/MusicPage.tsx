import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import GalleryCard from '../components/GalleryCard';
import WhiteCard from '../components/ui/WhiteCard';
import AppleButton from '../components/ui/AppleButton';
import DetailOverlay from '../components/ui/DetailOverlay';
import { useAuth } from '../contexts/AuthContext';
import type { ImageData } from '../types';
import SkeletonCard from '../components/SkeletonCard';
import { api } from '../lib/apiClient';

interface MusicImagesResponse {
  data: ImageData[];
  meta: {
    total: number;
    page: number;
    has_more: boolean;
  };
}

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: 100
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const MusicPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [autoLoadCount, setAutoLoadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Detail Overlay State
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  const { ref: sentinelRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const fetchImages = useCallback(async (pageNum: number, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const data = await api.images.getList({
        page: pageNum,
        limit: 12,
        category: 'hiphop'
      }) as MusicImagesResponse;

      if (isLoadMore) {
        setImages((prev) => [...prev, ...data.data]);
      } else {
        setImages(data.data);
      }

      setHasMore(data.meta.has_more);

      if (isLoadMore) {
        setAutoLoadCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Failed to fetch music images:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      fetchImages(1, false);
      setIsInitialized(true);
    }
  }, [isInitialized, fetchImages]);

  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore && autoLoadCount < 3) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchImages(nextPage, true);
    }
  }, [inView, hasMore, loading, loadingMore, autoLoadCount, page, fetchImages]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchImages(nextPage, true);
  };

  const handleDelete = (imageId: number) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleImageClick = (image: ImageData) => {
    setSelectedId(image.id);
    setSelectedImage(image);
  };

  const handleCloseOverlay = () => {
    setSelectedId(null);
    setSelectedImage(null);
  };

  return (
    <motion.div
      className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 relative"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Layer Z-0: Atmospheric Background - FIXED */}
      <div
        className="
          fixed inset-0 z-0
          bg-[url('/IMG_0871.JPG')] bg-cover bg-center bg-no-repeat bg-fixed
          brightness-110
        "
      >
        {/* White overlay */}
        <div className="absolute inset-0 bg-white/5" />
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 sm:mb-12 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Back Button */}
          <AppleButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/')}
          >
            ← 返回
          </AppleButton>

          {/* Title Card */}
          <WhiteCard padding="sm" className="bg-[#F5F5F7] sm:p-6 lg:p-8 order-first sm:order-none w-full sm:w-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-apple-text">
              HipHop
            </h1>
          </WhiteCard>

          {/* Profile Link Card */}
          {user ? (
            <WhiteCard
              padding="sm"
              hover={true}
              onClick={() => navigate(`/user/${user.id}`)}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 p-0.5">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <span className="text-lg font-bold text-apple-text">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-apple-text">个人主页</p>
                <p className="text-xs text-apple-text/60">{user.username}</p>
              </div>
            </WhiteCard>
          ) : (
            <WhiteCard padding="sm" hover={true} onClick={() => navigate('/auth')}>
              <p className="text-sm font-semibold text-apple-text">登录 / 注册</p>
            </WhiteCard>
          )}
        </div>
      </div>

      {/* Music Grid - Masonry Layout */}
      <div className="max-w-7xl mx-auto">
        {/* Loading State - Skeleton */}
        {loading && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Main Gallery - CSS Multi-column Masonry Layout */}
        {!loading && images.length > 0 && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2">
            {images.map((image) => (
              <GalleryCard
                key={image.id}
                image={image}
                onDelete={handleDelete}
                isOwnerProfile={false}
                activeId={selectedId}
                onSelect={handleImageClick}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && images.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <WhiteCard padding="lg" className="bg-[#F5F5F7]">
              <div className="text-center">
                <svg
                  className="mx-auto w-16 h-16 text-apple-text/20 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
                <p className="text-apple-text/50 text-lg mb-2">暂无音乐</p>
                <p className="text-apple-text/30 text-sm">
                  分享动听的音乐从这里开始
                </p>
              </div>
            </WhiteCard>
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={`loading-${i}`} />
            ))}
          </div>
        )}

        {/* Infinite Scroll Sentinel */}
        {hasMore && !loading && (
          <div ref={sentinelRef} className="h-8" />
        )}

        {/* Load More Button */}
        {hasMore && !loading && images.length > 0 && autoLoadCount >= 3 && !loadingMore && (
          <div className="flex justify-center mt-10">
            <AppleButton variant="secondary" size="lg" onClick={handleLoadMore}>
              加载更多
            </AppleButton>
          </div>
        )}

        {/* End Message */}
        {!hasMore && images.length > 0 && (
          <div className="text-center mt-10">
            <p className="text-apple-text/40 text-sm font-medium">已加载全部音乐</p>
          </div>
        )}
      </div>

      {/* Detail Overlay - App Store Style Animation */}
      <AnimatePresence>
        {selectedId && selectedImage && (
          <DetailOverlay
            image={selectedImage}
            onClose={handleCloseOverlay}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MusicPage;

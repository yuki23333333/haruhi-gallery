import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { AnimatePresence, motion } from 'framer-motion';
import GalleryCard from './GalleryCard';
import DetailOverlay from './ui/DetailOverlay';
import type { ImageData, ImagesApiResponse } from '../types';
import SkeletonCard from './SkeletonCard';
import { api } from '../lib/apiClient';
import { throttle, addPassiveScrollListener } from '../utils/scrollOptimization';

interface GalleryListProps {
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

const GalleryList: React.FC<GalleryListProps> = ({
  searchQuery = '',
  onSearch
}) => {
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [autoLoadCount, setAutoLoadCount] = useState(0);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Detail Overlay State
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  // Scroll optimization
  const isLoadingMoreRef = useRef(false);
  const [scrollY, setScrollY] = useState(0);

  // Throttled scroll handler
  const handleScroll = useCallback(
    throttle(() => {
      setScrollY(window.scrollY);
    }, 100),
    []
  );

  // Setup scroll listener
  useEffect(() => {
    const cleanup = addPassiveScrollListener(handleScroll);
    return cleanup;
  }, [handleScroll]);

  const { ref: sentinelRef, inView } = useInView({
    threshold: 0.01,
    triggerOnce: false,
    rootMargin: '200px 0px',
  });

  const fetchImages = useCallback(async (pageNum: number, isLoadMore = false) => {
    try {
      // Prevent concurrent requests
      if (isLoadingMoreRef.current && isLoadMore) {
        return;
      }

      if (isLoadMore) {
        isLoadingMoreRef.current = true;
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const data = await api.images.getList({
        page: pageNum,
        limit: 16, // Increased for better infinite scroll
        exclude_category: 'hiphop',
        q: currentSearchQuery || undefined
      }) as ImagesApiResponse;

      if (isLoadMore) {
        setImages((prev) => [...prev, ...data.data]);
      } else {
        setImages(data.data);
      }

      setHasMore(data.has_more);

      if (isLoadMore) {
        setAutoLoadCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [currentSearchQuery]);

  useEffect(() => {
    setCurrentSearchQuery(searchQuery);
    setPage(1);
    setAutoLoadCount(0);
    setImages([]);
    setHasMore(true);
    setIsInitialized(false);
  }, [searchQuery]);

  useEffect(() => {
    if (!isInitialized && currentSearchQuery !== undefined) {
      fetchImages(1, false);
      setIsInitialized(true);
    }
  }, [currentSearchQuery, isInitialized, fetchImages]);

  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchImages(nextPage, true);
    }
  }, [inView, hasMore, loading, loadingMore, page, fetchImages]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchImages(nextPage, true);
  };

  const handleImageClick = (image: ImageData) => {
    setSelectedId(image.id);
    setSelectedImage(image);
  };

  const handleCloseOverlay = () => {
    setSelectedId(null);
    setSelectedImage(null);
  };

  const handleLike = (imageId: number) => {
    // Like functionality is handled in GalleryCard
  };

  const handleDelete = (imageId: number) => {
    // Remove deleted image from state
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Stagger animation for images
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full">
      {/* Loading State - Skeleton */}
      {loading && (
        <motion.div
          className="columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div key={i} variants={itemVariants}>
              <SkeletonCard />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Main Gallery - CSS Multi-column Masonry Layout with Smooth Animations */}
      {!loading && images.length > 0 && (
        <motion.div
          className="columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                variants={itemVariants}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: index * 0.02,
                }}
                layout
              >
                <GalleryCard
                  image={image}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  isOwnerProfile={false}
                  activeId={selectedId}
                  onSelect={handleImageClick}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && images.length === 0 && (
        <motion.div
          className="flex items-center justify-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <p className="text-gray-400 text-lg font-zcool">暂无图片</p>
          </div>
        </motion.div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <motion.div
          className="columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={`loading-${i}`} />
          ))}
        </motion.div>
      )}

      {/* Infinite Scroll Sentinel */}
      {hasMore && !loading && (
        <div ref={sentinelRef} className="h-20" />
      )}

      {/* End Message */}
      {!hasMore && images.length > 0 && (
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-400 text-sm font-zcool">已加载全部图片</p>
        </motion.div>
      )}

      {/* Detail Overlay - App Store Style Animation */}
      <AnimatePresence>
        {selectedId && selectedImage && (
          <DetailOverlay
            image={selectedImage}
            onClose={handleCloseOverlay}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryList;

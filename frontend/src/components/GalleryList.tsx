import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { AnimatePresence } from 'framer-motion';
import GalleryCard from './GalleryCard';
import DetailOverlay from './ui/DetailOverlay';
import type { ImageData, ImagesApiResponse } from '../types';
import SkeletonCard from './SkeletonCard';
import { api } from '../lib/apiClient';

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

  return (
    <div className="w-full">
      {/* Loading State - Skeleton */}
      {loading && (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Main Gallery - CSS Multi-column Masonry Layout */}
      {!loading && images.length > 0 && (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-2">
          {images.map((image) => (
            <GalleryCard
              key={image.id}
              image={image}
              onLike={handleLike}
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
          <div className="text-center">
            <p className="text-gray-400 text-lg font-zcool">暂无图片</p>
          </div>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 mt-4">
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
      {hasMore && !loading && autoLoadCount >= 3 && !loadingMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            className="px-10 py-3 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 transition-all font-zcool"
          >
            加载更多
          </button>
        </div>
      )}

      {/* End Message */}
      {!hasMore && images.length > 0 && (
        <div className="text-center mt-10">
          <p className="text-gray-400 text-sm font-zcool">已加载全部图片</p>
        </div>
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

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useActiveImage } from '../contexts/ActiveImageContext';
import { useLikeStore } from '../store/likeStore';
import type { ImageData } from '../types';
import { splitTitleAndArtist } from '../utils/musicPlayer';
import { api } from '../lib/apiClient';

interface GalleryCardProps {
  image: ImageData;
  onLike?: (imageId: number) => void;
  onDelete?: (imageId: number) => void;
  isOwnerProfile?: boolean;
  activeId?: number | null;
  onSelect?: (image: ImageData) => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
  image,
  onLike,
  onDelete,
  isOwnerProfile = false,
  activeId,
  onSelect
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { setActiveImage } = useActiveImage();

  // Image loading state
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle cached images where onLoad fires before React attaches the handler
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [image.url]);

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  // Check if image was already loaded (browser cache) after mount
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) {
      if (img.naturalWidth > 0) {
        setImageLoaded(true);
      } else {
        setImageError(true);
      }
    }
  });

  // Global like state from Zustand
  const { likedByMap, syncImageLikes, toggleLike } = useLikeStore();

  const [isDeleting, setIsDeleting] = useState(false);

  // Check if this is a HipHop music card
  const isHipHop = image.category === 'hiphop';
  const extractedSongTitle = isHipHop ? splitTitleAndArtist(image.title) : null;

  // Check if this card is currently active/selected
  const isHidden = activeId === image.id;

  // Sync image data to global store on mount and when image changes
  // Backend sends is_liked boolean, we convert it to liked_by array for global store
  useEffect(() => {
    if (user && image.is_liked !== undefined && image.likes !== undefined) {
      // If backend says this image is liked by current user, sync to global store
      const likedBy = image.is_liked ? [user.id] : [];
      syncImageLikes(image.id, likedBy, image.likes);
      console.log('[GalleryCard] Synced likes from backend', {
        imageId: image.id,
        is_liked: image.is_liked,
        likedBy,
        likes: image.likes
      });
    }
  }, [image.id, image.is_liked, image.likes, user, syncImageLikes]);

  // Get current like status and count from global store
  const currentLikedBy = likedByMap[image.id] || [];
  const isLiked = user ? currentLikedBy.includes(user.id) : false;

  const canDelete = isOwnerProfile && (user && user.id === image.uploader_id);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast('请先登录', 'error');
      return;
    }

    try {
      // Use global store's toggleLike method
      await toggleLike(image.id, user.id);

      if (onLike) onLike(image.id);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      showToast('操作失败', 'error');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这张图片吗？')) return;

    try {
      setIsDeleting(true);
      await api.images.delete(image.id);
      showToast('删除成功', 'success');
      if (onDelete) onDelete(image.id);
    } catch (error) {
      console.error('Failed to delete image:', error);
      showToast('删除失败', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploaderClick = () => {
    navigate(`/user/${image.uploader_id}`);
  };

  const handleHipHopClick = () => {
    // Use onSelect callback if provided (for local overlay), otherwise use global context
    if (onSelect) {
      onSelect(image);
    } else {
      setActiveImage(image);
    }
  };

  // Render HipHop Music Card
  if (isHipHop) {
    return (
      <motion.div
        whileHover={{ scale: isHidden ? 1 : 1.02 }}
        animate={{
          opacity: isHidden ? 0 : 1,
          scale: isHidden ? 0.95 : 1
        }}
        transition={{ type: "spring", stiffness: 150, damping: 28 }}
        onClick={handleHipHopClick}
        className="group cursor-pointer relative mb-3 z-10 inline-block w-full"
        style={{
          pointerEvents: isHidden ? 'none' : 'auto',
          breakInside: 'avoid-column',
          pageBreakInside: 'avoid'
        }}
      >
        {/* Image Container - Square with rounded corners */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 aspect-square shadow-xl">
          {image.url && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 animate-pulse" />
              )}
              <motion.img
                ref={imgRef}
                layoutId={`image-${String(image.id)}`}
                data-image-id={image.id}
                src={image.url}
                alt={extractedSongTitle?.songTitle || image.title}
                className="w-full h-full object-cover absolute inset-0"
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 28,
                  mass: 1.2
                }}
                style={{
                  visibility: 'visible',
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </>
          ) : null}

          {/* Placeholder for empty or failed images */}
          {(!image.url || image.url.trim() === '') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm">
              <svg
                className="w-16 h-16 text-gray-300 mb-3"
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
              <p className="text-gray-400 text-sm font-zcool">暂无图片</p>
            </div>
          )}

          {/* Delete Button - Only show for uploader */}
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm transition-all hover:scale-110 hover:bg-red-500 hover:text-white active:scale-95 z-20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="0.5" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-600 group-hover:text-white transition-colors"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                </svg>
              )}
            </button>
          )}

          {/* Play Icon Overlay - Appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-200 group-hover:scale-110">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="black"
                className="ml-1"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Music Info Section */}
        <div className="mt-3 px-1">
          <h3 className="font-semibold text-apple-text text-base mb-1 leading-tight font-zcool truncate">
            {extractedSongTitle?.songTitle || image.title}
          </h3>
          {extractedSongTitle?.artist && (
            <p className="text-sm text-apple-text/60">
              {extractedSongTitle.artist}
            </p>
          )}

          {/* Music Player - Force render description as iframe */}
          {image.description && (
            <div className="mt-3">
              <div
                dangerouslySetInnerHTML={{ __html: image.description }}
                className="w-full h-[80px]"
              />
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Render Normal Image Card
  return (
    <motion.div
      whileHover={{ scale: isHidden ? 1 : 1.02 }}
      animate={{
        opacity: isHidden ? 0 : 1,
        scale: isHidden ? 0.95 : 1
      }}
      transition={{ type: "spring", stiffness: 100, damping: 25 }}
      onClick={() => {
        // Use onSelect callback if provided (for local overlay)
        if (onSelect) {
          onSelect(image);
        } else {
          // Fall back to global context
          setActiveImage(image);
          setTimeout(() => navigate(`/image/${image.id}`), 50);
        }
      }}
      className="group cursor-pointer relative mb-3 z-10 inline-block w-full"
      style={{
        pointerEvents: isHidden ? 'none' : 'auto',
        breakInside: 'avoid-column',
        pageBreakInside: 'avoid'
      }}
    >
      {/* Image Container - Photo on Glass Effect */}
      <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border-none shadow-xl">
        {/* Skeleton placeholder while loading */}
        {!imageLoaded && !imageError && image.url && (
          <div className="bg-gray-200 animate-pulse" style={{ aspectRatio: '4/3' }} />
        )}
        {/* Actual image */}
        {image.url && !imageError && (
          <motion.img
            ref={imgRef}
            layoutId={`image-${String(image.id)}`}
            data-image-id={image.id}
            src={image.url}
            alt={image.title}
            className="w-full h-auto block rounded-2xl"
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 28,
              mass: 1.2
            }}
            style={{
              visibility: 'visible',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* Placeholder for empty or failed images */}
        {(!image.url || image.url.trim() === '') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm min-h-[200px]">
            <svg
              className="w-16 h-16 text-gray-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-400 text-sm font-zcool">暂无图片</p>
          </div>
        )}

        {/* Like Button - Only show on hover */}
        <button
          type="button"
          onClick={handleLike}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/50 transition-all hover:scale-110 active:scale-95 z-10 opacity-0 group-hover:opacity-100"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isLiked ? '#ff3b30' : 'none'}
            stroke={isLiked ? '#ff3b30' : 'currentColor'}
            strokeWidth="2"
            className={isLiked ? 'text-red-500' : 'text-apple-text/60'}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Delete Button - Only show for owner on profile pages */}
        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/50 transition-all hover:scale-110 hover:bg-red-500 hover:text-white active:scale-95 z-10 disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
          >
            {isDeleting ? (
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="0.5" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
              </svg>
            )}
          </button>
        )}

        {/* Info Overlay - Appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Title */}
            <h3 className="font-semibold text-white text-base mb-2 leading-tight font-zcool">
              {image.title}
            </h3>

            {/* Metadata Row */}
            <div className="flex items-center">
              {/* Uploader Info - Clickable */}
              <button
                onClick={handleUploaderClick}
                className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/30">
                  {image.uploader_avatar_url ? (
                    <img
                      src={image.uploader_avatar_url}
                      alt={image.uploader_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-white font-medium">
                      {image.uploader_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-white/90 text-xs font-medium font-zcool">
                    {image.uploader_name}
                  </span>
                  <span className="text-white/60 text-[10px] capitalize">
                    {image.uploader_type}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GalleryCard;

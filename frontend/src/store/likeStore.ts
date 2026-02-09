import { create } from 'zustand';
import { api } from '../lib/apiClient';

interface LikeState {
  // Map of image ID to set of user IDs who liked it
  likedByMap: Record<number, number[]>;
  // Map of image ID to like count
  likesMap: Record<number, number>;

  // Actions
  setLikedBy: (imageId: number, userIds: number[]) => void;
  setLikes: (imageId: number, count: number) => void;
  toggleLike: (imageId: number, userId: number) => Promise<{ status: string; likes: number }>;
  syncImageLikes: (imageId: number, likedBy: number[], likes: number) => void;
}

export const useLikeStore = create<LikeState>((set, get) => ({
  likedByMap: {},
  likesMap: {},

  setLikedBy: (imageId, userIds) => {
    set((state) => ({
      likedByMap: {
        ...state.likedByMap,
        [imageId]: userIds,
      },
    }));
  },

  setLikes: (imageId, count) => {
    set((state) => ({
      likesMap: {
        ...state.likesMap,
        [imageId]: count,
      },
    }));
  },

  syncImageLikes: (imageId, likedBy, likes) => {
    set((state) => ({
      likedByMap: {
        ...state.likedByMap,
        [imageId]: likedBy,
      },
      likesMap: {
        ...state.likesMap,
        [imageId]: likes,
      },
    }));
  },

  toggleLike: async (imageId, userId) => {
    console.log('[LikeStore] Toggle like started', { imageId, userId });

    try {
      const data = await api.images.like(imageId);
      console.log('[LikeStore] API Response data:', data);

      // Handle both 'status' and 'liked' field names for backward compatibility
      const status = data.status || (data.liked ? 'liked' : 'unliked');
      const likes = data.likes;

      // Update local state based on response
      const currentLikedBy = get().likedByMap[imageId] || [];
      console.log('[LikeStore] Current liked_by before update:', currentLikedBy);
      console.log('[LikeStore] Parsed status:', status);

      if (status === 'liked') {
        // Add user to liked_by if not already present
        if (!currentLikedBy.includes(userId)) {
          console.log('[LikeStore] Adding user to liked_by');
          set((state) => ({
            likedByMap: {
              ...state.likedByMap,
              [imageId]: [...currentLikedBy, userId],
            },
            likesMap: {
              ...state.likesMap,
              [imageId]: likes,
            },
          }));
        }
      } else if (status === 'unliked') {
        console.log('[LikeStore] Removing user from liked_by');
        // Remove user from liked_by
        set((state) => ({
          likedByMap: {
            ...state.likedByMap,
            [imageId]: currentLikedBy.filter((id) => id !== userId),
          },
          likesMap: {
            ...state.likesMap,
            [imageId]: likes,
          },
        }));
      }

      console.log('[LikeStore] Toggle like completed', { status, likes });
      return { status, likes };
    } catch (error) {
      console.error('[LikeStore] Failed to toggle like:', error);
      throw error;
    }
  },
}));

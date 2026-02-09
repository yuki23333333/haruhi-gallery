import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import LiquidGlass from '../components/LiquidGlass';
import GalleryCard from '../components/GalleryCard';
import SkeletonCard from '../components/SkeletonCard';
import EditProfileModal from '../components/EditProfileModal';
import DetailOverlay from '../components/ui/DetailOverlay';
import WhiteCard from '../components/ui/WhiteCard';
import AppleButton from '../components/ui/AppleButton';
import StatBadge from '../components/ui/StatBadge';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { ImageData } from '../types';
import { api } from '../lib/apiClient';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

// Tab content animation variants
const tabContentVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25,
      staggerChildren: 0.08
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.25
    }
  })
};

// Card stagger variants for masonry layout
const cardStaggerVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

interface UserImagesResponse {
  data: ImageData[];
  meta: {
    total: number;
    page: number;
    has_more: boolean;
  };
}

type TabType = 'images' | 'music' | 'likes';

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('images');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  // Infinite Scroll State
  const [autoLoadCount, setAutoLoadCount] = useState(0);

  // Detail Overlay State
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  // Tab switching direction for animation
  const [tabDirection, setTabDirection] = useState(0);
  const [previousTab, setPreviousTab] = useState<TabType>('images');

  const isOwnProfile = Boolean(user && profile && user.id === parseInt(id || '0'));

  // Infinite Scroll Hook
  const { ref: sentinelRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    fetchUserProfile();
    if (user && !isOwnProfile) {
      fetchFollowStatus();
      fetchFollowers();
      fetchFollowing();
    }
  }, [id, user]);

  // Track tab direction for animation
  useEffect(() => {
    if (activeTab !== previousTab) {
      if (activeTab === 'music') {
        setTabDirection(1);
      } else {
        setTabDirection(-1);
      }
      setPreviousTab(activeTab);
    }
  }, [activeTab, previousTab]);

  useEffect(() => {
    setPage(1);
    setImages([]);
    setHasMore(true);
    setAutoLoadCount(0);
    fetchImages(1, false);
  }, [activeTab, id]);

  // Infinite Scroll Effect
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore && autoLoadCount < 3) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchImages(nextPage, true);
    }
  }, [inView, hasMore, loading, loadingMore, autoLoadCount, page]);

  const fetchUserProfile = async () => {
    try {
      const data = await api.users.getProfile(id);
      setProfile(data.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Redirect to home if user not found
      navigate('/');
    }
  };

  const fetchFollowStatus = async () => {
    try {
      const data = await api.users.getFollowStatus(id);
      setIsFollowing(data.is_following);
    } catch (error) {
      console.error('Failed to fetch follow status:', error);
    }
  };

  const fetchFollowers = async () => {
    try {
      const data = await api.users.getFollowers(id);
      setFollowersCount(data.data.length);
    } catch (error) {
      console.error('Failed to fetch followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const data = await api.users.getFollowing(id);
      setFollowingCount(data.data.length);
    } catch (error) {
      console.error('Failed to fetch following:', error);
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      showToast('请先登录', 'error');
      setTimeout(() => navigate('/auth'), 1000);
      return;
    }

    setFollowLoading(true);
    try {
      const data = await api.users.follow(id);
      setIsFollowing(data.following);

      // Update followers count
      if (data.following) {
        setFollowersCount((prev) => prev + 1);
        showToast('已关注', 'success');
      } else {
        setFollowersCount((prev) => prev - 1);
        showToast('已取消关注', 'info');
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      showToast('操作失败', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleOpenEditProfile = () => {
    setEditProfileModalOpen(true);
  };

  const handleCloseEditProfile = () => {
    setEditProfileModalOpen(false);
  };

  const handleProfileUpdate = () => {
    // Reload user profile and page data
    fetchUserProfile();
  };

  const fetchImages = async (pageNum: number, isLoadMore: boolean) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // For likes tab, use different API endpoint
      if (activeTab === 'likes') {
        console.log(`[UserProfile] Fetching likes:`, id);

        const data = await api.users.getLikes(id, {
          page: pageNum,
          limit: 20
        }) as UserImagesResponse;

        if (isLoadMore) {
          setImages((prev) => [...prev, ...data.data]);
          setAutoLoadCount((prev) => prev + 1);
        } else {
          setImages(data.data);
        }

        setHasMore(data.meta.has_more);
      } else {
        // Determine category filter based on active tab
        const category = activeTab === 'music' ? 'hiphop' : undefined;
        const excludeCategory = activeTab === 'images' ? 'hiphop' : undefined;

        console.log(`[UserProfile] Fetching ${activeTab}:`, { category, excludeCategory });

        const data = await api.users.getUploads(id, {
          page: pageNum,
          limit: 20,
          category,
          exclude_category: excludeCategory
        }) as UserImagesResponse;

        // Debug: log categories of returned items
        if (data.data && data.data.length > 0) {
          const categories = data.data.map((img) => img.category);
          console.log(`[UserProfile] Received ${data.data.length} items, categories:`, categories);
        }

        if (isLoadMore) {
          setImages((prev) => [...prev, ...data.data]);
          setAutoLoadCount((prev) => prev + 1);
        } else {
          setImages(data.data);
        }

        setHasMore(data.meta.has_more);
      }
    } catch (error) {
      console.error(`Failed to fetch user ${activeTab}:`, error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchImages(nextPage, true);
    }
  };

  const handleDelete = (imageId: number) => {
    // Remove the deleted image from the list
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-apple-text/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 relative">
      {/* Layer Z-0: Atmospheric Background - FIXED */}
      <div
        className="
          fixed inset-0 z-0
          bg-[url('/IMG_0871.JPG')] bg-cover bg-center bg-no-repeat bg-fixed
          brightness-110
        "
      >
        {/* White overlay */}
        <div className="absolute inset-0 bg-white/8" />
      </div>

      {/* Main Content with Page Entry Animation */}
      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* User Profile Card - White UI */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <WhiteCard padding="lg" className="bg-[#F5F5F7]">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 p-1">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-full h-full rounded-full object-cover border-4 border-white"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <span className="text-5xl font-bold text-apple-text">
                        {profile.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left drop-shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                  <h1 className="text-4xl font-bold text-apple-text">
                    {profile.username}
                    {isOwnProfile && (
                      <span className="ml-3 text-lg font-normal text-apple-text/50">
                      （你）
                    </span>
                    )}
                  </h1>
                  {!isOwnProfile && (
                    <AppleButton
                      variant={isFollowing ? 'secondary' : 'primary'}
                      size="md"
                      onClick={handleToggleFollow}
                      disabled={followLoading}
                    >
                      {followLoading ? '加载中...' : isFollowing ? '已关注' : '关注'}
                    </AppleButton>
                  )}
                  {isOwnProfile && (
                    <AppleButton
                      variant="secondary"
                      size="md"
                      onClick={handleOpenEditProfile}
                    >
                      编辑资料
                    </AppleButton>
                  )}
                </div>
                <p className="text-apple-text/60 text-base mb-2">
                  {profile.email}
                </p>
                {profile.bio && (
                  <p className="text-apple-text/80 text-base mb-4 italic">
                    "{profile.bio}"
                  </p>
                )}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {activeTab === 'likes' ? (
                    <StatBadge value={images.length} label="已点赞" />
                  ) : (
                    <>
                      <StatBadge value={images.length} label={activeTab === 'music' ? '音乐' : '图片'} />
                    </>
                  )}
                  <StatBadge value={followersCount} label="粉丝" />
                  <StatBadge value={followingCount} label="关注" />
                </div>
              </div>
            </div>
          </WhiteCard>
        </motion.div>

        {/* Tab Switcher - White Card Style */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <WhiteCard padding="sm" className="inline-flex gap-2">
            <button
              onClick={() => setActiveTab('images')}
              className={`
                px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300
                ${activeTab === 'images'
                  ? 'bg-apple-text text-white shadow-lg'
                  : 'bg-gray-100 text-apple-text/60 hover:bg-gray-200'
                }
              `}
            >
              图片
            </button>
            <button
              onClick={() => setActiveTab('music')}
              className={`
                px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300
                ${activeTab === 'music'
                  ? 'bg-apple-text text-white shadow-lg'
                  : 'bg-gray-100 text-apple-text/60 hover:bg-gray-200'
                }
              `}
            >
              音乐
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`
                px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300
                ${activeTab === 'likes'
                  ? 'bg-apple-text text-white shadow-lg'
                  : 'bg-gray-100 text-apple-text/60 hover:bg-gray-200'
                }
              `}
            >
              已点赞
            </button>
          </WhiteCard>
        </motion.div>

        {/* Images Grid - Masonry Layout with Tab Switch Animation */}
        <motion.div variants={itemVariants}>
          {loading ? (
            <div className={activeTab === 'music' || activeTab === 'likes' ? 'columns-3 md:columns-4 lg:columns-5 gap-2' : 'columns-2 md:columns-3 lg:columns-4 gap-2'}>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait" custom={tabDirection}>
                {images.length > 0 ? (
                  <motion.div
                    key={activeTab}
                    custom={tabDirection}
                    variants={tabContentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className={activeTab === 'music' || activeTab === 'likes' ? 'columns-3 md:columns-4 lg:columns-5 gap-2' : 'columns-2 md:columns-3 lg:columns-4 gap-2'}
                  >
                    {images.map((image, index) => (
                      <motion.div
                        key={image.id}
                        variants={cardStaggerVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 200,
                          damping: 20
                        }}
                      >
                        <GalleryCard
                          image={image}
                          onDelete={handleDelete}
                          isOwnerProfile={isOwnProfile}
                          activeId={selectedId}
                          onSelect={handleImageClick}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-state"
                    custom={tabDirection}
                    variants={tabContentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="text-center py-20"
                  >
                    <WhiteCard padding="lg" className="inline-block bg-[#F5F5F7]">
                      <div className="mb-4">
                        {activeTab === 'images' ? (
                          <svg
                            className="mx-auto w-16 h-16 text-apple-text/20"
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
                        ) : activeTab === 'music' ? (
                          <svg
                            className="mx-auto w-16 h-16 text-apple-text/20"
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
                        ) : (
                          <svg
                            className="mx-auto w-16 h-16 text-apple-text/20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-apple-text/50 text-lg mb-2">
                        {activeTab === 'images' ? '该用户暂无图片' :
                         activeTab === 'music' ? '该用户暂无音乐' :
                         '该用户暂无点赞'}
                      </p>
                      <p className="text-apple-text/30 text-sm">
                        {activeTab === 'images' ? '分享美好瞬间从这里开始' :
                         activeTab === 'music' ? '分享动听的音乐从这里开始' :
                         '点赞喜欢的内容从这里开始'}
                      </p>
                    </WhiteCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading more indicator */}
              {loadingMore && (
                <div className={activeTab === 'music' || activeTab === 'likes' ? 'columns-3 md:columns-4 lg:columns-5 gap-2 mt-2' : 'columns-2 md:columns-3 lg:columns-4 gap-2 mt-2'}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={`loading-${i}`} />
                  ))}
                </div>
              )}

              {/* Load More button - Only show after 3 auto-loads */}
              {hasMore && !loading && images.length > 0 && autoLoadCount >= 3 && !loadingMore && (
                <div className="flex justify-center mt-10">
                  <AppleButton variant="secondary" size="lg" onClick={handleLoadMore}>
                    加载更多
                  </AppleButton>
                </div>
              )}

              {/* Infinite Scroll Sentinel */}
              {hasMore && !loading && (
                <div ref={sentinelRef} className="h-8" />
              )}

              {/* End of results message */}
              {!hasMore && images.length > 0 && (
                <div className="text-center mt-10">
                  <p className="text-apple-text/40 text-sm font-medium">
                    {activeTab === 'images' ? '已加载全部图片' :
                     activeTab === 'music' ? '已加载全部音乐' :
                     '已加载全部点赞'}
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editProfileModalOpen}
        onClose={handleCloseEditProfile}
        onUpdate={handleProfileUpdate}
      />

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

export default UserProfilePage;

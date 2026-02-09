import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import { api } from '../lib/apiClient';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername(user?.username || '');
      setBio('');
      setAvatarFile(null);
      setAvatarPreview(user?.avatar_url || '');
    }
  }, [isOpen, user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('头像文件不能超过 5MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('用户名不能为空');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', username.trim());
      if (bio.trim()) {
        formData.append('bio', bio.trim());
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      // DEBUG: Log the payload being sent
      console.log('🔍 [DEBUG] Submitting profile update:');
      console.log('  - Username:', username.trim());
      console.log('  - Bio:', bio.trim() || '(empty)');
      console.log('  - Avatar file:', avatarFile ? avatarFile.name : '(none)');

      const data = await api.users.updateCurrentUserProfile(formData);
      console.log('✅ [SUCCESS] Profile updated successfully:', data);

      // Update local storage
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('个人资料已更新！');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('❌ [ERROR] Failed to update profile:', error);
      const errorMessage = error instanceof Error ? error.message : '更新失败，请重试';
      toast.error(`保存失败: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-[#F5F5F7] rounded-[32px] p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-apple-text mb-2">编辑资料</h2>
          <p className="text-apple-text/50 text-sm">更新你的个人信息</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex justify-center">
            <div className="relative group">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAvatarClick}
                className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-apple-text mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 rounded-xl text-apple-text placeholder:text-apple-text/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
              placeholder="输入用户名"
              maxLength={30}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-apple-text mb-2">
              个人简介
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 rounded-xl text-apple-text placeholder:text-apple-text/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
              placeholder="介绍一下你自己..."
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-apple-text/40 mt-1 text-right">
              {bio.length}/200
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/40 hover:bg-white/50 rounded-xl text-apple-text font-semibold transition-all shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-apple-text hover:bg-apple-text/90 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default EditProfileModal;

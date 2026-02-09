import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import WhiteCard from './ui/WhiteCard';
import AppleButton from './ui/AppleButton';
import { useAuth } from '../contexts/AuthContext';
import { isValidMusicInput } from '../utils/musicPlayer';
import { api } from '../lib/apiClient';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const { token, user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'gallery' | 'hiphop'>('gallery');
  // HipHop specific fields
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [redirectURL, setRedirectURL] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin privilege check
  const isAdmin = user?.username === 'yuki';

  // Set uploader name from user when available
  useEffect(() => {
    if (user) {
      setUploaderName(user.username);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on category
    if (!file || !uploaderName) {
      alert('Please fill in all required fields');
      return;
    }

    if (category === 'gallery') {
      if (!title) {
        alert('Please enter a title');
        return;
      }
    } else if (category === 'hiphop') {
      if (!songTitle || !artist || !redirectURL) {
        alert('请填写歌曲名、歌手和网易云外链');
        return;
      }
      // Validate NetEase Cloud Music URL or iframe code
      if (!isValidMusicInput(redirectURL)) {
        alert('请输入有效的网易云音乐外链或 iframe 代码');
        return;
      }
    }

    const formData = new FormData();
    formData.append('file', file);

    // Map 'gallery' to 'haruhi' for backend, keep 'hiphop' as is
    const backendCategory = category === 'gallery' ? 'haruhi' : category;
    formData.append('category', backendCategory);
    formData.append('uploader_name', uploaderName);

    if (category === 'gallery') {
      // Gallery mode: use title and description
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }
    } else if (category === 'hiphop') {
      // HipHop mode: use song_title, artist, redirect_url
      formData.append('song_title', songTitle);
      formData.append('artist', artist);
      formData.append('redirect_url', redirectURL);
      // Set title to song_title only (not concatenated) for display
      formData.append('title', songTitle);
      // Also send description if provided (for iframe backup)
      if (description) {
        formData.append('description', description);
      }
    }

    if (secretKey) {
      formData.append('secret_key', secretKey);
    }

    try {
      setUploading(true);
      await api.images.upload(formData);
      onUploadSuccess();
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setTitle('');
    setDescription('');
    setSongTitle('');
    setArtist('');
    setRedirectURL('');
    setCategory('gallery');
    setUploaderName('');
    setSecretKey('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <WhiteCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto !bg-[#F5F5F7]">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-apple-text">
              Upload Image
            </h2>
            <AppleButton
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="!w-10 !h-10 !p-0 !rounded-full"
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
            </AppleButton>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-apple-text mb-3">
                Image *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {preview ? (
                  <WhiteCard className="aspect-video !p-0 overflow-hidden !bg-white">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </WhiteCard>
                ) : (
                  <WhiteCard className="aspect-video flex flex-col items-center justify-center !bg-white hover:scale-[1.01] transition-transform cursor-pointer border-2 border-dashed border-gray-200">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-apple-text/40 mb-3"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    <span className="text-apple-text/60 font-medium">
                      Click to upload
                    </span>
                    <span className="text-sm text-apple-text/40 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </WhiteCard>
                )}
              </div>
            </div>

            {/* Title - Only for Gallery mode */}
            {category === 'gallery' && (
              <div>
                <label className="block text-sm font-semibold text-apple-text mb-3">
                  Title *
                </label>
                <WhiteCard padding="sm" className="!bg-white">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter image title..."
                    className="w-full bg-transparent border-none outline-none text-apple-text placeholder:text-apple-text/40"
                    required={category === 'gallery'}
                  />
                </WhiteCard>
              </div>
            )}

            {/* Description - Only for Gallery mode (Optional) */}
            {category === 'gallery' && (
              <div>
                <label className="block text-sm font-semibold text-apple-text mb-3">
                  Description <span className="text-apple-text/40 font-normal">(Optional)</span>
                </label>
                <WhiteCard padding="sm" className="!bg-white">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter image description..."
                    rows={3}
                    className="w-full bg-transparent border-none outline-none text-apple-text placeholder:text-apple-text/40 resize-none"
                  />
                </WhiteCard>
              </div>
            )}

            {/* HipHop Fields - Only for HipHop mode */}
            {category === 'hiphop' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-apple-text mb-3">
                    Song Title *
                  </label>
                  <WhiteCard padding="sm" className="!bg-white">
                    <input
                      type="text"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="Enter song name..."
                      className="w-full bg-transparent border-none outline-none text-apple-text placeholder:text-apple-text/40"
                      required={category === 'hiphop'}
                    />
                  </WhiteCard>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-apple-text mb-3">
                    Artist *
                  </label>
                  <WhiteCard padding="sm" className="!bg-white">
                    <input
                      type="text"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder="Enter artist name..."
                      className="w-full bg-transparent border-none outline-none text-apple-text placeholder:text-apple-text/40"
                      required={category === 'hiphop'}
                    />
                  </WhiteCard>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-apple-text mb-3">
                    请上传网易云外链 *
                  </label>
                  <WhiteCard padding="sm" className="!bg-white">
                    <textarea
                      value={redirectURL}
                      onChange={(e) => setRedirectURL(e.target.value)}
                      placeholder="请粘贴网易云音乐分享链接（例如：https://music.163.com/#/song?id=xxx）"
                      rows={4}
                      className="w-full bg-transparent border-none outline-none text-apple-text placeholder:text-apple-text/40 resize-none font-mono text-sm"
                      required={category === 'hiphop'}
                    />
                  </WhiteCard>
                  <p className="text-sm text-apple-text/50 mt-2">
                    支持网易云音乐分享链接，系统会自动转换为播放器
                  </p>
                </div>
              </>
            )}

            {/* Category Selector - Visible to all users */}
            <div>
              <label className="block text-sm font-semibold text-apple-text mb-3">
                内容类型 *
              </label>
              <div className="flex gap-3">
                <AppleButton
                  variant={category === 'gallery' ? 'primary' : 'secondary'}
                  size="md"
                  onClick={() => setCategory('gallery')}
                  className="flex-1"
                >
                  📷 图片
                </AppleButton>
                <AppleButton
                  variant={category === 'hiphop' ? 'primary' : 'secondary'}
                  size="md"
                  onClick={() => setCategory('hiphop')}
                  className="flex-1"
                >
                  🎵 HipHop 音乐
                </AppleButton>
              </div>
              <p className="text-sm text-apple-text/50 mt-2">
                {category === 'gallery'
                  ? '上传春日、阿虚或其他角色的图片'
                  : '上传 HipHop 音乐，需要填写歌曲信息'}
              </p>
            </div>

            {/* Uploader Name */}
            <div>
              <label className="block text-sm font-semibold text-apple-text mb-3">
                Your Name *
              </label>
              <WhiteCard padding="sm" className="!bg-white">
                <input
                  type="text"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-transparent border-none outline-none text-apple-text placeholder:text-apple-text/40"
                  required
                />
              </WhiteCard>
            </div>

            {/* Secret Key (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-apple-text mb-3">
                Secret Key <span className="text-apple-text/40 font-normal">(Optional)</span>
              </label>
              <WhiteCard padding="sm" className="!bg-white">
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter secret key for official upload..."
                  className="w-full bg-transparent border-none outline-none text-apple-text placeholder:text-apple-text/40"
                />
              </WhiteCard>
              <p className="text-sm text-apple-text/50 mt-2">
                Leave empty for community upload
              </p>
            </div>

            {/* Submit Button */}
            <AppleButton
              variant="primary"
              size="lg"
              type="submit"
              disabled={
                uploading ||
                !file ||
                !uploaderName ||
                (category === 'gallery' && !title) ||
                (category === 'hiphop' && (!songTitle || !artist || !redirectURL))
              }
              className="w-full"
            >
              {uploading ? 'Uploading...' : category === 'hiphop' ? 'Upload Music' : 'Upload Image'}
            </AppleButton>
          </form>
        </div>
      </WhiteCard>
    </Modal>
  );
};

export default UploadModal;

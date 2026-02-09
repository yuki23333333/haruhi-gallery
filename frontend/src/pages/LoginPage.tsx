import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        // For registration with avatar, we'll need to convert to base64
        let avatarUrl = '';
        if (avatarPreview) {
          avatarUrl = avatarPreview;
        }
        await register(username, email, password, avatarUrl);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  return (
    <div className="min-h-screen bg-apple-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white/60 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/40 overflow-hidden flex max-w-4xl w-full h-[600px]"
      >
        {/* Left Side - Decorative Area */}
        <div className="w-2/5 bg-gradient-to-b from-blue-50 to-blue-100/50 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/30 rounded-full blur-2xl" />

          {/* Haruhi Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.img
              src="/haruhi_login.png"
              alt="Haruhi"
              className="w-4/5 h-auto object-contain drop-shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </div>

          {/* Decorative text */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-blue-600/60 font-medium text-sm">SOS Brigade</p>
          </div>
        </div>

        {/* Right Side - Form Area */}
        <div className="w-3/5 p-12 flex flex-col justify-center overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Title with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-bold text-apple-text"
              >
                {isLogin ? 'Welcome Back' : 'Join the Brigade'}
              </motion.h1>
            </AnimatePresence>

            <p className="text-apple-text/60">SOS Brigade Access Portal</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Visual Avatar Picker - Only for registration */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center"
                  >
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-input"
                      />
                      <label
                        htmlFor="avatar-input"
                        className="group relative w-20 h-20 rounded-full cursor-pointer overflow-hidden bg-gray-100/50 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center transition-all duration-300 hover:ring-4 hover:ring-blue-400/30 hover:scale-105"
                      >
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-apple-text/40 group-hover:text-apple-text/60 transition-colors"
                          >
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                        )}
                      </label>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                        <motion.div
                          initial={false}
                          animate={avatarPreview ? { scale: 1 } : { scale: 0 }}
                          className="w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username - Only for registration */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      minLength={2}
                      className="w-full px-4 py-3 bg-gray-50/50 focus:bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-apple-text placeholder:text-apple-text/40"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Input */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50/50 focus:bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-apple-text placeholder:text-apple-text/40"
                />
              </div>

              {/* Password Input */}
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-50/50 focus:bg-white border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-apple-text placeholder:text-apple-text/40"
                />
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#1D1D1F] hover:bg-[#2D2D2F] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
              </button>

              {/* Toggle Login/Register */}
              <button
                type="button"
                onClick={toggleMode}
                className="w-full text-sm text-apple-text/60 hover:text-apple-text transition-colors"
              >
                {isLogin ? "Don't have an account? Join the SOS Brigade" : 'Already a member? Login'}
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

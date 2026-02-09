import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ActiveImageProvider, useActiveImage } from './contexts/ActiveImageContext';
import SplashScreen from './components/SplashScreen';
import AnimatedRoutes from './components/AnimatedRoutes';
import DetailOverlay from './components/ui/DetailOverlay';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { activeImage, setActiveImage } = useActiveImage();

  return (
    <SplashScreen>
      {/* Fixed Background Layer - Always stays in place */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#F2F2F2] to-[#D1D8C5]" />

      {/* Content Container - Transparent background, allows natural scrolling */}
      <div className="relative w-full min-h-screen">
        <AnimatedRoutes />
      </div>

      {/* Detail Overlay - App Store style shared element transition */}
      <DetailOverlay
        image={activeImage}
        onClose={() => setActiveImage(null)}
      />
    </SplashScreen>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <ActiveImageProvider>
              <AppContent />
            </ActiveImageProvider>
          </AuthProvider>
        </ToastProvider>
        {/* Glassmorphism Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: '#1d1d1f',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: '500',
              zIndex: 9999,
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              style: {
                background: 'rgba(16, 185, 129, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                background: 'rgba(239, 68, 68, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              },
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

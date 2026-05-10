// Performance optimization configuration

export const PERFORMANCE_CONFIG = {
  // Infinite scroll settings
  infiniteScroll: {
    threshold: 0.01,           // Trigger when 1% visible
    rootMargin: '200px',       // Start loading 200px before viewport
    debounceMs: 100,           // Debounce scroll events
    itemsPerPage: 16,          // Load 16 items per page
    preloadPages: 1,           // Preload 1 page ahead
  },

  // Image lazy loading
  images: {
    lazyLoad: true,
    placeholderColor: '#f0f0f0',
    fadeInDuration: 300,       // Image fade-in animation
    errorRetryAttempts: 2,     // Retry failed images
    loadingStrategy: 'lazy',   // Use native lazy loading
  },

  // Animation settings
  animations: {
    staggerDelay: 0.05,        // Delay between item animations
    springStiffness: 150,      // Spring animation stiffness
    springDamping: 28,         // Spring animation damping
    mass: 1.2,                 // Animation mass
    transitionDuration: 0.3,   // Default transition duration
  },

  // Memory management
  memory: {
    maxCacheSize: 100,         // Max items to keep in memory
    gcInterval: 30000,         // Garbage collection interval (ms)
    unloadDistance: 2000,      // Unload items 2000px away from viewport
  },

  // Scroll optimizations
  scroll: {
    passiveListeners: true,    // Use passive event listeners
    smoothScrolling: true,     // Enable smooth scrolling
    scrollBehavior: 'smooth',
    preventOverscroll: false,  // Don't prevent overscroll (pull-to-refresh)
  },

  // Performance monitoring
  monitoring: {
    enabled: process.env.NODE_ENV === 'development',
    fpsThreshold: 30,          // Alert if FPS drops below 30
    longTaskThreshold: 50,     // Alert if task takes longer than 50ms
    sampleRate: 0.1,           // Sample 10% of operations
  },

  // Column layout breakpoints
  layout: {
    mobile: 640,               // Mobile breakpoint
    tablet: 768,               // Tablet breakpoint
    desktop: 1024,             // Desktop breakpoint
    wide: 1280,                // Wide screen breakpoint
    columns: {
      mobile: 1,               // 1 column on mobile
      smallTablet: 2,          // 2 columns on small tablets
      tablet: 2,               // 2 columns on tablets
      desktop: 3,              // 3 columns on desktop
      wide: 4,                 // 4 columns on wide screens
      ultraWide: 5,            // 5 columns on ultra-wide screens
    },
  },
};

export default PERFORMANCE_CONFIG;

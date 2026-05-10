// Performance monitoring utilities

/**
 * Measure FPS (Frames Per Second)
 */
export class FPSMonitor {
  private frames: number[] = [];
  private lastTime = performance.now();
  private rafId: number | null = null;

  start(callback: (fps: number) => void) {
    const measure = () => {
      const now = performance.now();
      const delta = now - this.lastTime;
      this.lastTime = now;

      const fps = 1000 / delta;
      this.frames.push(fps);

      // Keep only last 60 frames (1 second at 60fps)
      if (this.frames.length > 60) {
        this.frames.shift();
      }

      // Calculate average FPS
      const avgFps = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
      callback(Math.round(avgFps));

      this.rafId = requestAnimationFrame(measure);
    };

    this.rafId = requestAnimationFrame(measure);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.frames = [];
  }
}

/**
 * Measure scroll performance
 */
export class ScrollPerformanceMonitor {
  private scrollEvents: number[] = [];
  private isMonitoring = false;

  start() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.scrollEvents = [];

    const handleScroll = () => {
      this.scrollEvents.push(performance.now());

      // Keep only last 100 scroll events
      if (this.scrollEvents.length > 100) {
        this.scrollEvents.shift();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  stop() {
    this.isMonitoring = false;
    window.removeEventListener('scroll', () => {});
  }

  getAverageScrollInterval(): number {
    if (this.scrollEvents.length < 2) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < this.scrollEvents.length; i++) {
      intervals.push(this.scrollEvents[i] - this.scrollEvents[i - 1]);
    }

    return intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  getScrollEventsPerSecond(): number {
    if (this.scrollEvents.length < 2) return 0;

    const duration = this.scrollEvents[this.scrollEvents.length - 1] - this.scrollEvents[0];
    if (duration === 0) return 0;

    return (this.scrollEvents.length / duration) * 1000;
  }
}

/**
 * Memory usage monitor (Chrome only)
 */
export function getMemoryUsage(): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
} | null {
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  return null;
}

/**
 * Long task detection
 */
export function detectLongTasks(threshold: number = 50): Promise<number[]> {
  return new Promise((resolve) => {
    const longTasks: number[] = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > threshold) {
          longTasks.push(entry.duration);
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });

    // Stop observing after 5 seconds
    setTimeout(() => {
      observer.disconnect();
      resolve(longTasks);
    }, 5000);
  });
}

/**
 * Component render time monitor
 */
export function measureRenderTime(componentName: string) {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (renderTime > 16) { // More than one frame at 60fps
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }

    return renderTime;
  };
}

/**
 * Debounced performance logging
 */
export function createPerformanceLogger() {
  let logBuffer: string[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (message: string) => {
    logBuffer.push(message);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      console.log('Performance Summary:', logBuffer.join('\n'));
      logBuffer = [];
    }, 1000);
  };
}

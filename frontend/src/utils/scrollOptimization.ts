// Scroll optimization utilities

/**
 * Throttle function to limit how often a function can be called
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastExecTime = 0;

  return function (...args: Parameters<T>) {
    const currentTime = Date.now();
    const timeSinceLastExec = currentTime - lastExecTime;

    if (timeSinceLastExec >= delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - timeSinceLastExec);
    }
  };
}

/**
 * Debounce function to delay execution until after a pause
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Check if element is in viewport with margin
 */
export function isInViewport(
  element: HTMLElement,
  margin: number = 200
): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  return (
    rect.top <= windowHeight + margin &&
    rect.bottom >= -margin &&
    rect.left <= windowWidth + margin &&
    rect.right >= -margin
  );
}

/**
 * Smooth scroll to element
 */
export function smoothScrollTo(
  element: HTMLElement,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' }
): void {
  element.scrollIntoView(options);
}

/**
 * Get scroll direction
 */
export function getScrollDirection(): 'up' | 'down' | null {
  let lastScrollTop = 0;
  let direction: 'up' | 'down' | null = null;

  return function() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > lastScrollTop) {
      direction = 'down';
    } else if (st < lastScrollTop) {
      direction = 'up';
    }
    lastScrollTop = st <= 0 ? 0 : st;
    return direction;
  } as any;
}

/**
 * Optimize scroll performance with passive listeners
 */
export function addPassiveScrollListener(
  callback: () => void,
  options: AddEventListenerOptions = { passive: true }
): () => void {
  window.addEventListener('scroll', callback, options);
  return () => window.removeEventListener('scroll', callback, options);
}

/**
 * Prevent scroll bouncing on iOS
 */
export function preventScrollBouncing(): () => void {
  const style = document.createElement('style');
  style.innerHTML = `
    body {
      overscroll-behavior-y: none;
      -webkit-overflow-scrolling: touch;
    }
  `;
  document.head.appendChild(style);

  return () => {
    document.head.removeChild(style);
  };
}

/**
 * Lazy load images with intersection observer
 */
export function createLazyLoader(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {
    rootMargin: '200px',
    threshold: 0.01
  }
): IntersectionObserver {
  return new IntersectionObserver(callback, options);
}

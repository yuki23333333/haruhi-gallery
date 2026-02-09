/**
 * Music player utility functions for converting music platform URLs to iframe embed codes
 */

/**
 * Split title in format "Song Name - Artist" into separate parts
 * @param title - Title string that may contain " - " separator
 * @returns Object with songTitle and artist
 */
export const splitTitleAndArtist = (title: string): { songTitle: string; artist: string } => {
  if (!title || title.trim() === '') {
    return { songTitle: '', artist: '' };
  }

  // Check if title contains " - " separator
  const separatorIndex = title.indexOf(' - ');
  if (separatorIndex !== -1) {
    // Split the title
    const songTitle = title.substring(0, separatorIndex).trim();
    const artist = title.substring(separatorIndex + 3).trim(); // +3 to skip " - "
    return { songTitle, artist };
  }

  // No separator found, return title as songTitle with empty artist
  return { songTitle: title.trim(), artist: '' };
};

/**
 * Parse NetEase Cloud Music URL and convert to iframe embed code
 * Supports various NetEase Cloud Music URL formats:
 * - https://music.163.com/#/song?id=12345
 * - https://music.163.com/song?id=12345
 * - Already formatted iframe HTML code (for backward compatibility)
 *
 * @param urlOrCode - NetEase Cloud Music URL or iframe HTML code
 * @returns Iframe embed HTML code
 */
export const convertToIframe = (urlOrCode: string): string => {
  if (!urlOrCode || urlOrCode.trim() === '') {
    return '';
  }

  const input = urlOrCode.trim();

  // If it's already an iframe code (backward compatibility)
  if (input.toLowerCase().includes('<iframe')) {
    return input;
  }

  // Try to extract song ID from NetEase Cloud Music URL
  // Pattern 1: https://music.163.com/#/song?id=12345
  // Pattern 2: https://music.163.com/song?id=12345
  const netEasePatterns = [
    /music\.163\.com\/.*?[?&]id=(\d+)/i,
    /music\.163\.com\/song\/(\d+)/i,
    /music\.163\.com\/#\/song\?id=(\d+)/i,
  ];

  for (const pattern of netEasePatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      const songId = match[1];
      // Generate NetEase Cloud Music iframe embed code with sandbox for security
      // auto=0 to prevent auto-play and avoid NotAllowedError
      // allow="autoplay; encrypted-media" to fix Feature Policy restrictions
      return `<iframe
        src="https://music.163.com/outchain/player?type=2&id=${songId}&auto=0&height=66"
        frameborder="0"
        style="width: 100%; height: 66px;"
        allowfullscreen
        allow="autoplay; encrypted-media"
        sandbox="allow-forms allow-popups allow-scripts allow-same-origin"
        loading="lazy"
      ></iframe>`;
    }
  }

  // If URL doesn't match any known pattern, return empty string
  // (could also return the original input as a fallback)
  console.warn('Unrecognized music URL format:', input);
  return '';
};

/**
 * Validate if a string is a valid music URL or iframe code
 * @param input - Input string to validate
 * @returns True if valid, false otherwise
 */
export const isValidMusicInput = (input: string): boolean => {
  if (!input || input.trim() === '') {
    return false;
  }

  const trimmedInput = input.trim();

  // Check if it's an iframe code
  if (trimmedInput.toLowerCase().includes('<iframe')) {
    return true;
  }

  // Check if it's a NetEase Cloud Music URL
  const netEasePattern = /music\.163\.com\/.*?[?&]id=\d+/i;
  return netEasePattern.test(trimmedInput);
};

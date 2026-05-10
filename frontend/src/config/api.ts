// API Configuration from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  ME: '/me',
  USER_BY_USERNAME: '/user/by-username',

  // Images
  IMAGES: '/images',
  IMAGE_DETAIL: (id: number) => `/images/${id}`,
  IMAGE_LIKE: (id: number) => `/images/${id}/like`,
  IMAGE_DELETE: (id: number) => `/images/${id}`,

  // Users
  USER_PROFILE: (id: string) => `/users/${id}`,
  USER_UPLOADS: (id: string) => `/users/${id}/uploads`,
  USER_LIKES: (id: string) => `/users/${id}/likes`,
  USER_FOLLOW: (id: string) => `/users/${id}/follow`,
  USER_FOLLOW_STATUS: (id: string) => `/users/${id}/follow-status`,
  USER_FOLLOWERS: (id: string) => `/users/${id}/followers`,
  USER_FOLLOWING: (id: string) => `/users/${id}/following`,
  USER_UPDATE_PROFILE: (id: string) => `/users/${id}/profile`,
  CURRENT_USER_PROFILE: '/user/profile',
} as const;

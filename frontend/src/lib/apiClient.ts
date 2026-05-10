import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

/**
 * Unified API Client for making HTTP requests
 * Handles authentication, error handling, and response formatting
 */

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Generic request function
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get auth token
  const token = getAuthToken();

  // Set headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-JSON responses (like blob for file downloads)
    if (!response.headers.get('content-type')?.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.blob()) as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// API Client object with all methods
export const apiClient = {
  // GET request
  async get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
    // Filter out undefined values and convert to URLSearchParams
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== undefined)
        )
      : {};
    const queryString = Object.keys(cleanParams).length > 0
      ? `?${new URLSearchParams(
          Object.entries(cleanParams).map(([key, value]) => [key, String(value)])
        ).toString()}`
      : '';
    return request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  },

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, {
      method: 'DELETE',
    });
  },

  // POST request with FormData (for file uploads)
  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },

  // PUT request with FormData (for file uploads)
  async putFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  },
};

// Specific API methods using the client
export const api = {
  // Auth APIs
  auth: {
    login: (email: string, password: string) =>
      apiClient.post(API_ENDPOINTS.LOGIN, { email, password }),

    register: (username: string, email: string, password: string, bio?: string) =>
      apiClient.post(API_ENDPOINTS.REGISTER, { username, email, password, bio }),

    getMe: () =>
      apiClient.get(API_ENDPOINTS.ME),

    getUserByUsername: (username: string) =>
      apiClient.get(`${API_ENDPOINTS.USER_BY_USERNAME}?username=${encodeURIComponent(username)}`),
  },

  // Image APIs
  images: {
    getList: (params?: { page?: number; limit?: number; category?: string; exclude_category?: string; q?: string | undefined }) =>
      apiClient.get(API_ENDPOINTS.IMAGES, params),

    getById: (id: number) =>
      apiClient.get(API_ENDPOINTS.IMAGE_DETAIL(id)),

    upload: (formData: FormData) =>
      apiClient.postFormData(API_ENDPOINTS.IMAGES, formData),

    like: (id: number) =>
      apiClient.post(API_ENDPOINTS.IMAGE_LIKE(id)),

    delete: (id: number) =>
      apiClient.delete(API_ENDPOINTS.IMAGE_DELETE(id)),
  },

  // User APIs
  users: {
    getProfile: (id: string) =>
      apiClient.get(API_ENDPOINTS.USER_PROFILE(id)),

    getUploads: (id: string, params?: { page?: number; limit?: number; category?: string; exclude_category?: string }) =>
      apiClient.get(API_ENDPOINTS.USER_UPLOADS(id), params),

    getLikes: (id: string, params?: { page?: number; limit?: number }) =>
      apiClient.get(API_ENDPOINTS.USER_LIKES(id), params),

    follow: (id: string) =>
      apiClient.post(API_ENDPOINTS.USER_FOLLOW(id)),

    getFollowStatus: (id: string) =>
      apiClient.get(API_ENDPOINTS.USER_FOLLOW_STATUS(id)),

    getFollowers: (id: string) =>
      apiClient.get(API_ENDPOINTS.USER_FOLLOWERS(id)),

    getFollowing: (id: string) =>
      apiClient.get(API_ENDPOINTS.USER_FOLLOWING(id)),

    updateProfile: (id: string, data: { username?: string; bio?: string; avatar_url?: string }) =>
      apiClient.put(API_ENDPOINTS.USER_UPDATE_PROFILE(id), data),

    updateCurrentUserProfile: (formData: FormData) =>
      apiClient.putFormData(API_ENDPOINTS.CURRENT_USER_PROFILE, formData),
  },
};

export default apiClient;

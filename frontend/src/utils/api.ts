/**
 * API utility functions for making requests to the backend
 */

const API_BASE_URL = 'http://localhost:8081/api';

/**
 * Get the authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Common request headers including authorization
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Delete an image by ID
 * @param imageId - The ID of the image to delete
 * @returns Promise with the response data
 */
export const deleteImage = async (imageId: number): Promise<{ message: string; id: number }> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/images/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete image');
  }

  return response.json();
};

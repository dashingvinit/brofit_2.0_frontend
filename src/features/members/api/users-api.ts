import { apiClient } from '@/shared/lib/api-client';
import type { User, ApiResponse } from '@/shared/types/common.types';

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'member' | 'trainer' | 'admin';
  imageUrl?: string;
}

export interface GetAllUsersResponse extends ApiResponse<User[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const usersApi = {
  /**
   * Sync current authenticated user to database
   */
  syncCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/users/sync');
    return response.data;
  },

  /**
   * Get current user information
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  /**
   * Get all users in the organization
   */
  getAllUsers: async (page = 1, limit = 100): Promise<GetAllUsersResponse> => {
    const response = await apiClient.get('/users', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Update user by ID
   */
  updateUser: async (userId: string, data: UpdateUserData): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Delete user by ID
   */
  deleteUser: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },
};

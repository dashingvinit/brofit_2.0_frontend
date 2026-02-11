import { apiClient } from '@/shared/lib/api-client';
import type { User, ApiResponse } from '@/shared/types/common.types';

export const membersApi = {
  /**
   * Sync current authenticated user to database
   * POST /api/v1/users/sync
   */
  syncCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/users/sync');
    return response.data;
  },

  /**
   * Get current authenticated user in organization
   * GET /api/v1/users/me
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  /**
   * Create a new user (member) in the organization
   * POST /api/v1/users
   */
  createUser: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role?: string;
    clerkUserId?: string;
    imageUrl?: string;
  }): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/users', {
      ...userData,
      role: userData.role || 'member',
    });
    return response.data;
  },

  /**
   * Get all users in organization with pagination (admin only)
   * GET /api/v1/users
   */
  getMembers: async (page = 1, limit = 10): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get('/users', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get a user by ID (admin or owner)
   * GET /api/v1/users/:id
   */
  getMemberById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Update user (admin or owner)
   * PATCH /api/v1/users/:id
   */
  updateUser: async (
    id: string,
    updateData: {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      role?: string;
      imageUrl?: string;
    }
  ): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch(`/users/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete user (admin only)
   * DELETE /api/v1/users/:id
   */
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};

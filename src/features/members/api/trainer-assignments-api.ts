import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse } from '@/shared/types/common.types';

export interface TrainerAssignment {
  _id: string;
  organizationId: string;
  memberId: string;
  trainerId: string;
  status: 'active' | 'inactive' | 'completed';
  assignedAt: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const trainerAssignmentsApi = {
  /**
   * Assign a trainer to a member
   * POST /api/v1/trainer-assignments
   */
  assignTrainer: async (data: {
    memberId: string;
    trainerId: string;
    startDate?: string;
    endDate?: string;
    notes?: string;
  }): Promise<ApiResponse<TrainerAssignment>> => {
    const response = await apiClient.post('/trainer-assignments', data);
    return response.data;
  },

  /**
   * Get all trainer assignments
   * GET /api/v1/trainer-assignments
   */
  getAssignments: async (filters?: {
    memberId?: string;
    trainerId?: string;
    status?: string;
  }): Promise<ApiResponse<TrainerAssignment[]>> => {
    const response = await apiClient.get('/trainer-assignments', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get member's active trainer
   * GET /api/v1/trainer-assignments/member/:memberId/active
   */
  getMemberActiveTrainer: async (memberId: string): Promise<ApiResponse<TrainerAssignment>> => {
    const response = await apiClient.get(`/trainer-assignments/member/${memberId}/active`);
    return response.data;
  },

  /**
   * Get all members assigned to a trainer
   * GET /api/v1/trainer-assignments/trainer/:trainerId/members
   */
  getTrainerMembers: async (trainerId: string): Promise<ApiResponse<TrainerAssignment[]>> => {
    const response = await apiClient.get(`/trainer-assignments/trainer/${trainerId}/members`);
    return response.data;
  },

  /**
   * Update assignment
   * PATCH /api/v1/trainer-assignments/:id
   */
  updateAssignment: async (
    id: string,
    data: {
      trainerId?: string;
      status?: 'active' | 'inactive' | 'completed';
      startDate?: string;
      endDate?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<TrainerAssignment>> => {
    const response = await apiClient.patch(`/trainer-assignments/${id}`, data);
    return response.data;
  },

  /**
   * Delete assignment
   * DELETE /api/v1/trainer-assignments/:id
   */
  deleteAssignment: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/trainer-assignments/${id}`);
    return response.data;
  },
};

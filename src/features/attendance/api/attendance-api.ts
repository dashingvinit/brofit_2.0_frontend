import { apiClient } from '@/shared/lib/api-client';
import type {
  ApiResponse,
  AttendanceRecord,
  AttendanceCurrentlyInside,
  AttendanceByDate,
  AttendanceTodayStats,
  PaginationInfo,
} from '@/shared/types/common.types';

export interface AttendanceHistoryResponse {
  success: boolean;
  data: AttendanceRecord[];
  pagination: PaginationInfo;
}

export const attendanceApi = {
  /**
   * Check in a member
   * POST /api/v1/attendance/check-in
   */
  checkIn: async (memberId: string, notes?: string): Promise<ApiResponse<AttendanceRecord>> => {
    const response = await apiClient.post('/attendance/check-in', { memberId, notes });
    return response.data;
  },

  /**
   * Check out a member by attendance record ID
   * PATCH /api/v1/attendance/:id/check-out
   */
  checkOut: async (attendanceId: string): Promise<ApiResponse<AttendanceRecord>> => {
    const response = await apiClient.patch(`/attendance/${attendanceId}/check-out`);
    return response.data;
  },

  /**
   * Get members currently inside the gym
   * GET /api/v1/attendance/inside
   */
  getCurrentlyInside: async (): Promise<ApiResponse<AttendanceCurrentlyInside>> => {
    const response = await apiClient.get('/attendance/inside');
    return response.data;
  },

  /**
   * Get today's quick stats
   * GET /api/v1/attendance/stats
   */
  getTodayStats: async (): Promise<ApiResponse<AttendanceTodayStats>> => {
    const response = await apiClient.get('/attendance/stats');
    return response.data;
  },

  /**
   * Get all attendance records for a date (today if omitted)
   * GET /api/v1/attendance?date=YYYY-MM-DD
   */
  getByDate: async (date?: string): Promise<ApiResponse<AttendanceByDate>> => {
    const params = date ? { date } : {};
    const response = await apiClient.get('/attendance', { params });
    return response.data;
  },

  /**
   * Get today's hourly counts + historical avg per hour
   * GET /api/v1/attendance/peak-hours
   */
  getPeakHoursData: async (): Promise<ApiResponse<{
    today: { hour: number; count: number }[];
    avg: { hour: number; avg: number }[];
  }>> => {
    const response = await apiClient.get('/attendance/peak-hours');
    return response.data;
  },

  /**
   * Get attendance history for a member
   * GET /api/v1/attendance/member/:memberId
   */
  getMemberHistory: async (
    memberId: string,
    page = 1,
    limit = 20,
  ): Promise<AttendanceHistoryResponse> => {
    const response = await apiClient.get(`/attendance/member/${memberId}`, {
      params: { page, limit },
    });
    return response.data;
  },
};

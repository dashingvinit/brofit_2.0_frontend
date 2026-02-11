/**
 * @deprecated This file is maintained for backward compatibility only.
 * Please use usersApi from './users-api' instead.
 *
 * This module re-exports usersApi with method aliases for existing code.
 */
import { usersApi } from './users-api';
import type { ApiResponse } from '@/shared/types/common.types';

export const membersApi = {
  /**
   * @deprecated Use usersApi.syncCurrentUser instead
   */
  syncCurrentUser: usersApi.syncCurrentUser,

  /**
   * @deprecated Use usersApi.getCurrentUser instead
   */
  getCurrentUser: usersApi.getCurrentUser,

  /**
   * @deprecated Use usersApi.createUser instead
   */
  createUser: usersApi.createUser,

  /**
   * @deprecated Use usersApi.getAllUsers instead
   * Alias: getMembers → getAllUsers
   */
  getMembers: usersApi.getAllUsers,

  /**
   * @deprecated Use usersApi.getUserById instead
   * Alias: getMemberById → getUserById
   */
  getMemberById: usersApi.getUserById,

  /**
   * @deprecated Use usersApi.updateUser instead
   */
  updateUser: usersApi.updateUser,

  /**
   * @deprecated Use usersApi.deleteUser instead
   */
  deleteUser: usersApi.deleteUser,
};

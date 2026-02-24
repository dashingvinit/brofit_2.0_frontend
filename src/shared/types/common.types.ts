import { ROLES } from '../lib/constants';

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Member - Matches Prisma schema
 * Represents a gym member in the system
 */
export interface Member {
  id: string;
  orgId: string;
  clerkUserId?: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string; // ISO date string
  gender: string;
  joinDate: string; // ISO date string
  notes?: string | null;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number; // Changed from totalPages to match backend
  hasNext: boolean; // NEW
  hasPrev: boolean; // NEW
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
}

export interface MembershipPlan {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  durationDays: number;
  price: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Training Plan Catalog
export interface TrainingPlan {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  category: "weight-training" | "cardio" | "yoga" | "crossfit" | "personal-training" | "group-class" | "other";
  durationDays?: number;
  sessionsPerWeek?: number;
  price: number;
  features: string[];
  requiresTrainer: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data required to create a new member
 */
export interface CreateMemberData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  gender: string;
  joinDate?: string; // ISO date string, defaults to today
  notes?: string;
  clerkUserId?: string;
}

/**
 * Data for updating an existing member
 */
export interface UpdateMemberData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  joinDate?: string;
  notes?: string;
  isActive?: boolean;
}

/**
 * Member statistics response
 */
export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

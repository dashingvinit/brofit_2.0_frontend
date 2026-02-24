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

/**
 * PlanType - Matches Prisma schema
 * Represents a plan category (e.g., Cardio, Strength, Yoga)
 */
export interface PlanType {
  id: string;
  orgId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string; // ISO date string
  variants?: PlanVariant[]; // Optional variants when fetched with relations
}

/**
 * PlanVariant - Matches Prisma schema
 * Represents a pricing/duration tier for a plan type
 */
export interface PlanVariant {
  id: string;
  planTypeId: string;
  durationDays: number;
  durationLabel: string; // e.g., "1 Month", "3 Months", "1 Year"
  price: number;
  isActive: boolean;
  createdAt: string; // ISO date string
  planType?: PlanType; // Optional plan type when fetched with relations
}

/**
 * Data required to create a new plan type
 */
export interface CreatePlanTypeData {
  name: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Data for updating an existing plan type
 */
export interface UpdatePlanTypeData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Data required to create a new plan variant
 */
export interface CreatePlanVariantData {
  durationDays: number;
  durationLabel: string;
  price: number;
  isActive?: boolean;
}

/**
 * Data for updating an existing plan variant
 */
export interface UpdatePlanVariantData {
  durationDays?: number;
  durationLabel?: string;
  price?: number;
  isActive?: boolean;
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

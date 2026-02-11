import { ROLES } from '../lib/constants';

export type Role = typeof ROLES[keyof typeof ROLES];

// Embedded membership instance (in User)
export interface MembershipPlanInstance {
  _id: string; // Instance ID in subdocument array
  planId: string; // Reference to catalog
  planName: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  amountPaid?: number;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

// Embedded training instance (in User)
export interface TrainingPlanInstance {
  _id: string; // Instance ID in subdocument array
  planId?: string;
  planName: string;
  trainerId?: string;
  trainerName?: string;
  startDate: string;
  endDate?: string;
  status: "active" | "completed" | "cancelled";
  sessionsPerWeek?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// User with embedded arrays (matching backend structure)
export interface User {
  id: string;
  clerkUserId?: string;
  clerkOrganizationId: string;
  email: string;
  firstName: string; // REQUIRED in backend
  lastName: string; // REQUIRED in backend
  phone?: string;
  role: Role;
  imageUrl?: string;
  isActive: boolean;
  membershipPlans: MembershipPlanInstance[]; // NEW - embedded array
  trainingPlans: TrainingPlanInstance[]; // NEW - embedded array
  createdAt: string;
  updatedAt: string;
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

// @deprecated - No longer used. Backend embeds memberships in User.membershipPlans array
// Kept temporarily for backward compatibility during migration
export interface UserMembership {
  id: string;
  userId: string;
  membershipPlanId: string;
  organizationId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  autoRenew: boolean;
  amountPaid?: number;
  paymentReference?: string;
  notes?: string;
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

export interface MemberRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  planId: string;
  planName?: string; // NEW - plan name for embedded array
  startDate?: Date;
  amountPaid?: number;
  paymentReference?: string;
  autoRenew?: boolean;
  notes?: string;
  trainerId?: string; // NEW - for training plan assignment
  trainerName?: string; // NEW - for training plan assignment
}

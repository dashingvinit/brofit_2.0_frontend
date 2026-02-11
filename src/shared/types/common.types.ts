import { ROLES } from '../lib/constants';

export type Role = typeof ROLES[keyof typeof ROLES];

export interface User {
  id: string;
  clerkUserId?: string;
  clerkOrganizationId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
  imageUrl?: string;
  isActive: boolean;
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
  totalPages: number;
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

export interface MemberRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  planId: string;
  startDate?: Date;
  amountPaid?: number;
  paymentReference?: string;
  autoRenew?: boolean;
  notes?: string;
}

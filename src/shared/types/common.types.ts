import { ROLES } from "../lib/constants";

export type Role = (typeof ROLES)[keyof typeof ROLES];

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
export type PlanCategory = "membership" | "training";

export interface PlanType {
  id: string;
  orgId: string;
  name: string;
  description?: string | null;
  category: PlanCategory;
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
  /**
   * Category of the plan. required because the server defaults to
   * "membership" when this field is missing, which was causing
   * inadvertently-created training plans to be stored under the wrong
   * category.
   */
  category: PlanCategory;
  isActive?: boolean;
}

/**
 * Data for updating an existing plan type
 */
export interface UpdatePlanTypeData {
  name?: string;
  description?: string;
  /**
   * Category can be updated after creation (e.g. move a plan between
   * training/membership).  Leaving it off means "don't change it".
   */
  category?: PlanCategory;
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

/**
 * Membership status enum
 */
export type MembershipStatus = "active" | "expired" | "cancelled" | "frozen";

/**
 * Payment method enum
 */
export type PaymentMethod = "cash" | "card" | "upi" | "bank_transfer" | "other";

/**
 * Payment status enum
 */
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

/**
 * Payment - Matches Prisma schema
 */
export interface Payment {
  id: string;
  orgId: string;
  memberId: string;
  membershipId?: string | null;
  trainingId?: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string | null;
  notes?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  member?: Member;
  membership?: Membership;
}

/**
 * Membership - Matches Prisma schema
 */
export interface Membership {
  id: string;
  orgId: string;
  memberId: string;
  planVariantId: string;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  priceAtPurchase: number;
  discountAmount: number;
  finalPrice: number;
  autoRenew: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  member?: Member;
  planVariant?: PlanVariant & { planType?: PlanType };
  payments?: Payment[];
}

/**
 * Data required to create a new membership
 */
export interface CreateMembershipData {
  memberId: string;
  planVariantId: string;
  startDate?: string;
  discountAmount?: number;
  autoRenew?: boolean;
  notes?: string;
  paymentAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paymentNotes?: string;
}

/**
 * Membership dues response from GET /memberships/:id/dues
 */
export interface MembershipDues {
  membershipId: string;
  finalPrice: number;
  totalPaid: number;
  dueAmount: number;
  isFullyPaid: boolean;
  payments: Payment[];
}

/**
 * Data required to record a payment
 */
export interface RecordPaymentData {
  memberId: string;
  membershipId?: string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  reference?: string;
  notes?: string;
}

/**
 * Membership statistics response
 */
export interface MembershipStats {
  total: number;
  active: number;
  expired: number;
  cancelled: number;
  newThisMonth: number;
}

/**
 * Training status enum
 */
export type TrainingStatus = "active" | "expired" | "cancelled" | "frozen";

/**
 * Training - Matches Prisma schema
 */
export interface Training {
  id: string;
  orgId: string;
  memberId: string;
  planVariantId: string;
  trainerName: string;
  startDate: string;
  endDate: string;
  status: TrainingStatus;
  priceAtPurchase: number;
  discountAmount: number;
  finalPrice: number;
  autoRenew: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  member?: Member;
  planVariant?: PlanVariant & { planType?: PlanType };
  payments?: Payment[];
}

/**
 * Data required to create a new training
 */
export interface CreateTrainingData {
  memberId: string;
  planVariantId: string;
  trainerName: string;
  startDate?: string;
  discountAmount?: number;
  autoRenew?: boolean;
  notes?: string;
  paymentAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paymentNotes?: string;
}

/**
 * Training dues response from GET /trainings/:id/dues
 */
export interface TrainingDues {
  trainingId: string;
  finalPrice: number;
  totalPaid: number;
  dueAmount: number;
  isFullyPaid: boolean;
  payments: Payment[];
}

/**
 * Data required to record a training payment
 */
export interface RecordTrainingPaymentData {
  memberId: string;
  trainingId?: string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  reference?: string;
  notes?: string;
}

/**
 * Training statistics response
 */
export interface TrainingStats {
  total: number;
  active: number;
  expired: number;
  cancelled: number;
  newThisMonth: number;
}

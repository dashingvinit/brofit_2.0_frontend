
/**
 * Member - Matches Prisma schema
 * Represents a gym member in the system
 */
export interface Member {
  id: string;
  orgId: string;
  clerkUserId?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string; // ISO date string
  gender: string;
  joinDate: string; // ISO date string
  notes?: string | null;
  isActive: boolean;
  referredById?: string | null;
  referredBy?: Pick<Member, 'id' | 'firstName' | 'lastName'> | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Populated only in search results (attendance check-in)
  memberships?: Array<{
    id: string;
    status: string;
    planVariant: {
      durationLabel: string;
      planType: { name: string; category: string };
    };
  }>;
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
  defaultTrainerSplitPercent?: number | null;
  defaultTrainerFixedPayout?: number | null;
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
  middleName?: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  gender: string;
  joinDate?: string; // ISO date string, defaults to today
  notes?: string;
  clerkUserId?: string;
  referredById?: string;
}

/**
 * Data for updating an existing member
 */
export interface UpdateMemberData {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  joinDate?: string;
  notes?: string;
  isActive?: boolean;
  referredById?: string | null;
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
 * Shared status for memberships and trainings.
 */
export type SubscriptionStatus = "scheduled" | "active" | "expired" | "cancelled" | "frozen";

/** @alias SubscriptionStatus */
export type MembershipStatus = SubscriptionStatus;

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
  freezeReason?: string | null;
  freezeStartDate?: string | null;
  freezeEndDate?: string | null;
  offerId?: string | null;
  createdAt: string;
  updatedAt: string;
  member?: Member;
  planVariant?: PlanVariant & { planType?: PlanType };
  offer?: Offer | null;
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
  offerId?: string;
  autoRenew?: boolean;
  notes?: string;
  trainingPlanVariantId?: string; // passed for combo offer validation
  paymentAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paymentNotes?: string;
  paymentDate?: string;
  referredById?: string;
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
 * Data required to record a payment (membership or training).
 */
export interface RecordPaymentData {
  memberId: string;
  membershipId?: string;
  trainingId?: string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  reference?: string;
  notes?: string;
  paidAt?: string;
}

/**
 * Shared statistics for memberships and trainings.
 */
export interface SubscriptionStats {
  total: number;
  active: number;
  expired: number;
  cancelled: number;
  newThisMonth: number;
  totalCollected: number;
  collectedThisMonth: number;
}

/** @alias SubscriptionStats */
export type MembershipStats = SubscriptionStats;

/**
 * Trainer - Matches Prisma schema
 */
export interface Trainer {
  id: string;
  orgId: string;
  name: string;
  splitPercent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { trainings: number };
}

/**
 * Trainer with active client trainings (from GET /trainers/:id/clients)
 */
export interface TrainerWithClients extends Trainer {
  trainings: Array<{
    id: string;
    status: TrainingStatus;
    startDate: string;
    endDate: string;
    finalPrice: number;
    member: Pick<Member, 'id' | 'firstName' | 'lastName' | 'phone' | 'email' | 'isActive'>;
    planVariant?: {
      durationLabel: string;
      planType?: { name: string };
    };
  }>;
}

/** @alias SubscriptionStatus */
export type TrainingStatus = SubscriptionStatus;

/**
 * Training - Matches Prisma schema
 */
export interface Training {
  id: string;
  orgId: string;
  memberId: string;
  planVariantId: string;
  trainerId: string;
  startDate: string;
  endDate: string;
  status: TrainingStatus;
  priceAtPurchase: number;
  discountAmount: number;
  finalPrice: number;
  autoRenew: boolean;
  notes?: string | null;
  offerId?: string | null;
  trainerFixedPayout?: number | null;
  createdAt: string;
  updatedAt: string;
  member?: Member;
  planVariant?: PlanVariant & { planType?: PlanType };
  trainer?: Trainer;
  offer?: Offer | null;
  payments?: Payment[];
}

/**
 * Data required to create a new training
 */
export interface CreateTrainingData {
  memberId: string;
  planVariantId: string;
  trainerId: string;
  startDate?: string;
  discountAmount?: number;
  offerId?: string;
  autoRenew?: boolean;
  notes?: string;
  trainerFixedPayout?: number | null;
  paymentAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paymentNotes?: string;
  paymentDate?: string;
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

/** @alias RecordPaymentData */
export type RecordTrainingPaymentData = RecordPaymentData;

/** @alias SubscriptionStats */
export type TrainingStats = SubscriptionStats;

// ─── Trainer Payouts ──────────────────────────────────────────────────────────

export interface TrainerPayoutMonthSlot {
  month: number;
  year: number;
  revenueBase: number;
  amount: number;
  paid: boolean;
  paidAt: string | null;
  isFixedPayout: boolean;
}

export interface TrainerPayoutRow {
  training: {
    id: string;
    status: TrainingStatus;
    startDate: string;
    endDate: string;
    trainerFixedPayout?: number | null;
    finalPrice: number;
    member: Pick<Member, 'id' | 'firstName' | 'lastName' | 'phone' | 'email'>;
    planVariant?: {
      durationLabel: string;
      planType?: { name: string };
    };
  };
  months: TrainerPayoutMonthSlot[];
  totalMonths: number;
  totalOwed: number;
  totalPaid: number;
  outstanding: number;
}

export interface TrainerPayoutSchedule {
  rows: TrainerPayoutRow[];
  summary: {
    totalOwed: number;
    totalPaid: number;
    outstanding: number;
  };
  splitPercent: number;
}

export interface TrainerPayoutRecord {
  id: string;
  orgId: string;
  trainerId: string;
  trainingId: string;
  month: number;
  year: number;
  revenueBase: number;
  splitPercent: number;
  amount: number;
  notes?: string | null;
  paidAt: string;
  createdAt: string;
}

export interface TrainerOutstandingSummary {
  [trainerId: string]: {
    totalOwed: number;
    totalPaid: number;
    outstanding: number;
  };
}

export interface RecordTrainerPayoutData {
  trainingId: string;
  month: number;
  year: number;
  notes?: string;
}

// ─── Financials ───────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'rent'
  | 'utilities'
  | 'staff'
  | 'equipment'
  | 'marketing'
  | 'maintenance'
  | 'other';

export interface Expense {
  id: string;
  orgId: string;
  amount: number;
  category: ExpenseCategory;
  description?: string | null;
  date: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  orgId: string;
  name: string;
  amount: number;
  date: string; // ISO date string
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySummary {
  period: string; // "YYYY-MM"
  from: string;
  to: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}

export interface PeriodSummary {
  from: string;
  to: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}

export interface MonthlySummaryWithDelta {
  period: string; // "YYYY-MM"
  thisMonth: PeriodSummary;
  lastMonth: PeriodSummary | null;
  sameMonthLastYear: PeriodSummary | null;
}

export interface RoiMetrics {
  totalInvested: number;
  totalRevenue: number;
  totalExpenses: number;
  totalNetProfit: number;
  roiPercent: number | null;
  paybackMonths: number | null;
}

export interface TrendPoint {
  year: number;
  month: number; // 1-indexed
  revenue: number;
  expenses: number;
  netProfit: number;
}

export interface CreateExpenseData {
  amount: number;
  category: ExpenseCategory;
  date: string; // "YYYY-MM-DD"
  description?: string;
}

export interface UpdateExpenseData {
  amount?: number;
  category?: ExpenseCategory;
  date?: string;
  description?: string;
}

export interface CreateInvestmentData {
  name: string;
  amount: number;
  date: string; // "YYYY-MM-DD"
  notes?: string;
}

export interface UpdateInvestmentData {
  name?: string;
  amount?: number;
  date?: string;
  notes?: string;
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export interface TopPlanVariant {
  planVariantId: string;
  durationLabel: string;
  count: number;
  revenue: number;
}

export interface TopPlanItem {
  planName: string;
  category: PlanCategory;
  totalCount: number;
  totalRevenue: number;
  variants: TopPlanVariant[];
}

export interface RetentionMetrics {
  totalMembers: number;
  activeCount: number;
  membersWithHistory: number;
  repeatCount: number;
  oneTimeCount: number;
  churnedCount: number;
  retentionRate: number;
}

export interface RevenueBreakdownPoint {
  year: number;
  month: number;
  membership: number;
  training: number;
  total: number;
}

export interface PaymentMethodItem {
  method: PaymentMethod;
  count: number;
  amount: number;
  percentage: number;
}

export interface TrainerPerformanceItem {
  trainerId: string;
  trainerName: string;
  activeClients: number;
  totalClients: number;
  totalRevenue: number;
  avgPlanPrice: number;
}

export interface MemberGrowthPoint {
  year: number;
  month: number;
  newMembers: number;
}

export interface MembershipDurationBucket {
  durationLabel: string;
  durationDays: number;
  count: number;
  percentage: number;
}

export interface MembershipDurationPreference {
  avgMonths: number;
  buckets: MembershipDurationBucket[];
}

export interface DemographicsData {
  gender: { label: string; count: number; percentage: number }[];
  ageBrackets: { label: string; count: number; percentage: number }[];
  totalMembers: number;
}

// ─── Unit Economics & Projection ─────────────────────────────────────────────

export interface UnitEconomics {
  window: number;
  activeMembers: number;
  arpu: number;
  churnRate: number;
  churnPercent: number;
  ltv: number | null;
  avgNewJoinsPerMonth: number;
  dataPoints: number;
}

export interface ProjectionMonth {
  month: number;
  members: number;
  revenue: number;
  cost: number;
  profit: number;
  cumulativeProfit: number;
}

export interface ProjectionScenario {
  months: ProjectionMonth[];
  paybackMonth: number | null;
  roiAtHorizon: number | null;
}

export interface ProjectionInputs {
  activeMembers: number;
  arpu: number;
  churnRate: number;
  churnPercent: number;
  avgNewJoinsPerMonth: number;
  fixedCostPerMonth: number;
  fixedCostSource: 'actual_avg' | 'override';
  capex: number;
  window: number;
  horizon: number;
  dataPoints: number;
}

export interface ProjectionData {
  inputs: ProjectionInputs;
  base: ProjectionScenario;
  worst: ProjectionScenario;
  best: ProjectionScenario;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id: string;
  orgId: string;
  memberId: string;
  entryTime: string; // ISO datetime
  exitTime: string | null; // ISO datetime, null if still inside
  date: string; // ISO date
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  member?: Pick<Member, "id" | "firstName" | "lastName" | "phone" | "email"> & {
    memberships?: Array<{
      id: string;
      planVariant: {
        durationLabel: string;
        planType: { name: string; category: string };
      };
    }>;
  };
}

export interface AttendanceCurrentlyInside {
  count: number;
  records: AttendanceRecord[];
}

export interface AttendanceByDate {
  totalVisits: number;
  currentlyInside: number;
  records: AttendanceRecord[];
}

export interface AttendanceTodayStats {
  currentlyInside: number;
  totalToday: number;
}

// ─── Offers ───────────────────────────────────────────────────────────────────

export type OfferType = 'event' | 'referral' | 'discount' | 'promo';
export type DiscountType = 'flat' | 'percentage';
export type OfferAppliesTo = 'membership' | 'training' | 'both';

export interface Offer {
  id: string;
  orgId: string;
  type: OfferType;
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  discountType?: DiscountType | null;
  discountValue?: number | null;
  code?: string | null;
  rewardAmount?: number | null;
  appliesTo: OfferAppliesTo;
  createdAt: string;
  updatedAt: string;
  // Package configuration
  targetGender?: string | null;
  membershipPlanVariantId?: string | null;
  trainingPlanVariantId?: string | null;
  targetPrice?: number | null;
  trainerFixedPayout?: number | null;
  trainerSplitPercent?: number | null;
  membershipPlanVariant?: Pick<PlanVariant, 'id' | 'price' | 'durationLabel' | 'durationDays'> & {
    planType: Pick<PlanType, 'id' | 'name' | 'category'>;
  } | null;
  trainingPlanVariant?: Pick<PlanVariant, 'id' | 'price' | 'durationLabel' | 'durationDays'> & {
    planType: Pick<PlanType, 'id' | 'name' | 'category'>;
  } | null;
  _count?: { memberships: number; trainings: number };
}

export interface CreateOfferData {
  type: OfferType;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  discountType?: DiscountType;
  discountValue?: number;
  code?: string;
  rewardAmount?: number;
  appliesTo?: OfferAppliesTo;
  targetGender?: string | null;
  membershipPlanVariantId?: string | null;
  trainingPlanVariantId?: string | null;
  targetPrice?: number | null;
  trainerFixedPayout?: number | null;
  trainerSplitPercent?: number | null;
}

export interface UpdateOfferData {
  title?: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  discountType?: DiscountType | null;
  discountValue?: number | null;
  code?: string | null;
  rewardAmount?: number | null;
  appliesTo?: OfferAppliesTo;
  targetGender?: string | null;
  membershipPlanVariantId?: string | null;
  trainingPlanVariantId?: string | null;
  targetPrice?: number | null;
  trainerFixedPayout?: number | null;
  trainerSplitPercent?: number | null;
}

// ── Platform (Super Admin) ───────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  ownerUserId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    trainers: number;
    planTypes: number;
  };
  stats?: {
    totalMembers: number;
    activeMembers: number;
    totalRevenue: number;
  };
}

export interface ClerkOrgMember {
  id: string;
  role: string;
  createdAt: number;
  publicUserData: {
    userId: string;
    firstName: string | null;
    lastName: string | null;
    identifier: string;
    imageUrl: string;
  };
}

export interface ClerkOrgInvitation {
  id: string;
  emailAddress: string;
  role: string;
  status: string;
  createdAt: number;
}

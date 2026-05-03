import type { MembershipStatus, TrainingStatus, PaymentStatus } from '@/shared/types/common.types';

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export const SUBSCRIPTION_STATUS_CONFIG: Record<
  MembershipStatus | TrainingStatus,
  { label: string; variant: BadgeVariant }
> = {
  upcoming: { label: 'Upcoming', variant: 'outline' },
  active: { label: 'Active', variant: 'default' },
  expired: { label: 'Expired', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  frozen: { label: 'Frozen', variant: 'outline' },
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; variant: BadgeVariant }
> = {
  paid: { label: 'Paid', variant: 'default' },
  pending: { label: 'Pending', variant: 'outline' },
  failed: { label: 'Failed', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'secondary' },
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  other: 'Other',
};

export const ROUTES = {
  HOME: "/",
  ADMIN_PORTAL: "/admin-portal",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  MEMBERS: "/members",
  MEMBER_DETAIL: "/members",
  REGISTER_MEMBER: "/members/register",
  MEMBERSHIPS: "/memberships",
  CREATE_MEMBERSHIP: "/memberships/create",
  PLANS: "/plans",
  TRAININGS: "/trainings",
  CREATE_TRAINING: "/trainings/create",
  TRAINERS: "/trainers",
  TRAINER_DETAIL: "/trainers",
  TRAINER_ASSIGNMENTS: "/trainer-assignments",
  FINANCIALS: "/financials",
  ANALYTICS: "/analytics",
  ATTENDANCE: "/attendance",
  RECEPTION: "/reception",
  SETTINGS: "/settings",
  SETTINGS_STAFF: "/settings/staff",
  SETTINGS_WHATSAPP: "/settings/whatsapp",
  SETTINGS_BROADCAST: "/settings/broadcast",
  WHATSAPP: "/whatsapp",
  INBOX: "/inbox",
  OFFERS: "/offers",
  CREATE_OFFER: "/offers/new",
  EDIT_OFFER: "/offers",
  RECYCLE_BIN: "/members/recycle-bin",
  MEMBERSHIP_RECEIPT: "/memberships",
  // Super admin platform
  PLATFORM: "/platform",
  PLATFORM_ORG_DETAIL: "/platform/orgs",
} as const;


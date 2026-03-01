export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

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
  TRAINER_ASSIGNMENTS: "/trainer-assignments",
} as const;

export const ROLES = {
  ADMIN: "admin",
  TRAINER: "trainer",
  MEMBER: "member",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

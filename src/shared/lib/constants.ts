export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/admin',
  SIGN_UP: '/sign-up',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  MEMBERS: '/members',
  REGISTER_MEMBER: '/members/register',
  USERS: '/users',
  MEMBERSHIPS: '/memberships',
  TRAINER_ASSIGNMENTS: '/trainer-assignments',
} as const;

export const ROLES = {
  ADMIN: 'admin',
  TRAINER: 'trainer',
  MEMBER: 'member',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

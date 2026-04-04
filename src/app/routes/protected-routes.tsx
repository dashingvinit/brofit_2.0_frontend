import type { RouteObject } from "react-router-dom";
import { ProtectedRoute, AdminRoute, StaffRoute, StaffPermissionRoute, SuperAdminRoute } from "./route-guards";
import { DashboardLayout } from "../layouts/dashboard-layout";
import { PlatformLayout } from "../layouts/platform-layout";
import { PlatformPage, OrgDetailPage } from "@/features/platform";
import { RouteErrorBoundary } from "@/shared/components/route-error-boundary";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { ReceptionPage } from "@/features/dashboard/pages/reception-page";
import { ProfilePage } from "@/features/users/pages/profile-page";
import { MembersListPage } from "@/features/members/pages/members-list-page";
import { RegisterMemberPage } from "@/features/members/pages/register-member-page";
import { MemberDetailPage } from "@/features/members/pages/member-detail-page";
import { PlansPage } from "@/features/plans/pages/plans-page";
import { MembershipsPage } from "@/features/memberships/pages/memberships-page";
import { CreateMembershipPage } from "@/features/memberships/pages/create-membership-page";
import { MembershipDetailPage } from "@/features/memberships/pages/membership-detail-page";
import { TrainingsPage } from "@/features/training/pages/trainings-page";
import { CreateTrainingPage } from "@/features/training/pages/create-training-page";
import { TrainingDetailPage } from "@/features/training/pages/training-detail-page";
import { TrainersPage } from "@/features/trainer/pages/trainers-page";
import { TrainerDetailPage } from "@/features/trainer/pages/trainer-detail-page";
import { FinancialsPage, MonthlyExpensesPage } from "@/features/financials";
import { AnalyticsPage } from "@/features/analytics";
import { AttendancePage } from "@/features/attendance/pages/attendance-page";
import { SettingsPage } from "@/features/settings/pages/settings-page";
import { InboxPage } from "@/features/inbox/pages/inbox-page";
import { OffersPage } from "@/features/offers";

export const protectedRoutes: RouteObject[] = [
  // ── Super admin platform ─────────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <SuperAdminRoute />,
        children: [
          {
            element: <PlatformLayout />,
            errorElement: <RouteErrorBoundary />,
            children: [
              { path: "/platform", element: <PlatformPage /> },
              { path: "/platform/orgs/:id", element: <OrgDetailPage /> },
            ],
          },
        ],
      },
    ],
  },

  // ── Gym dashboard ────────────────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          // ── Staff-accessible routes (org:admin + org:staff) ─────────
          // Blocked for future org:member (gym customers)
          {
            element: <StaffRoute />,
            children: [
              {
                path: "/reception",
                element: <ReceptionPage />,
              },
              {
                path: "/attendance",
                element: <AttendancePage />,
              },
              {
                path: "/profile",
                element: <ProfilePage />,
              },
              // Member detail: readable by staff (edit/delete hidden via isAdmin check)
              {
                path: "/members/:id",
                element: <MemberDetailPage />,
              },
              // Membership & training detail: readable by staff (for expiring-soon links)
              {
                path: "/memberships/:id",
                element: <MembershipDetailPage />,
              },
              {
                path: "/trainings/:id",
                element: <TrainingDetailPage />,
              },
            ],
          },

          // ── Admin-only routes (org:admin) ────────────────────────────
          {
            element: <AdminRoute />,
            children: [
              { path: "/dashboard",              element: <DashboardPage /> },
              { path: "/plans",                  element: <PlansPage /> },
              { path: "/trainers",               element: <TrainersPage /> },
              { path: "/trainers/:id",           element: <TrainerDetailPage /> },
              { path: "/financials",             element: <FinancialsPage /> },
              { path: "/financials/month/:month",element: <MonthlyExpensesPage /> },
              { path: "/analytics",              element: <AnalyticsPage /> },
              { path: "/settings",               element: <SettingsPage /> },
              { path: "/inbox",                  element: <InboxPage /> },
              { path: "/offers",                 element: <OffersPage /> },
            ],
          },

          // ── Permission-gated routes (admin always, staff if permission granted) ──
          {
            element: <StaffPermissionRoute permission="canViewMembers" />,
            children: [
              { path: "/members", element: <MembersListPage /> },
            ],
          },
          {
            element: <StaffPermissionRoute permission="canRegisterMember" />,
            children: [
              { path: "/members/register", element: <RegisterMemberPage /> },
            ],
          },
          {
            element: <StaffPermissionRoute permission="canCreateMembership" />,
            children: [
              { path: "/memberships",        element: <MembershipsPage /> },
              { path: "/memberships/create", element: <CreateMembershipPage /> },
            ],
          },
          {
            element: <StaffPermissionRoute permission="canCreateTraining" />,
            children: [
              { path: "/trainings",        element: <TrainingsPage /> },
              { path: "/trainings/create", element: <CreateTrainingPage /> },
            ],
          },
        ],
      },
    ],
  },
];

import type { RouteObject } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "./route-guards";
import { DashboardLayout } from "../layouts/dashboard-layout";
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
import { FinancialsPage } from "@/features/financials";
import { AnalyticsPage } from "@/features/analytics";
import { AttendancePage } from "@/features/attendance/pages/attendance-page";

export const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          // ── Staff-accessible routes ──────────────────────────────────
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
          // Member detail is readable by staff (read-only, edit/delete hidden)
          {
            path: "/members/:id",
            element: <MemberDetailPage />,
          },
          // Membership & training detail readable by staff (for the expiring links)
          {
            path: "/memberships/:id",
            element: <MembershipDetailPage />,
          },
          {
            path: "/trainings/:id",
            element: <TrainingDetailPage />,
          },

          // ── Admin-only routes ────────────────────────────────────────
          {
            element: <AdminRoute />,
            children: [
              {
                path: "/dashboard",
                element: <DashboardPage />,
              },
              {
                path: "/members",
                element: <MembersListPage />,
              },
              {
                path: "/members/register",
                element: <RegisterMemberPage />,
              },
              {
                path: "/plans",
                element: <PlansPage />,
              },
              {
                path: "/memberships",
                element: <MembershipsPage />,
              },
              {
                path: "/memberships/create",
                element: <CreateMembershipPage />,
              },
              {
                path: "/trainings",
                element: <TrainingsPage />,
              },
              {
                path: "/trainings/create",
                element: <CreateTrainingPage />,
              },
              {
                path: "/trainers",
                element: <TrainersPage />,
              },
              {
                path: "/trainers/:id",
                element: <TrainerDetailPage />,
              },
              {
                path: "/financials",
                element: <FinancialsPage />,
              },
              {
                path: "/analytics",
                element: <AnalyticsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
];

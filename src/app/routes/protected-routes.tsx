import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "./route-guards";
import { DashboardLayout } from "../layouts/dashboard-layout";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { ProfilePage } from "@/features/users/pages/profile-page";
import { MembersListPage } from "@/features/members/pages/members-list-page";
import { RegisterMemberPage } from "@/features/members/pages/register-member-page";
import { PlansPage } from "@/features/plans/pages/plans-page";
import { MembershipsPage } from "@/features/memberships/pages/memberships-page";
import { CreateMembershipPage } from "@/features/memberships/pages/create-membership-page";
import { MembershipDetailPage } from "@/features/memberships/pages/membership-detail-page";
import { TrainingsPage } from "@/features/training/pages/trainings-page";
import { CreateTrainingPage } from "@/features/training/pages/create-training-page";
import { TrainingDetailPage } from "@/features/training/pages/training-detail-page";

export const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
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
            path: "/memberships/:id",
            element: <MembershipDetailPage />,
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
            path: "/trainings/:id",
            element: <TrainingDetailPage />,
          },
        ],
      },
    ],
  },
];

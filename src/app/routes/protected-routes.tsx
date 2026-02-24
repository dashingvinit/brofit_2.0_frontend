import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "./route-guards";
import { DashboardLayout } from "../layouts/dashboard-layout";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { ProfilePage } from "@/features/users/pages/profile-page";
import { MembersListPage } from "@/features/members/pages/members-list-page";
import { RegisterMemberPage } from "@/features/members/pages/register-member-page";
import { PlansPage } from "@/features/plans/pages/plans-page";

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
        ],
      },
    ],
  },
];

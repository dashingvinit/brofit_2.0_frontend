import type { RouteObject } from "react-router-dom";
import { PublicLayout } from "../layouts/public-layout";
import { RouteErrorBoundary } from "@/shared/components/route-error-boundary";
import { HomePage } from "@/pages/home-page";
import { SaasLandingPage } from "@/pages/saas-landing-page";
import { AdminPortalPage } from "@/pages/admin-portal-page";
import { SignInPage } from "@/features/auth/pages/sign-in-page";
import { SignUpPage } from "@/features/auth/pages/sign-up-page";
import { NotFoundPage } from "@/pages/not-found-page";

export const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <SaasLandingPage />,
  },
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/snt",
        element: <HomePage />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminPortalPage />,
  },
  {
    path: "/sign-in/*",
    element: <SignInPage />,
  },
  {
    path: "/sign-up/*",
    element: <SignUpPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

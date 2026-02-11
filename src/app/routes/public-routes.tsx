import type { RouteObject } from 'react-router-dom';
import { PublicLayout } from '../layouts/public-layout';
import { HomePage } from '@/pages/home-page';
import { SignInPage } from '@/features/auth/pages/sign-in-page';
import { SignUpPage } from '@/features/auth/pages/sign-up-page';
import { NotFoundPage } from '@/pages/not-found-page';

export const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
    ],
  },
  {
    path: '/sign-in/*',
    element: <SignInPage />,
  },
  {
    path: '/sign-up/*',
    element: <SignUpPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

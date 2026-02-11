import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { publicRoutes } from './public-routes';
import { protectedRoutes } from './protected-routes';

export const router = createBrowserRouter([
  ...publicRoutes,
  ...protectedRoutes,
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { LoadingSpinner } from '@/shared/components/loading-spinner';
import { ROUTES } from '@/shared/lib/constants';
import { useRole } from '@/shared/hooks/use-role';

export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!isSignedIn) {
    return <Navigate to={ROUTES.SIGN_IN} replace />;
  }

  return <Outlet />;
}

/** Only admins can access — everyone else is sent to /reception */
export function AdminRoute() {
  const { isAdmin, isLoaded } = useRole();

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.RECEPTION} replace />;
  }

  return <Outlet />;
}

import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { LoadingSpinner } from '@/shared/components/loading-spinner';
import { ROUTES } from '@/shared/lib/constants';

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

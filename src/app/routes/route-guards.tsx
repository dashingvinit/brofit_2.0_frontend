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

/** org:admin only — gym owners. Everyone else → /reception */
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

/** org:admin or org:staff — blocks future org:member (gym customers) */
export function StaffRoute() {
  const { isAdmin, isStaff, isLoaded } = useRole();

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!isAdmin && !isStaff) {
    return <Navigate to={ROUTES.SIGN_IN} replace />;
  }

  return <Outlet />;
}

/** Super admin only (platform owner). publicMetadata.role === "super_admin" */
export function SuperAdminRoute() {
  const { isSuperAdmin, isLoaded } = useRole();

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!isSuperAdmin) {
    return <Navigate to={ROUTES.SIGN_IN} replace />;
  }

  return <Outlet />;
}

import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { LoadingSpinner } from '@/shared/components/loading-spinner';
import { ROUTES } from '@/shared/lib/constants';
import { useRole } from '@/shared/hooks/use-role';
import { useStaffPermissions } from '@/features/settings/hooks/use-staff-permissions';
import type { PermissionFlags } from '@/features/settings/api/staff-permissions-api';

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

/**
 * Allows org:admin always, or org:staff if they have the required permission.
 * Use for routes that admins own but staff can access when permission is granted.
 */
export function StaffPermissionRoute({ permission }: { permission: keyof PermissionFlags }) {
  const { isAdmin, isStaff, isLoaded: roleLoaded } = useRole();
  const { resolvedPermissions, isLoading: permsLoading } = useStaffPermissions();

  if (!roleLoaded || permsLoading) return <LoadingSpinner />;

  if (isAdmin) return <Outlet />;

  if (isStaff && resolvedPermissions[permission]) return <Outlet />;

  return <Navigate to={ROUTES.RECEPTION} replace />;
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

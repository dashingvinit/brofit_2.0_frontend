import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { LoadingSpinner } from '@/shared/components/loading-spinner';
import type { User, UserMembership, MembershipPlan } from '@/shared/types/common.types';
import { ROUTES } from '@/shared/lib/constants';
import { EditUserDialog } from './edit-user-dialog';
import { useUserManagement } from '../hooks/use-user-management';
import { membershipsApi } from '../api/memberships-api';
import { membersApi } from '../api/members-api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

interface MembersListProps {
  members?: User[];
  isLoading?: boolean;
}

interface MemberWithMembership extends User {
  activeMembership?: UserMembership;
  membershipPlan?: MembershipPlan;
}

export function MembersList({ members, isLoading }: MembersListProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<MemberWithMembership | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { updateUser, isUpdating } = useUserManagement();
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loadingMemberships, setLoadingMemberships] = useState(true);

  useEffect(() => {
    const fetchMembershipsAndPlans = async () => {
      try {
        setLoadingMemberships(true);
        const [membershipsResponse, plansResponse] = await Promise.all([
          membershipsApi.getOrganizationMemberships({ limit: 1000 }),
          membershipsApi.getAllPlans(),
        ]);
        setMemberships(membershipsResponse.data);
        setPlans(plansResponse.data);
      } catch (error) {
        console.error('Failed to fetch memberships:', error);
      } finally {
        setLoadingMemberships(false);
      }
    };

    fetchMembershipsAndPlans();
  }, []);

  const membersWithMemberships = useMemo(() => {
    if (!members) return [];

    return members
      .filter((member) => member.role === 'member')
      .map((member) => {
        const activeMembership = memberships.find(
          (m) => m.userId === member.id && m.status === 'active'
        );
        const membershipPlan = activeMembership
          ? plans.find((p) => p.id === activeMembership.membershipPlanId)
          : undefined;

        return {
          ...member,
          activeMembership,
          membershipPlan,
        } as MemberWithMembership;
      });
  }, [members, memberships, plans]);

  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return 'secondary';
    switch (status) {
      case 'active':
        return 'default';
      case 'expired':
        return 'destructive';
      case 'suspended':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingUser) return;

    console.log('Deleting user:', deletingUser);
    console.log('User ID:', deletingUser.id);

    if (!deletingUser.id) {
      console.error('User ID is missing!', deletingUser);
      alert('Cannot delete member: ID is missing');
      setDeletingUser(null);
      return;
    }

    try {
      setIsDeleting(true);
      await membersApi.deleteUser(deletingUser.id);
      // Refresh the members list by reloading
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('Failed to delete member. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeletingUser(null);
    }
  };

  if (isLoading || loadingMemberships) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!membersWithMemberships || membersWithMemberships.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No members yet</h3>
        <p className="text-muted-foreground mt-2">
          Get started by registering your first member
        </p>
        <Button asChild className="mt-4">
          <Link to={ROUTES.REGISTER_MEMBER || '/members/register'}>
            Register Member
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {membersWithMemberships.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.firstName} {member.lastName}
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  {member.membershipPlan?.name || '-'}
                </TableCell>
                <TableCell>
                  {member.activeMembership?.startDate
                    ? new Date(member.activeMembership.startDate).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  {member.activeMembership?.endDate
                    ? new Date(member.activeMembership.endDate).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(member.activeMembership?.status)}>
                    {member.activeMembership?.status || 'No membership'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(member)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingUser(member)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onSave={updateUser}
          isLoading={isUpdating}
        />
      )}

      <AlertDialog open={!!deletingUser} onOpenChange={(open: boolean) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingUser?.firstName} {deletingUser?.lastName}?
              This action cannot be undone and will permanently remove the member and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

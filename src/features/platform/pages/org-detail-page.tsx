import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  IndianRupee,
  ArrowLeft,
  UserPlus,
  Clock,
  ShieldCheck,
  Mail,
  Trash2,
  PowerOff,
  Power,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";
import { formatCurrency } from "@/shared/lib/utils";
import { ROUTES } from "@/shared/lib/constants";
import { useOrg, useOrgMembers, useOrgInvitations, useSetOrgStatus, useDeleteOrg } from "../hooks/use-platform";
import { InviteDialog } from "../components/invite-dialog";
import type { ClerkOrgMember, ClerkOrgInvitation } from "@/shared/types/common.types";

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {isLoading ? (
              <Skeleton className="h-6 w-20 mt-1" />
            ) : (
              <p className="text-xl font-semibold">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function roleLabel(role: string) {
  if (role === "org:admin") return { label: "Admin", variant: "default" as const };
  if (role === "org:staff") return { label: "Staff", variant: "secondary" as const };
  return { label: role, variant: "outline" as const };
}

function MembersTable({ members, isLoading }: { members: ClerkOrgMember[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
      </div>
    );
  }
  if (!members?.length) {
    return <EmptyState message="No members yet" className="py-4" />;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="hidden sm:table-cell">Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => {
          const { label, variant } = roleLabel(m.role);
          const name = [m.publicUserData.firstName, m.publicUserData.lastName].filter(Boolean).join(" ") || "—";
          const initials = [m.publicUserData.firstName?.[0], m.publicUserData.lastName?.[0]].filter(Boolean).join("");
          return (
            <TableRow key={m.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={m.publicUserData.imageUrl} />
                    <AvatarFallback className="text-xs">{initials || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.publicUserData.identifier}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell><Badge variant={variant}>{label}</Badge></TableCell>
              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function InvitationsTable({ invitations, isLoading }: { invitations: ClerkOrgInvitation[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
      </div>
    );
  }
  const pending = invitations?.filter((i) => i.status === "pending") ?? [];
  if (!pending.length) {
    return <EmptyState message="No pending invitations" className="py-4" />;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="hidden sm:table-cell">Sent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pending.map((inv) => {
          const { label, variant } = roleLabel(inv.role);
          return (
            <TableRow key={inv.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{inv.emailAddress}</span>
                </div>
              </TableCell>
              <TableCell><Badge variant={variant}>{label}</Badge></TableCell>
              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                {new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function OrgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: org, isLoading: orgLoading } = useOrg(id!);
  const { data: members, isLoading: membersLoading } = useOrgMembers(id!);
  const { data: invitations, isLoading: invitationsLoading } = useOrgInvitations(id!);
  const { mutate: setStatus, isPending: statusPending } = useSetOrgStatus(id!);
  const { mutate: deleteOrg, isPending: deletePending } = useDeleteOrg();

  function handleDelete() {
    deleteOrg(id!, { onSuccess: () => navigate(ROUTES.PLATFORM) });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => navigate(ROUTES.PLATFORM)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Organizations
        </Button>
      </div>

      <PageHeader
        title={orgLoading ? "Loading…" : (org?.name ?? "Organization")}
        description={org ? `ID: ${org.id}` : undefined}
        actions={
          <div className="flex gap-2">
            {org && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStatus(!org.isActive)}
                disabled={statusPending}
              >
                {org.isActive ? (
                  <><PowerOff className="h-4 w-4 mr-1.5" />Suspend</>
                ) : (
                  <><Power className="h-4 w-4 mr-1.5" />Activate</>
                )}
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4 mr-1.5" />
              Invite
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </div>
        }
      />

      {org && org.isActive === false && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          This organization is suspended. Gym admin and staff cannot access any data.
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total Members"
          value={org?.stats?.totalMembers ?? 0}
          isLoading={orgLoading}
        />
        <StatCard
          icon={UserCheck}
          label="Active Members"
          value={org?.stats?.activeMembers ?? 0}
          isLoading={orgLoading}
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={org?.stats ? `₹${formatCurrency(org.stats.totalRevenue)}` : "—"}
          isLoading={orgLoading}
        />
      </div>

      {/* Members + Invitations */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Org Members
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MembersTable members={members} isLoading={membersLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InvitationsTable invitations={invitations} isLoading={invitationsLoading} />
          </CardContent>
        </Card>
      </div>

      {id && <InviteDialog orgId={id} open={inviteOpen} onOpenChange={setInviteOpen} />}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {org?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all members, memberships, trainings, payments,
              and all other data for this organization. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deletePending}
            >
              {deletePending ? "Deleting…" : "Delete everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

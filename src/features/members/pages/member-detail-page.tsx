import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  IndianRupee,
  CalendarDays,
  Mail,
  Phone,
  User,
  Dumbbell,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Pencil,
  MoreHorizontal,
  ChevronRight,
  StickyNote,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { PageHeader } from '@/shared/components/page-header';
import { ROUTES } from '@/shared/lib/constants';
import { useMember } from '../hooks/use-members';
import { useMemberMemberships } from '@/features/memberships/hooks/use-memberships';
import { useMemberTrainings } from '@/features/training/hooks/use-training';
import { useMemberDues } from '../hooks/use-member-detail';
import { EditMemberDialog } from '../components/edit-member-dialog';
import type {
  MembershipStatus,
  TrainingStatus,
  Membership,
  Training,
} from '@/shared/types/common.types';

const membershipStatusConfig: Record<
  MembershipStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  active: { label: 'Active', variant: 'default' },
  expired: { label: 'Expired', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  frozen: { label: 'Frozen', variant: 'outline' },
};

const trainingStatusConfig: Record<
  TrainingStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  active: { label: 'Active', variant: 'default' },
  expired: { label: 'Expired', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  frozen: { label: 'Frozen', variant: 'outline' },
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
    'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  ];
  const index =
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function calculateAge(dateOfBirth: string) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: memberResponse, isLoading: memberLoading } = useMember(id!);
  const { data: membershipsResponse, isLoading: membershipsLoading } =
    useMemberMemberships(id!);
  const { data: trainingsResponse, isLoading: trainingsLoading } =
    useMemberTrainings(id!);
  const { data: duesResponse, isLoading: duesLoading } = useMemberDues(id!);

  const member = memberResponse?.data;
  const memberships = membershipsResponse?.data || [];
  const trainings = trainingsResponse?.data || [];
  const duesData = duesResponse?.data?.[0] || null;

  // Loading state
  if (memberLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-56 lg:col-span-2" />
          <Skeleton className="h-56" />
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  // Not found state
  if (!member) {
    return (
      <div className="space-y-4">
        <PageHeader title="Member Not Found" />
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              The member you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate(ROUTES.MEMBERS)}>
              Back to Members
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${member.firstName} ${member.lastName}`;
  const totalDue = duesData?.totalDue || 0;
  const membershipDuesTotal = duesData?.membershipDuesTotal || 0;
  const trainingDuesTotal = duesData?.trainingDuesTotal || 0;
  const hasDues = totalDue > 0;

  // Sort: active first, then by endDate desc
  const sortedMemberships = [...memberships].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });

  const sortedTrainings = [...trainings].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });

  // Find per-subscription dues from the report
  const membershipDuesMap = new Map(
    (duesData?.membershipDues || []).map((d) => [d.id, d])
  );
  const trainingDuesMap = new Map(
    (duesData?.trainingDues || []).map((d) => [d.id, d])
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Member Details"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.MEMBERS)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Member Info + Dues Summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Member Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback
                    className={`text-sm font-semibold ${getAvatarColor(fullName)}`}
                  >
                    {getInitials(member.firstName, member.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{fullName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {calculateAge(member.dateOfBirth)} yrs
                    <span className="mx-1">&middot;</span>
                    <span className="capitalize">{member.gender}</span>
                  </p>
                </div>
              </div>
              <Badge
                variant={member.isActive ? 'default' : 'secondary'}
                className={
                  member.isActive
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 border-0'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border-0'
                }
              >
                <span
                  className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${
                    member.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                  }`}
                />
                {member.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{member.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{member.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {formatDate(member.dateOfBirth)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p className="font-medium">{formatDate(member.joinDate)}</p>
                </div>
              </div>
            </div>

            {member.notes && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <StickyNote className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm">{member.notes}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dues Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dues Summary</CardTitle>
            <CardDescription>
              {duesLoading
                ? 'Loading...'
                : hasDues
                  ? 'Outstanding balance'
                  : 'All clear'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {duesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Membership Dues</span>
                    <span className="font-medium">
                      <IndianRupee className="inline h-3 w-3" />
                      {membershipDuesTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Training Dues</span>
                    <span className="font-medium">
                      <IndianRupee className="inline h-3 w-3" />
                      {trainingDuesTotal.toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span className={hasDues ? 'text-amber-600' : 'text-emerald-600'}>
                      {hasDues ? 'Total Due' : 'No Dues'}
                    </span>
                    <span className={hasDues ? 'text-amber-600' : 'text-emerald-600'}>
                      <IndianRupee className="inline h-3.5 w-3.5" />
                      {totalDue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {!hasDues && (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    All dues cleared
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Memberships Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Memberships</CardTitle>
              <CardDescription>
                {membershipsLoading
                  ? 'Loading...'
                  : `${memberships.length} membership${memberships.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/memberships/create?memberId=${id}`)}
            >
              Add Membership
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {membershipsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sortedMemberships.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMemberships.map((ms) => {
                      const status = membershipStatusConfig[ms.status];
                      const dues = membershipDuesMap.get(ms.id);
                      return (
                        <TableRow
                          key={ms.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/memberships/${ms.id}`)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {ms.planVariant?.planType?.name || 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {ms.planVariant?.durationLabel || ''}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(ms.startDate)} - {formatDate(ms.endDate)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            <IndianRupee className="inline h-3 w-3" />
                            {ms.finalPrice.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {dues ? (
                              <span className="font-medium text-amber-600">
                                <IndianRupee className="inline h-3 w-3" />
                                {dues.dueAmount.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 sm:hidden">
                {sortedMemberships.map((ms) => {
                  const status = membershipStatusConfig[ms.status];
                  const dues = membershipDuesMap.get(ms.id);
                  return (
                    <div
                      key={ms.id}
                      className="rounded-lg border p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/memberships/${ms.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {ms.planVariant?.planType?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ms.planVariant?.durationLabel || ''}
                          </p>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {formatDate(ms.startDate)} - {formatDate(ms.endDate)}
                        </span>
                        <span className="font-medium text-foreground">
                          <IndianRupee className="inline h-3 w-3" />
                          {ms.finalPrice.toLocaleString()}
                        </span>
                      </div>
                      {dues && (
                        <div className="text-xs font-medium text-amber-600">
                          Due: <IndianRupee className="inline h-2.5 w-2.5" />
                          {dues.dueAmount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Dumbbell className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                No memberships yet
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/memberships/create?memberId=${id}`)}
              >
                Add Membership
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trainings Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Trainings</CardTitle>
              <CardDescription>
                {trainingsLoading
                  ? 'Loading...'
                  : `${trainings.length} training${trainings.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/trainings/create?memberId=${id}`)}
            >
              Add Training
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {trainingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sortedTrainings.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTrainings.map((tr) => {
                      const status = trainingStatusConfig[tr.status];
                      const dues = trainingDuesMap.get(tr.id);
                      return (
                        <TableRow
                          key={tr.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/trainings/${tr.id}`)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {tr.planVariant?.planType?.name || 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tr.planVariant?.durationLabel || ''}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {tr.trainer?.name ?? '—'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(tr.startDate)} - {formatDate(tr.endDate)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            <IndianRupee className="inline h-3 w-3" />
                            {tr.finalPrice.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {dues ? (
                              <span className="font-medium text-amber-600">
                                <IndianRupee className="inline h-3 w-3" />
                                {dues.dueAmount.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 sm:hidden">
                {sortedTrainings.map((tr) => {
                  const status = trainingStatusConfig[tr.status];
                  const dues = trainingDuesMap.get(tr.id);
                  return (
                    <div
                      key={tr.id}
                      className="rounded-lg border p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/trainings/${tr.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {tr.planVariant?.planType?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tr.trainer?.name ?? '—'} &middot; {tr.planVariant?.durationLabel || ''}
                          </p>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {formatDate(tr.startDate)} - {formatDate(tr.endDate)}
                        </span>
                        <span className="font-medium text-foreground">
                          <IndianRupee className="inline h-3 w-3" />
                          {tr.finalPrice.toLocaleString()}
                        </span>
                      </div>
                      {dues && (
                        <div className="text-xs font-medium text-amber-600">
                          Due: <IndianRupee className="inline h-2.5 w-2.5" />
                          {dues.dueAmount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Dumbbell className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                No trainings yet
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/trainings/create?memberId=${id}`)}
              >
                Add Training
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      {editDialogOpen && (
        <EditMemberDialog
          member={member}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
}

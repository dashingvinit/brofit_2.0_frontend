import { useState, useEffect } from 'react';
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
  ChevronRight,
  StickyNote,
  Activity,
  Pencil,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { InlineEditField } from '@/shared/components/inline-edit-field';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
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
import { PageHeader } from '@/shared/components/page-header';
import { ROUTES } from '@/shared/lib/constants';
import { useMember, useUpdateMember } from '../hooks/use-members';
import { useRecentlyViewed } from '../hooks/use-recently-viewed';
import { useMemberMemberships } from '@/features/memberships/hooks/use-memberships';
import { useMemberTrainings } from '@/features/training/hooks/use-training';
import { useMemberDues } from '../hooks/use-member-detail';
import { useAttendanceMemberHistory } from '@/features/attendance/hooks/use-attendance';
import { EditMemberDialog } from '../components/edit-member-dialog';
import type {
  MembershipStatus,
  TrainingStatus,
  Membership,
  Training,
} from '@/shared/types/common.types';

import { SUBSCRIPTION_STATUS_CONFIG } from '@/shared/lib/constants';
import { getInitials, getAvatarColor, calculateAge } from '@/shared/lib/utils';

const membershipStatusConfig = SUBSCRIPTION_STATUS_CONFIG;
const trainingStatusConfig = SUBSCRIPTION_STATUS_CONFIG;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
  const { data: attendanceResponse, isLoading: attendanceLoading } = useAttendanceMemberHistory(id!, 1, 60);
  const updateMember = useUpdateMember();
  const { record: recordRecentlyViewed } = useRecentlyViewed();

  const member = memberResponse?.data;

  useEffect(() => {
    if (member) {
      recordRecentlyViewed({
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        phone: member.phone,
      });
    }
  }, [member?.id]); // eslint-disable-line react-hooks/exhaustive-deps
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

  const statusOrder: Record<string, number> = { active: 0, scheduled: 1, frozen: 2, expired: 3, cancelled: 4 };

  // Sort: active first, scheduled second, then by endDate desc
  const sortedMemberships = [...memberships].sort((a, b) => {
    const diff = (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
    if (diff !== 0) return diff;
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });

  const sortedTrainings = [...trainings].sort((a, b) => {
    const diff = (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
    if (diff !== 0) return diff;
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });

  // Find per-subscription dues from the report
  const membershipDuesMap = new Map(
    (duesData?.membershipDues || []).map((d) => [d.id, d])
  );
  const trainingDuesMap = new Map(
    (duesData?.trainingDues || []).map((d) => [d.id, d])
  );

  const saveField = (field: 'phone' | 'email' | 'notes', value: string) => {
    updateMember.mutate({ memberId: member.id, data: { [field]: value } });
  };

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
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
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
              <div className="flex items-center gap-2">
                <Switch
                  checked={member.isActive}
                  disabled={updateMember.isPending}
                  onCheckedChange={(checked) =>
                    updateMember.mutate({ memberId: member.id, data: { isActive: checked } })
                  }
                  className="data-[state=checked]:bg-emerald-500"
                />
                <span className={`text-sm font-medium ${member.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                  {member.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <InlineEditField
                    value={member.email || ''}
                    onSave={(v) => saveField('email', v)}
                    isSaving={updateMember.isPending}
                    placeholder="Add email"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <InlineEditField
                    value={member.phone || ''}
                    onSave={(v) => saveField('phone', v)}
                    isSaving={updateMember.isPending}
                    placeholder="Add phone"
                  />
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
                {member.referredBy && (
                  <div>
                    <p className="text-sm text-muted-foreground">Referred By</p>
                    <p className="font-medium">
                      {member.referredBy.firstName} {member.referredBy.lastName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                <StickyNote className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground mb-0.5">Notes</p>
                <InlineEditField
                  value={member.notes || ''}
                  onSave={(v) => saveField('notes', v)}
                  isSaving={updateMember.isPending}
                  multiline
                  placeholder="Add notes about this member..."
                />
              </div>
            </div>
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

      {/* Attendance Trends Section */}
      <AttendanceTrendsCard
        records={attendanceResponse?.data ?? []}
        isLoading={attendanceLoading}
      />

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

// ─── Attendance Trends Card ────────────────────────────────────────────────────

import type { AttendanceRecord } from '@/shared/types/common.types';

function AttendanceTrendsCard({
  records,
  isLoading,
}: {
  records: AttendanceRecord[];
  isLoading: boolean;
}) {
  // Build last 8 weeks (Mon–Sun) visit counts
  const weeks = buildWeeklyBuckets(records, 8);
  const maxVisits = Math.max(...weeks.map((w) => w.count), 1);
  const totalVisits = records.length;
  const last30 = records.filter((r) => {
    const d = new Date(r.date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  }).length;
  const recentRecords = [...records]
    .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
    .slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Attendance Trends
            </CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `${totalVisits} total visits · ${last30} in last 30 days`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          </div>
        ) : totalVisits === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No attendance records yet.</p>
          </div>
        ) : (
          <>
            {/* Weekly bar chart */}
            <div>
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Visits per week (last 8 weeks)</p>
              <div className="flex items-end gap-1.5 h-20">
                {weeks.map((week, i) => {
                  const heightPct = maxVisits > 0 ? (week.count / maxVisits) * 100 : 0;
                  const isCurrentWeek = i === weeks.length - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full flex items-end h-16 relative">
                        <div
                          className={`w-full rounded-t transition-all ${
                            isCurrentWeek
                              ? 'bg-blue-500 dark:bg-blue-400'
                              : 'bg-blue-200 dark:bg-blue-800 group-hover:bg-blue-300 dark:group-hover:bg-blue-700'
                          }`}
                          style={{ height: week.count === 0 ? '3px' : `${heightPct}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover border rounded px-1.5 py-0.5 text-xs font-medium shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {week.count} visit{week.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        {isCurrentWeek ? 'This' : week.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent visits list */}
            {recentRecords.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Recent Visits</p>
                <div className="space-y-1.5">
                  {recentRecords.map((r) => {
                    const entry = new Date(r.entryTime);
                    const durationMins = r.exitTime
                      ? Math.floor((new Date(r.exitTime).getTime() - entry.getTime()) / 60_000)
                      : null;
                    const durationLabel = durationMins !== null
                      ? durationMins < 60
                        ? `${durationMins}m`
                        : `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
                      : null;

                    return (
                      <div key={r.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium">
                            {entry.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {entry.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                        {durationLabel && (
                          <span className="text-xs text-muted-foreground tabular-nums">{durationLabel}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function buildWeeklyBuckets(records: AttendanceRecord[], numWeeks: number) {
  const now = new Date();
  const results: { label: string; count: number }[] = [];

  for (let w = numWeeks - 1; w >= 0; w--) {
    const weekStart = new Date(now);
    // go back to Monday of current week, then subtract w weeks
    const dayOfWeek = now.getDay(); // 0=Sun
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(now.getDate() - daysToMonday - w * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const count = records.filter((r) => {
      const d = new Date(r.date);
      return d >= weekStart && d <= weekEnd;
    }).length;

    const label = weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    results.push({ label, count });
  }

  return results;
}

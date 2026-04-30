import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  IndianRupee,
  CalendarDays,
  User,
  Dumbbell,
  Plus,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Pencil,
  XCircle,
  Snowflake,
  Play,
  MoreHorizontal,
  RefreshCw,
  Trash2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { PageHeader } from '@/shared/components/page-header';
import {
  useMembership,
  useMembershipDues,
  useCancelMembership,
  useUnfreezeMembership,
  useDeleteMembership,
  useDeletePayment,
  useRecordPayment,
} from '../hooks/use-memberships';
import { RecordPaymentDialog } from '@/shared/components/record-payment-dialog';
import { EditMembershipDialog } from '../components/edit-membership-dialog';
import { RenewMembershipDialog } from '../components/renew-membership-dialog';
import { FreezeMembershipDialog } from '../components/freeze-membership-dialog';
import { ROUTES } from '@/shared/lib/constants';
import { useReturnTo } from '@/shared/hooks/use-return-to';
import { usePrivacy } from '@/shared/hooks/use-privacy';
import type {
  MembershipStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/shared/types/common.types';

import { SUBSCRIPTION_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '@/shared/lib/constants';

const statusConfig = SUBSCRIPTION_STATUS_CONFIG;
const paymentStatusConfig = PAYMENT_STATUS_CONFIG;

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  other: 'Other',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MembershipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isPrivate } = usePrivacy();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [unfreezeDialogOpen, setUnfreezeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [extendEndDate, setExtendEndDate] = useState(true);

  const { data: membershipResponse, isLoading: membershipLoading } =
    useMembership(id!);
  const { data: duesResponse, isLoading: duesLoading } = useMembershipDues(
    id!
  );

  const cancelMembership = useCancelMembership();
  const unfreezeMembership = useUnfreezeMembership();
  const deleteMembership = useDeleteMembership();
  const deletePayment = useDeletePayment();
  const recordPayment = useRecordPayment();
  const returnTo = useReturnTo(ROUTES.MEMBERSHIPS);

  const membership = membershipResponse?.data;
  const dues = duesResponse?.data;

  if (membershipLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-48 lg:col-span-2" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="space-y-4">
        <PageHeader title="Membership Not Found" />
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              The membership you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate(returnTo)}>
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[membership.status];
  const memberName = membership.member
    ? `${membership.member.firstName} ${membership.member.lastName}`
    : 'Unknown';
  const planName = membership.planVariant?.planType?.name ?? 'N/A';
  const durationLabel = membership.planVariant?.durationLabel ?? '';

  const paidPercentage = dues
    ? dues.finalPrice > 0
      ? Math.min(100, Math.round((dues.totalPaid / dues.finalPrice) * 100))
      : 0
    : 0;

  const isEditable = membership.status !== 'cancelled';
  const canFreeze = membership.status === 'active';
  const canUnfreeze = membership.status === 'frozen';
  const canCancel =
    membership.status === 'active' || membership.status === 'frozen';
  const canDelete = true;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Membership Details"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(returnTo)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {/* Renew button — prominent for expired/cancelled */}
            {(membership.status === 'expired' || membership.status === 'cancelled') && (
              <Button onClick={() => setRenewDialogOpen(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Renew
              </Button>
            )}

            {/* Actions Dropdown */}
            {(isEditable || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="More options">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isEditable && (
                    <>
                      <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => setRenewDialogOpen(true)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Renew Membership
                      </DropdownMenuItem>

                      {canFreeze && (
                        <DropdownMenuItem
                          onClick={() => setFreezeDialogOpen(true)}
                        >
                          <Snowflake className="h-4 w-4 mr-2" />
                          Freeze Membership
                        </DropdownMenuItem>
                      )}

                      {canUnfreeze && (
                        <DropdownMenuItem
                          onClick={() => setUnfreezeDialogOpen(true)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Unfreeze Membership
                        </DropdownMenuItem>
                      )}

                      {canCancel && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setCancelDialogOpen(true)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Membership
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  )}

                  {canDelete && (
                    <>
                      {isEditable && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Membership
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      {/* Membership Info + Dues Overview */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Membership Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Membership Info</CardTitle>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member</p>
                  <p className="font-medium">{memberName}</p>
                  {membership.member?.email && (
                    <p className="text-xs text-muted-foreground">
                      {isPrivate ? "••••••••" : membership.member.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium">{planName}</p>
                  <p className="text-xs text-muted-foreground">
                    {durationLabel} ({membership.planVariant?.durationDays}{' '}
                    days)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {formatDate(membership.startDate)} -{' '}
                    {formatDate(membership.endDate)}
                  </p>
                  {membership.autoRenew && (
                    <p className="text-xs text-emerald-600">Auto-renew on</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <IndianRupee className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pricing</p>
                  <div className="text-sm">
                    <span className="font-medium">
                      <IndianRupee className="inline h-3 w-3" />
                      {membership.finalPrice.toLocaleString()}
                    </span>
                    {membership.discountAmount > 0 && (
                      <span className="text-muted-foreground ml-1">
                        (
                        <IndianRupee className="inline h-2.5 w-2.5" />
                        {membership.priceAtPurchase.toLocaleString()} -{' '}
                        <IndianRupee className="inline h-2.5 w-2.5" />
                        {membership.discountAmount.toLocaleString()} discount)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {membership.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{membership.notes}</p>
                </div>
              </>
            )}

            {membership.status === 'frozen' && (
              <>
                <Separator />
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                    <Snowflake className="h-4 w-4" />
                    Membership Frozen
                  </div>
                  {membership.freezeReason && (
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Reason: {membership.freezeReason}
                    </p>
                  )}
                  <div className="text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
                    {membership.freezeStartDate && (
                      <p>From: {formatDate(membership.freezeStartDate)}</p>
                    )}
                    {membership.freezeEndDate ? (
                      <p>Auto-resumes: {formatDate(membership.freezeEndDate)}</p>
                    ) : (
                      <p>No auto-resume date set</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dues Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Payment Status</CardTitle>
                <CardDescription>
                  {duesLoading
                    ? 'Loading...'
                    : dues?.isFullyPaid
                      ? 'Fully paid'
                      : dues && dues.payments.filter(p => p.status === 'paid').length > 0
                        ? `${dues.payments.filter(p => p.status === 'paid').length} payment${dues.payments.filter(p => p.status === 'paid').length !== 1 ? 's' : ''} recorded`
                        : 'Outstanding balance'}
                </CardDescription>
              </div>
              {!duesLoading && dues && !dues.isFullyPaid && membership.status !== 'cancelled' && (
                <Button size="sm" onClick={() => setPaymentDialogOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Pay
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {duesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : dues ? (
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid</span>
                    <span className="font-medium">{paidPercentage}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dues.isFullyPaid
                          ? 'bg-emerald-500'
                          : paidPercentage > 50
                            ? 'bg-primary'
                            : 'bg-amber-500'
                      }`}
                      style={{ width: `${paidPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-medium">
                      <IndianRupee className="inline h-3 w-3" />
                      {dues.finalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Paid</span>
                    <span className="font-medium">
                      <IndianRupee className="inline h-3 w-3" />
                      {dues.totalPaid.toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span
                      className={
                        dues.isFullyPaid
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }
                    >
                      {dues.isFullyPaid ? 'Fully Paid' : 'Balance Due'}
                    </span>
                    <span
                      className={
                        dues.isFullyPaid
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }
                    >
                      <IndianRupee className="inline h-3 w-3" />
                      {dues.dueAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {dues.isFullyPaid && (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    All dues cleared
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">Payment History</CardTitle>
              <CardDescription>
                All payments recorded against this membership
              </CardDescription>
            </div>
            {dues && !dues.isFullyPaid && membership.status !== 'cancelled' && (
              <Button size="sm" variant="outline" onClick={() => setPaymentDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Record Payment
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {duesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : dues && dues.payments.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dues.payments.map((payment) => {
                      const pStatus = paymentStatusConfig[payment.status];
                      return (
                        <TableRow key={payment.id}>
                          <TableCell className="text-sm">
                            {payment.paidAt
                              ? formatDateTime(payment.paidAt)
                              : formatDateTime(payment.createdAt)}
                          </TableCell>
                          <TableCell className="font-medium">
                            <IndianRupee className="inline h-3 w-3" />
                            {payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {paymentMethodLabels[payment.method] ||
                              payment.method}
                          </TableCell>
                          <TableCell>
                            <Badge variant={pStatus.variant}>
                              {pStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                            {payment.reference || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                            {payment.notes || '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeletePaymentId(payment.id)}
                              aria-label="Delete payment"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Timeline */}
              <div className="sm:hidden">
                <div className="relative pl-6">
                  {/* Vertical line */}
                  <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-4">
                    {dues.payments.map((payment) => {
                      const pStatus = paymentStatusConfig[payment.status];
                      return (
                        <div key={payment.id} className="relative">
                          {/* Dot */}
                          <div className={`absolute -left-6 mt-1 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center ${
                            payment.status === 'paid'
                              ? 'bg-emerald-500'
                              : payment.status === 'pending'
                                ? 'bg-amber-400'
                                : 'bg-muted-foreground'
                          }`} />
                          <div className="rounded-lg border p-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold inline-flex items-center">
                                <IndianRupee className="h-3.5 w-3.5" />
                                {payment.amount.toLocaleString()}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <Badge variant={pStatus.variant} className="text-xs">
                                  {pStatus.label}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  onClick={() => setDeletePaymentId(payment.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-medium">
                                {paymentMethodLabels[payment.method] || payment.method}
                              </span>
                              <span>·</span>
                              <span>
                                {payment.paidAt
                                  ? formatDate(payment.paidAt)
                                  : formatDate(payment.createdAt)}
                              </span>
                            </div>
                            {payment.reference && (
                              <p className="text-xs text-muted-foreground">
                                Ref: {payment.reference}
                              </p>
                            )}
                            {payment.notes && (
                              <p className="text-xs text-muted-foreground italic">
                                {payment.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <CreditCard className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                No payments recorded yet
              </p>
              {dues &&
                !dues.isFullyPaid &&
                membership.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPaymentDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Record First Payment
                  </Button>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      {membership && dues && (
        <RecordPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          dueAmount={dues.dueAmount}
          isPending={recordPayment.isPending}
          onSubmit={(data) => recordPayment.mutate(
            { memberId: membership.memberId, membershipId: membership.id, ...data },
            { onSuccess: () => setPaymentDialogOpen(false) }
          )}
        />
      )}

      {/* Edit Membership Dialog */}
      {membership && editDialogOpen && (
        <EditMembershipDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          membership={membership}
        />
      )}

      {/* Renew Membership Dialog */}
      {membership && (
        <RenewMembershipDialog
          open={renewDialogOpen}
          onOpenChange={setRenewDialogOpen}
          membership={membership}
          onRenewSuccess={() => navigate(`${ROUTES.MEMBER_DETAIL}/${membership.memberId}`)}
        />
      )}

      {/* Cancel Confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this membership?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently cancel{' '}
              <span className="font-medium text-foreground">
                {memberName}
              </span>
              's {planName} membership. This action cannot be undone. If the
              wrong plan was selected, cancel this and create a new membership.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Membership</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => cancelMembership.mutate(membership.id)}
              disabled={cancelMembership.isPending}
            >
              {cancelMembership.isPending
                ? 'Cancelling...'
                : 'Yes, Cancel Membership'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Freeze Dialog */}
      {membership && (
        <FreezeMembershipDialog
          open={freezeDialogOpen}
          onOpenChange={setFreezeDialogOpen}
          membership={membership}
          memberName={memberName}
        />
      )}

      {/* Unfreeze Confirmation */}
      <AlertDialog
        open={unfreezeDialogOpen}
        onOpenChange={setUnfreezeDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unfreeze this membership?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This will reactivate{' '}
                <span className="font-medium text-foreground">
                  {memberName}
                </span>
                's membership and restore their access.
              </p>
              <div className="flex items-center space-x-2 rounded-lg border p-3 bg-muted/30">
                <input
                  type="checkbox"
                  id="extendEndDate"
                  checked={extendEndDate}
                  onChange={(e) => setExtendEndDate(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="extendEndDate"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Extend end date by frozen days
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Compensate the member for the time their membership was paused.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => unfreezeMembership.mutate({ id: membership.id, extendEndDate })}
              disabled={unfreezeMembership.isPending}
            >
              {unfreezeMembership.isPending
                ? 'Unfreezing...'
                : 'Yes, Unfreeze Membership'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete Membership Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this membership?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className="font-medium text-foreground">
                {memberName}
              </span>
              's {planName} membership
              {dues && dues.payments.length > 0
                ? ` along with ${dues.payments.length} payment record${dues.payments.length !== 1 ? 's' : ''} (${'\u20B9'}${dues.totalPaid.toLocaleString()} total). This will affect revenue totals.`
                : '.'}{' '}
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Membership</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteMembership.mutate(membership.id, {
                  onSuccess: () => navigate(returnTo),
                })
              }
              disabled={deleteMembership.isPending}
            >
              {deleteMembership.isPending ? 'Deleting...' : 'Yes, Delete Membership'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Payment Confirmation */}
      <AlertDialog
        open={!!deletePaymentId}
        onOpenChange={(open) => { if (!open) setDeletePaymentId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this payment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this payment record. The balance due on this membership will be recalculated. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletePaymentId) {
                  deletePayment.mutate(deletePaymentId, {
                    onSuccess: () => setDeletePaymentId(null),
                  });
                }
              }}
              disabled={deletePayment.isPending}
            >
              {deletePayment.isPending ? 'Deleting...' : 'Yes, Delete Payment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

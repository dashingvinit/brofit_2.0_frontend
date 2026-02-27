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
  useFreezeMembership,
  useUnfreezeMembership,
} from '../hooks/use-memberships';
import { RecordPaymentDialog } from '../components/record-payment-dialog';
import { EditMembershipDialog } from '../components/edit-membership-dialog';
import { ROUTES } from '@/shared/lib/constants';
import type {
  MembershipStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/shared/types/common.types';

const statusConfig: Record<
  MembershipStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  active: { label: 'Active', variant: 'default' },
  expired: { label: 'Expired', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  frozen: { label: 'Frozen', variant: 'outline' },
};

const paymentStatusConfig: Record<
  PaymentStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  paid: { label: 'Paid', variant: 'default' },
  pending: { label: 'Pending', variant: 'outline' },
  failed: { label: 'Failed', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'secondary' },
};

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
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [unfreezeDialogOpen, setUnfreezeDialogOpen] = useState(false);

  const { data: membershipResponse, isLoading: membershipLoading } =
    useMembership(id!);
  const { data: duesResponse, isLoading: duesLoading } = useMembershipDues(
    id!
  );

  const cancelMembership = useCancelMembership();
  const freezeMembership = useFreezeMembership();
  const unfreezeMembership = useUnfreezeMembership();

  const membership = membershipResponse?.data;
  const dues = duesResponse?.data;

  if (membershipLoading) {
    return (
      <div className="space-y-6">
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
      <div className="space-y-6">
        <PageHeader title="Membership Not Found" />
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              The membership you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate(ROUTES.MEMBERSHIPS)}>
              Back to Memberships
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membership Details"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.MEMBERSHIPS)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {/* Actions Dropdown */}
            {isEditable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Details
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
                      {membership.member.email}
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
          </CardContent>
        </Card>

        {/* Dues Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Status</CardTitle>
            <CardDescription>
              {duesLoading
                ? 'Loading...'
                : dues?.isFullyPaid
                  ? 'Fully paid'
                  : 'Outstanding balance'}
            </CardDescription>
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
                  <div className="flex justify-between text-emerald-600">
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
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }
                    >
                      {dues.isFullyPaid ? 'Fully Paid' : 'Balance Due'}
                    </span>
                    <span
                      className={
                        dues.isFullyPaid
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }
                    >
                      <IndianRupee className="inline h-3 w-3" />
                      {dues.dueAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {!dues.isFullyPaid && membership.status !== 'cancelled' && (
                  <Button
                    className="w-full"
                    onClick={() => setPaymentDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                )}

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Payment History</CardTitle>
              <CardDescription>
                All payments recorded against this membership
              </CardDescription>
            </div>
            {dues &&
              !dues.isFullyPaid &&
              membership.status !== 'cancelled' && (
                <Button
                  size="sm"
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
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
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 sm:hidden">
                {dues.payments.map((payment) => {
                  const pStatus = paymentStatusConfig[payment.status];
                  return (
                    <div
                      key={payment.id}
                      className="rounded-lg border p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold inline-flex items-center">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {payment.amount.toLocaleString()}
                        </span>
                        <Badge variant={pStatus.variant}>
                          {pStatus.label}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {paymentMethodLabels[payment.method] ||
                            payment.method}
                        </span>
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
                    </div>
                  );
                })}
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
          memberId={membership.memberId}
          membershipId={membership.id}
          dueAmount={dues.dueAmount}
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

      {/* Freeze Confirmation */}
      <AlertDialog open={freezeDialogOpen} onOpenChange={setFreezeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Freeze this membership?</AlertDialogTitle>
            <AlertDialogDescription>
              Freezing will temporarily pause{' '}
              <span className="font-medium text-foreground">
                {memberName}
              </span>
              's membership. The member won't have active access until it's
              unfrozen. You can unfreeze it anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => freezeMembership.mutate(membership.id)}
              disabled={freezeMembership.isPending}
            >
              {freezeMembership.isPending
                ? 'Freezing...'
                : 'Yes, Freeze Membership'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unfreeze Confirmation */}
      <AlertDialog
        open={unfreezeDialogOpen}
        onOpenChange={setUnfreezeDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unfreeze this membership?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reactivate{' '}
              <span className="font-medium text-foreground">
                {memberName}
              </span>
              's membership and restore their access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => unfreezeMembership.mutate(membership.id)}
              disabled={unfreezeMembership.isPending}
            >
              {unfreezeMembership.isPending
                ? 'Unfreezing...'
                : 'Yes, Unfreeze Membership'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

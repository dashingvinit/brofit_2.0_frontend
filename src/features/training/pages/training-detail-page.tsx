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
  useTraining,
  useTrainingDues,
  useCancelTraining,
  useFreezeTraining,
  useUnfreezeTraining,
  useDeleteTraining,
  useDeleteTrainingPayment,
  useRecordTrainingPayment,
} from '../hooks/use-training';
import { RecordPaymentDialog } from '@/shared/components/record-payment-dialog';
import { RenewTrainingDialog } from '../components/renew-training-dialog';
import { EditTrainingDialog } from '../components/edit-training-dialog';
import { ROUTES } from '@/shared/lib/constants';
import { useReturnTo } from '@/shared/hooks/use-return-to';
import type {
  TrainingStatus,
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

export function TrainingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [unfreezeDialogOpen, setUnfreezeDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [extendEndDate, setExtendEndDate] = useState(true);

  const { data: trainingResponse, isLoading: trainingLoading } =
    useTraining(id!);
  const { data: duesResponse, isLoading: duesLoading } = useTrainingDues(id!);

  const cancelTraining = useCancelTraining();
  const freezeTraining = useFreezeTraining();
  const unfreezeTraining = useUnfreezeTraining();
  const deleteTraining = useDeleteTraining();
  const deletePayment = useDeleteTrainingPayment();
  const returnTo = useReturnTo(ROUTES.TRAININGS);
  const recordPayment = useRecordTrainingPayment();

  const training = trainingResponse?.data;
  const dues = duesResponse?.data;

  if (trainingLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 lg:col-span-2" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!training) {
    return (
      <div className="space-y-4">
        <PageHeader title="Training Not Found" />
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              The training you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate(returnTo)}>
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[training.status];
  const memberName = training.member
    ? `${training.member.firstName} ${training.member.lastName}`
    : 'Unknown';
  const planName = training.planVariant?.planType?.name ?? 'N/A';
  const durationLabel = training.planVariant?.durationLabel ?? '';

  const paidPercentage = dues
    ? dues.finalPrice > 0
      ? Math.min(100, Math.round((dues.totalPaid / dues.finalPrice) * 100))
      : 0
    : 0;

  const isEditable = training.status !== 'cancelled';
  const canFreeze = training.status === 'active';
  const canUnfreeze = training.status === 'frozen';
  const canCancel =
    training.status === 'active' || training.status === 'frozen';
  const canDelete = true;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Training Details"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(returnTo)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {(training.status === 'expired' || training.status === 'cancelled') && (
              <Button onClick={() => setRenewDialogOpen(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Renew
              </Button>
            )}

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
                        <User className="h-4 w-4 mr-2" />
                        Edit Training
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRenewDialogOpen(true)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Renew Training
                      </DropdownMenuItem>

                      {canFreeze && (
                        <DropdownMenuItem
                          onClick={() => setFreezeDialogOpen(true)}
                        >
                          <Snowflake className="h-4 w-4 mr-2" />
                          Freeze Training
                        </DropdownMenuItem>
                      )}

                      {canUnfreeze && (
                        <DropdownMenuItem
                          onClick={() => setUnfreezeDialogOpen(true)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Unfreeze Training
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
                            Cancel Training
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
                        Delete Training
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      {/* Training Info + Dues Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Training Info</CardTitle>
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
                  {training.member?.email && (
                    <p className="text-xs text-muted-foreground">
                      {training.member.email}
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
                    {durationLabel} ({training.planVariant?.durationDays} days)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trainer</p>
                  <p className="font-medium">{training.trainer?.name ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {formatDate(training.startDate)} -{' '}
                    {formatDate(training.endDate)}
                  </p>
                  {training.autoRenew && (
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
                      {training.finalPrice.toLocaleString()}
                    </span>
                    {training.discountAmount > 0 && (
                      <span className="text-muted-foreground ml-1">
                        (
                        <IndianRupee className="inline h-2.5 w-2.5" />
                        {training.priceAtPurchase.toLocaleString()} -{' '}
                        <IndianRupee className="inline h-2.5 w-2.5" />
                        {training.discountAmount.toLocaleString()} discount)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {training.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{training.notes}</p>
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
              {training.status !== 'cancelled' && (!dues || !dues.isFullyPaid) && (
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
                All payments recorded against this training
              </CardDescription>
            </div>
            {training.status !== 'cancelled' && (!dues || !dues.isFullyPaid) && (
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
                  <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-4">
                    {dues.payments.map((payment) => {
                      const pStatus = paymentStatusConfig[payment.status];
                      return (
                        <div key={payment.id} className="relative">
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
              <p className="text-sm text-muted-foreground">
                No payments recorded yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Renew Training Dialog */}
      {training && (
        <RenewTrainingDialog
          open={renewDialogOpen}
          onOpenChange={setRenewDialogOpen}
          training={training}
        />
      )}

      {/* Edit Training Dialog */}
      {training && (
        <EditTrainingDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          training={training}
        />
      )}

      {/* Record Payment Dialog */}
      {training && (
        <RecordPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          dueAmount={dues?.dueAmount ?? 0}
          isPending={recordPayment.isPending}
          onSubmit={(data) => recordPayment.mutate(
            { memberId: training.memberId, trainingId: training.id, ...data },
            { onSuccess: () => setPaymentDialogOpen(false) }
          )}
        />
      )}

      {/* Cancel Confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this training?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  This will permanently cancel{' '}
                  <span className="font-medium text-foreground">
                    {memberName}
                  </span>
                  's {planName} training with {training.trainer?.name}. This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Training</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => cancelTraining.mutate(training.id)}
              disabled={cancelTraining.isPending}
            >
              {cancelTraining.isPending
                ? 'Cancelling...'
                : 'Yes, Cancel Training'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Freeze Confirmation */}
      <AlertDialog open={freezeDialogOpen} onOpenChange={setFreezeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Freeze this training?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Freezing will temporarily pause{' '}
                  <span className="font-medium text-foreground">
                    {memberName}
                  </span>
                  's training. You can unfreeze it anytime.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => freezeTraining.mutate(training.id)}
              disabled={freezeTraining.isPending}
            >
              {freezeTraining.isPending
                ? 'Freezing...'
                : 'Yes, Freeze Training'}
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
            <AlertDialogTitle>Unfreeze this training?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  This will reactivate{' '}
                  <span className="font-medium text-foreground">
                    {memberName}
                  </span>
                  's training sessions.
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
                      Compensate the member for the paused duration.
                    </p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => unfreezeTraining.mutate({ id: training.id, extendEndDate })}
              disabled={unfreezeTraining.isPending}
            >
              {unfreezeTraining.isPending
                ? 'Unfreezing...'
                : 'Yes, Unfreeze Training'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete Training Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this training?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This will permanently delete{' '}
                  <span className="font-medium text-foreground">
                    {memberName}
                  </span>
                  's {planName} training with {training.trainer?.name}
                  {dues && dues.payments.length > 0
                    ? ` along with ${dues.payments.length} payment record${dues.payments.length !== 1 ? 's' : ''} (${'\u20B9'}${dues.totalPaid.toLocaleString()} total). This will affect revenue totals.`
                    : '.'}{' '}
                  This cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Training</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteTraining.mutate(training.id, {
                  onSuccess: () => navigate(returnTo),
                })
              }
              disabled={deleteTraining.isPending}
            >
              {deleteTraining.isPending ? 'Deleting...' : 'Yes, Delete Training'}
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
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  This will permanently remove this payment record. The balance due on this training will be recalculated. This cannot be undone.
                </p>
              </div>
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

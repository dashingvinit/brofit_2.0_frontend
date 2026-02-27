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
} from '../hooks/use-training';
import { ROUTES } from '@/shared/lib/constants';
import type {
  TrainingStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/shared/types/common.types';

const statusConfig: Record<
  TrainingStatus,
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

export function TrainingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [unfreezeDialogOpen, setUnfreezeDialogOpen] = useState(false);

  const { data: trainingResponse, isLoading: trainingLoading } =
    useTraining(id!);
  const { data: duesResponse, isLoading: duesLoading } = useTrainingDues(id!);

  const cancelTraining = useCancelTraining();
  const freezeTraining = useFreezeTraining();
  const unfreezeTraining = useUnfreezeTraining();

  const training = trainingResponse?.data;
  const dues = duesResponse?.data;

  if (trainingLoading) {
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

  if (!training) {
    return (
      <div className="space-y-6">
        <PageHeader title="Training Not Found" />
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              The training you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate(ROUTES.TRAININGS)}>
              Back to Trainings
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training Details"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.TRAININGS)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {isEditable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      {/* Training Info + Dues Overview */}
      <div className="grid gap-4 lg:grid-cols-3">
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
                  <p className="font-medium">{training.trainerName}</p>
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
          <CardTitle className="text-lg">Payment History</CardTitle>
          <CardDescription>
            All payments recorded against this training
          </CardDescription>
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
              <p className="text-sm text-muted-foreground">
                No payments recorded yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this training?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently cancel{' '}
              <span className="font-medium text-foreground">
                {memberName}
              </span>
              's {planName} training with {training.trainerName}. This action cannot be undone.
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
            <AlertDialogDescription>
              Freezing will temporarily pause{' '}
              <span className="font-medium text-foreground">
                {memberName}
              </span>
              's training. You can unfreeze it anytime.
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
            <AlertDialogDescription>
              This will reactivate{' '}
              <span className="font-medium text-foreground">
                {memberName}
              </span>
              's training sessions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => unfreezeTraining.mutate(training.id)}
              disabled={unfreezeTraining.isPending}
            >
              {unfreezeTraining.isPending
                ? 'Unfreezing...'
                : 'Yes, Unfreeze Training'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

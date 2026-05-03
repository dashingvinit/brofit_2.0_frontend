import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrganization } from '@clerk/clerk-react';
import {
  CheckCircle2,
  Printer,
  ArrowLeft,
  IndianRupee,
  CalendarDays,
  User,
  Dumbbell,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { PageHeader } from '@/shared/components/page-header';
import { RecordPaymentDialog } from '@/shared/components/record-payment-dialog';
import { useMembership, useMembershipDues, useRecordPayment } from '../hooks/use-memberships';
import { useReturnTo } from '@/shared/hooks/use-return-to';
import { ROUTES, PAYMENT_STATUS_CONFIG, SUBSCRIPTION_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from '@/shared/lib/constants';
import { formatDate } from '@/shared/lib/utils';

export function MembershipReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { organization } = useOrganization();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const { data: membershipResponse, isLoading: membershipLoading } = useMembership(id!);
  const { data: duesResponse, isLoading: duesLoading } = useMembershipDues(id!);
  const recordPayment = useRecordPayment();

  const returnTo = useReturnTo(ROUTES.MEMBERSHIPS);
  const membership = membershipResponse?.data;
  const dues = duesResponse?.data;

  if (membershipLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <div className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="space-y-4">
        <PageHeader title="Receipt Not Found" />
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Membership not found.</p>
            <Button onClick={() => navigate(ROUTES.MEMBERSHIPS)}>Back to Memberships</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const memberName = membership.member
    ? `${membership.member.firstName} ${membership.member.lastName}`
    : 'Unknown';
  const planName = membership.planVariant?.planType?.name ?? 'N/A';
  const durationLabel = membership.planVariant?.durationLabel ?? '';
  const status = SUBSCRIPTION_STATUS_CONFIG[membership.status];
  const paidPercentage = dues
    ? dues.finalPrice > 0
      ? Math.min(100, Math.round((dues.totalPaid / dues.finalPrice) * 100))
      : 0
    : 0;
  const receiptNumber = `MBR-${membership.id.slice(-8).toUpperCase()}`;
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* Screen header */}
      <div className="space-y-4 print:hidden mb-4">
        <PageHeader
          title="Membership Receipt"
          description="Transaction confirmed. Print or save for your records."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate(returnTo)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Done
              </Button>
              <Button onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
            </div>
          }
        />
      </div>

      {/* Print-only header */}
      <div className="hidden print:flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{organization?.name ?? 'Brofit'}</h1>
          <p className="text-sm text-muted-foreground">Membership Receipt</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p className="font-mono">{receiptNumber}</p>
          <p>{formatDate(today)}</p>
        </div>
      </div>

      {/* Status banner — screen only, redundant on paper */}
      <div
        className={`flex items-center gap-3 rounded-lg p-4 mb-4 animate-in fade-in duration-300 print:hidden ${
          dues?.isFullyPaid || !dues
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
        }`}
      >
        <CheckCircle2 className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-semibold">
            {dues?.isFullyPaid
              ? 'Membership Activated — Fully Paid'
              : 'Membership Activated'}
          </p>
          <p className="text-sm opacity-80">
            {dues?.isFullyPaid
              ? 'Payment complete. Member has full access.'
              : dues && dues.dueAmount > 0
                ? `Balance of ₹${dues.dueAmount.toLocaleString()} remaining.`
                : 'Membership created successfully.'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 print:block">
        {/* Receipt card — the printable zone */}
        <Card className="lg:col-span-2 print:col-span-full print:shadow-none print:border print:border-gray-300 print:rounded-none print:max-w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between print:hidden">
              <CardTitle>Receipt</CardTitle>
              <span className="text-xs text-muted-foreground font-mono">{receiptNumber}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Member */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 p-2 shrink-0">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold">{memberName}</p>
                {membership.member?.phone && (
                  <p className="text-sm text-muted-foreground">{membership.member.phone}</p>
                )}
                {membership.member?.email && (
                  <p className="text-xs text-muted-foreground">{membership.member.email}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Line items */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 p-2 shrink-0">
                    <Dumbbell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{planName}</p>
                    <p className="text-xs text-muted-foreground">{durationLabel}</p>
                  </div>
                </div>
                <p className="font-medium text-sm whitespace-nowrap">
                  <IndianRupee className="inline h-3 w-3" />
                  {membership.priceAtPurchase.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-3 ml-11 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {formatDate(membership.startDate)} → {formatDate(membership.endDate)}
                </span>
              </div>

              {membership.discountAmount > 0 && (
                <div className="flex items-center justify-between ml-11">
                  <span className="text-sm text-muted-foreground">
                    Discount
                    {membership.offer ? ` (${(membership.offer as any).name ?? 'Offer'})` : ''}
                  </span>
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    −<IndianRupee className="inline h-3 w-3" />
                    {membership.discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Due</span>
              <span className="font-bold text-lg">
                <IndianRupee className="inline h-4 w-4" />
                {membership.finalPrice.toLocaleString()}
              </span>
            </div>

            {/* Payment records */}
            {!duesLoading && dues && dues.payments.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Payments Received
                  </p>
                  {dues.payments.map((payment) => {
                    const ps = PAYMENT_STATUS_CONFIG[payment.status];
                    return (
                      <div key={payment.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={ps.variant} className="text-xs">
                            {ps.label}
                          </Badge>
                          <span className="text-muted-foreground">
                            {PAYMENT_METHOD_LABELS[payment.method]}
                            {payment.paidAt ? ` · ${formatDate(payment.paidAt)}` : ''}
                          </span>
                          {payment.reference && (
                            <span className="text-xs text-muted-foreground font-mono">
                              #{payment.reference}
                            </span>
                          )}
                        </div>
                        <span className="font-medium whitespace-nowrap">
                          <IndianRupee className="inline h-3 w-3" />
                          {payment.amount.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {dues.isFullyPaid ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    All dues cleared
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm font-semibold text-amber-600 dark:text-amber-400">
                    <span>Balance Due</span>
                    <span>
                      <IndianRupee className="inline h-3 w-3" />
                      {dues.dueAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Print footer */}
            <div className="hidden print:block pt-6 text-center text-xs text-muted-foreground border-t">
              Thank you for your membership!
            </div>
          </CardContent>
        </Card>

        {/* Sidebar — screen only */}
        <div className="space-y-4 print:hidden">
          {/* Membership info */}
          <Card className="animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="pb-3">
              <CardTitle>Membership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Starts</span>
                <span className="font-medium">{formatDate(membership.startDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span className="font-medium">{formatDate(membership.endDate)}</span>
              </div>
              {membership.autoRenew && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Auto-renew</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">On</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment status */}
          {!duesLoading && dues && (
            <Card className="animate-in fade-in zoom-in-95 duration-300 delay-75">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Payment</CardTitle>
                  {!dues.isFullyPaid && membership.status !== 'cancelled' && (
                    <Button size="sm" onClick={() => setPaymentDialogOpen(true)}>
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Pay
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid</span>
                    <span className="font-medium">{paidPercentage}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
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
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
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
                  <div
                    className={`flex justify-between font-semibold ${
                      dues.isFullyPaid
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    <span>{dues.isFullyPaid ? 'Fully Paid' : 'Balance Due'}</span>
                    <span>
                      <IndianRupee className="inline h-3 w-3" />
                      {dues.dueAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick actions */}
          <Card className="animate-in fade-in zoom-in-95 duration-300 delay-150">
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`${ROUTES.MEMBERSHIPS}/${membership.id}`)}
              >
                View Full Details
              </Button>
              {membership.member && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`${ROUTES.MEMBERS}/${membership.memberId}`)}
                >
                  View Member Profile
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(ROUTES.CREATE_MEMBERSHIP)}
              >
                New Membership
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Payment Dialog */}
      {membership && dues && (
        <RecordPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          dueAmount={dues.dueAmount}
          isPending={recordPayment.isPending}
          onSubmit={(data) =>
            recordPayment.mutate(
              { memberId: membership.memberId, membershipId: membership.id, ...data },
              { onSuccess: () => setPaymentDialogOpen(false) }
            )
          }
        />
      )}
    </>
  );
}

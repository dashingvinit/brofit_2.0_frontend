import { useState } from 'react';
import { IndianRupee, CreditCard, Dumbbell, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { RecordPaymentDialog } from '@/shared/components/record-payment-dialog';
import { useMemberDues } from '@/features/members/hooks/use-member-detail';
import { useRecordPayment } from '@/features/memberships/hooks/use-memberships';
import { useRecordTrainingPayment } from '@/features/training/hooks/use-training';
import type { PaymentMethod } from '@/shared/types/common.types';
import { formatCurrency } from '@/shared/lib/utils';

type DueTarget = {
  type: 'membership' | 'training';
  id: string;
  dueAmount: number;
  name: string;
};

interface QuickPaymentDialogProps {
  memberId: string;
  memberName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickPaymentDialog({ memberId, memberName, open, onOpenChange }: QuickPaymentDialogProps) {
  const [payTarget, setPayTarget] = useState<DueTarget | null>(null);
  const { data: duesRes, isLoading } = useMemberDues(memberId);
  const recordMembership = useRecordPayment();
  const recordTraining = useRecordTrainingPayment();

  const memberDues = duesRes?.data?.[0];
  const membershipDues = (memberDues?.membershipDues ?? []).filter((d) => d.dueAmount > 0);
  const trainingDues = (memberDues?.trainingDues ?? []).filter((d) => d.dueAmount > 0);
  const hasAnyDues = membershipDues.length > 0 || trainingDues.length > 0;

  const handlePaySubmit = (data: {
    amount: number;
    method: PaymentMethod;
    paidAt?: string;
    reference?: string;
    notes?: string;
  }) => {
    if (!payTarget) return;
    const payload = {
      memberId,
      amount: data.amount,
      method: data.method,
      paidAt: data.paidAt,
      reference: data.reference,
      notes: data.notes,
    };
    const close = () => { setPayTarget(null); onOpenChange(false); };
    if (payTarget.type === 'membership') {
      recordMembership.mutate({ ...payload, membershipId: payTarget.id }, { onSuccess: close });
    } else {
      recordTraining.mutate({ ...payload, trainingId: payTarget.id }, { onSuccess: close });
    }
  };

  const isPending = recordMembership.isPending || recordTraining.isPending;

  return (
    <>
      <Dialog
        open={open && !payTarget}
        onOpenChange={(v) => { if (!v) { setPayTarget(null); } onOpenChange(v); }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>{memberName} — select what to pay</DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : !hasAnyDues ? (
            <p className="text-sm text-muted-foreground text-center py-4">No outstanding dues.</p>
          ) : (
            <div className="space-y-1.5">
              {membershipDues.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setPayTarget({ type: 'membership', id: d.id, dueAmount: d.dueAmount, name: d.planName })}
                  className="w-full flex items-center justify-between rounded-lg border p-3 text-left hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                      <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{d.planName}</p>
                      <p className="text-xs text-muted-foreground">Membership dues</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center text-sm">
                      <IndianRupee className="h-3 w-3" />{formatCurrency(d.dueAmount)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
              {trainingDues.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setPayTarget({ type: 'training', id: d.id, dueAmount: d.dueAmount, name: d.planName })}
                  className="w-full flex items-center justify-between rounded-lg border p-3 text-left hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center shrink-0">
                      <Dumbbell className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{d.planName}</p>
                      <p className="text-xs text-muted-foreground">Training dues</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center text-sm">
                      <IndianRupee className="h-3 w-3" />{formatCurrency(d.dueAmount)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {payTarget && (
        <RecordPaymentDialog
          open={!!payTarget}
          onOpenChange={(v) => { if (!v) setPayTarget(null); }}
          dueAmount={payTarget.dueAmount}
          isPending={isPending}
          onSubmit={handlePaySubmit}
        />
      )}
    </>
  );
}

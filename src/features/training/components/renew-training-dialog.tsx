import { usePlanVariantsByType } from '@/features/plans/hooks/use-plan-variants';
import { useTrainers } from '@/features/trainer/hooks/use-trainers';
import { RenewSubscriptionDialog } from '@/shared/components/renew-subscription-dialog';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useCreateTraining } from '../hooks/use-training';
import type { Training, PaymentMethod } from '@/shared/types/common.types';

interface RenewTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training: Training;
}

export function RenewTrainingDialog({ open, onOpenChange, training }: RenewTrainingDialogProps) {
  const createTraining = useCreateTraining();
  const planTypeId = training.planVariant?.planTypeId ?? '';
  const { data: variants } = usePlanVariantsByType(planTypeId, false);
  const { data: trainersResponse } = useTrainers();
  const activeTrainers = (trainersResponse?.data ?? []).filter((t) => t.isActive);

  const defaultStart = (() => {
    const end = new Date(training.endDate);
    const today = new Date();
    const base = end > today ? end : today;
    base.setDate(base.getDate() + (end > today ? 1 : 0));
    return base.toISOString().split('T')[0];
  })();

  return (
    <RenewSubscriptionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Renew Training"
      description={
        <>
          Renewing{' '}
          <span className="font-medium text-foreground">
            {training.member?.firstName} {training.member?.lastName}
          </span>
          's training. Previous plan & trainer pre-filled — change if needed.
        </>
      }
      autoRenewLabel="Auto-renew when this training expires"
      submitLabel="Renew Training"
      isPending={createTraining.isPending}
      defaultValues={{
        planVariantId: training.planVariantId,
        trainerId: training.trainerId,
        startDate: defaultStart,
        autoRenew: training.autoRenew,
      }}
      variants={variants}
      extraFields={(form) => (
        <div className="space-y-2">
          <Label>Trainer</Label>
          <Select
            value={form.watch('trainerId') || training.trainerId}
            onValueChange={(v) => form.setValue('trainerId', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select trainer" />
            </SelectTrigger>
            <SelectContent>
              {activeTrainers.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      onSubmit={(data) => {
        createTraining.mutate(
          {
            memberId: training.memberId,
            planVariantId: data.planVariantId,
            trainerId: data.trainerId ?? training.trainerId,
            startDate: data.startDate,
            discountAmount: data.discountAmount || 0,
            autoRenew: data.autoRenew,
            notes: data.notes || undefined,
            paymentAmount: data.collectPayment ? data.paymentAmount : undefined,
            paymentMethod: data.collectPayment ? (data.paymentMethod as PaymentMethod) : undefined,
            paymentReference: data.collectPayment ? data.paymentReference || undefined : undefined,
          },
          { onSuccess: () => onOpenChange(false) }
        );
      }}
    />
  );
}

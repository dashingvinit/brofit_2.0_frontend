import { usePlanVariantsByType } from '@/features/plans/hooks/use-plan-variants';
import { RenewSubscriptionDialog } from '@/shared/components/renew-subscription-dialog';
import { useCreateMembership } from '../hooks/use-memberships';
import type { Membership, PaymentMethod } from '@/shared/types/common.types';

interface RenewMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membership: Membership;
  onRenewSuccess?: () => void;
}

export function RenewMembershipDialog({
  open,
  onOpenChange,
  membership,
  onRenewSuccess,
}: RenewMembershipDialogProps) {
  const createMembership = useCreateMembership();
  const planTypeId = membership.planVariant?.planTypeId ?? '';
  const { data: variants } = usePlanVariantsByType(planTypeId, false);

  const defaultStart = (() => {
    const end = new Date(membership.endDate);
    const today = new Date();
    const base = end > today ? end : today;
    base.setDate(base.getDate() + (end > today ? 1 : 0));
    return base.toISOString().split('T')[0];
  })();

  return (
    <RenewSubscriptionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Renew Membership"
      description={
        <>
          Renewing{' '}
          <span className="font-medium text-foreground">
            {membership.member?.firstName} {membership.member?.lastName}
          </span>
          's membership. Previous plan pre-filled — change if needed.
        </>
      }
      autoRenewLabel="Auto-renew when this membership expires"
      submitLabel="Renew Membership"
      isPending={createMembership.isPending}
      defaultValues={{
        planVariantId: membership.planVariantId,
        startDate: defaultStart,
        autoRenew: membership.autoRenew,
      }}
      variants={variants}
      onSubmit={(data) => {
        createMembership.mutate(
          {
            memberId: membership.memberId,
            planVariantId: data.planVariantId,
            startDate: data.startDate,
            discountAmount: data.discountAmount || 0,
            autoRenew: data.autoRenew,
            notes: data.notes || undefined,
            paymentAmount: data.collectPayment ? data.paymentAmount : undefined,
            paymentMethod: data.collectPayment ? (data.paymentMethod as PaymentMethod) : undefined,
            paymentReference: data.collectPayment ? data.paymentReference || undefined : undefined,
          },
          {
            onSuccess: () => {
              onOpenChange(false);
              onRenewSuccess?.();
            },
          }
        );
      }}
    />
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IndianRupee, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { usePlanVariantsByType } from '@/features/plans/hooks/use-plan-variants';
import { useCreateMembership } from '../hooks/use-memberships';
import type { Membership, PaymentMethod } from '@/shared/types/common.types';

const renewSchema = z
  .object({
    planVariantId: z.string().min(1, 'Please select a plan variant'),
    startDate: z.string().min(1, 'Start date is required'),
    discountAmount: z.coerce.number().min(0).default(0),
    autoRenew: z.boolean().default(false),
    notes: z.string().optional(),
    collectPayment: z.boolean().default(false),
    paymentAmount: z.coerce.number().optional(),
    paymentMethod: z.string().optional(),
    paymentReference: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.collectPayment) {
        return !!data.paymentMethod && (data.paymentAmount ?? 0) > 0;
      }
      return true;
    },
    {
      message: 'Payment amount and method are required',
      path: ['paymentAmount'],
    }
  );

type RenewFormData = z.infer<typeof renewSchema>;

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

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

  // Default start date: day after current end date (or today if already expired)
  const defaultStart = (() => {
    const end = new Date(membership.endDate);
    const today = new Date();
    const base = end > today ? end : today;
    base.setDate(base.getDate() + (end > today ? 1 : 0));
    return base.toISOString().split('T')[0];
  })();

  const form = useForm<RenewFormData>({
    resolver: zodResolver(renewSchema),
    defaultValues: {
      planVariantId: membership.planVariantId,
      startDate: defaultStart,
      discountAmount: 0,
      autoRenew: membership.autoRenew,
      notes: '',
      collectPayment: false,
      paymentAmount: undefined,
      paymentMethod: '',
      paymentReference: '',
    },
  });

  const selectedVariantId = form.watch('planVariantId');
  const discountAmount = form.watch('discountAmount') ?? 0;
  const collectPayment = form.watch('collectPayment');

  const selectedVariant = variants?.find((v) => v.id === selectedVariantId);
  const finalPrice = Math.max(0, (selectedVariant?.price ?? 0) - discountAmount);

  // Auto-fill payment amount when price changes
  useEffect(() => {
    if (collectPayment && finalPrice > 0) {
      form.setValue('paymentAmount', finalPrice);
    }
  }, [finalPrice, collectPayment]);

  const onValidationError = (errors: Record<string, any>) => {
    const messages = Object.values(errors)
      .map((e: any) => e?.message)
      .filter(Boolean);
    toast.error(messages[0] ?? 'Please fix the form errors before submitting');
  };

  const onSubmit = (data: RenewFormData) => {
    createMembership.mutate(
      {
        memberId: membership.memberId,
        planVariantId: data.planVariantId,
        startDate: data.startDate,
        discountAmount: data.discountAmount || 0,
        autoRenew: data.autoRenew,
        notes: data.notes || undefined,
        paymentAmount: data.collectPayment ? data.paymentAmount : undefined,
        paymentMethod: data.collectPayment
          ? (data.paymentMethod as PaymentMethod)
          : undefined,
        paymentReference: data.collectPayment
          ? data.paymentReference || undefined
          : undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
          onRenewSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!createMembership.isPending) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Renew Membership
          </DialogTitle>
          <DialogDescription>
            Renewing{' '}
            <span className="font-medium text-foreground">
              {membership.member?.firstName} {membership.member?.lastName}
            </span>
            's membership. Previous plan pre-filled — change if needed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, onValidationError)} className="space-y-4">
          {/* Plan Variant */}
          <div className="space-y-2">
            <Label>Plan & Duration</Label>
            <Select
              value={form.watch('planVariantId')}
              onValueChange={(v) => form.setValue('planVariantId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {variants?.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    <span className="flex items-center gap-2">
                      {v.durationLabel}
                      <span className="text-muted-foreground text-xs">
                        ₹{v.price.toLocaleString()}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.planVariantId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.planVariantId.message}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...form.register('startDate')}
            />
            {form.formState.errors.startDate && (
              <p className="text-sm text-destructive">
                {form.formState.errors.startDate.message}
              </p>
            )}
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <Label htmlFor="discountAmount">Discount (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="discountAmount"
                type="number"
                min={0}
                className="pl-9"
                placeholder="0"
                {...form.register('discountAmount')}
              />
            </div>
          </div>

          {/* Price Summary */}
          {selectedVariant && (
            <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Plan price</span>
                <span>₹{selectedVariant.price.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Discount</span>
                  <span>− ₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Final Price</span>
                <span>₹{finalPrice.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Auto-renew */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="autoRenew"
              checked={form.watch('autoRenew')}
              onCheckedChange={(c) => form.setValue('autoRenew', c === true)}
            />
            <Label htmlFor="autoRenew" className="text-sm font-normal">
              Auto-renew when this membership expires
            </Label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="e.g., Loyalty renewal, referral discount..."
              rows={2}
            />
          </div>

          <Separator />

          {/* Collect Payment toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="collectPayment"
              checked={form.watch('collectPayment')}
              onCheckedChange={(c) => form.setValue('collectPayment', c === true)}
            />
            <Label htmlFor="collectPayment" className="text-sm font-normal">
              Collect payment now
            </Label>
          </div>

          {collectPayment && (
            <div className="space-y-3 rounded-lg border p-3">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Amount *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="paymentAmount"
                    type="number"
                    min={1}
                    className="pl-9"
                    placeholder={finalPrice.toString()}
                    {...form.register('paymentAmount')}
                  />
                </div>
                {form.formState.errors.paymentAmount && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.paymentAmount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select
                  value={form.watch('paymentMethod') || ''}
                  onValueChange={(v) => form.setValue('paymentMethod', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentReference">Reference / Transaction ID</Label>
                <Input
                  id="paymentReference"
                  {...form.register('paymentReference')}
                  placeholder="e.g., UPI ID, cheque number"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMembership.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMembership.isPending}>
              {createMembership.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renewing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Renew Membership
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

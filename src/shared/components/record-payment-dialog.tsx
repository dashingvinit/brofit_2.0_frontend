import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IndianRupee, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
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
import { PAYMENT_METHODS } from '@/shared/constants/payment';
import type { PaymentMethod } from '@/shared/types/common.types';

const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  method: z.string().min(1, 'Payment method is required'),
  paidAt: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>;

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dueAmount: number;
  isPending: boolean;
  onSubmit: (data: {
    amount: number;
    method: PaymentMethod;
    paidAt?: string;
    reference?: string;
    notes?: string;
  }) => void;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  dueAmount,
  isPending,
  onSubmit,
}: RecordPaymentDialogProps) {
  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<RecordPaymentFormData>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      amount: dueAmount > 0 ? dueAmount : undefined,
      method: '',
      paidAt: today,
      reference: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        amount: dueAmount > 0 ? dueAmount : undefined,
        method: '',
        paidAt: today,
        reference: '',
        notes: '',
      });
    }
  }, [open, dueAmount]);

  const handleSubmit = (data: RecordPaymentFormData) => {
    onSubmit({
      amount: data.amount,
      method: data.method as PaymentMethod,
      paidAt: data.paidAt,
      reference: data.reference,
      notes: data.notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Outstanding balance:{' '}
            <span className="font-semibold text-foreground">
              <IndianRupee className="inline h-3 w-3" />
              {dueAmount.toLocaleString()}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                min={1}
                max={dueAmount}
                className="pl-9"
                placeholder="Enter amount"
                {...form.register('amount')}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <Select
              value={form.watch('method') || ''}
              onValueChange={(value) => form.setValue('method', value)}
            >
              <SelectTrigger id="method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.method && (
              <p className="text-sm text-destructive">{form.formState.errors.method.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidAt">Payment Date</Label>
            <Input id="paidAt" type="date" max={today} {...form.register('paidAt')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference / Transaction ID</Label>
            <Input id="reference" {...form.register('reference')} placeholder="e.g., UPI ID, cheque number" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...form.register('notes')} placeholder="Any notes about this payment..." rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Payment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

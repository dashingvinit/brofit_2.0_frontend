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
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useCreateInvestment, useUpdateInvestment } from '../hooks/use-financials';
import type { Investment } from '@/shared/types/common.types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface InvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass an investment to edit; omit for create mode */
  investment?: Investment;
}

export function InvestmentDialog({ open, onOpenChange, investment }: InvestmentDialogProps) {
  const createInvestment = useCreateInvestment();
  const updateInvestment = useUpdateInvestment();
  const isPending = createInvestment.isPending || updateInvestment.isPending;
  const isEdit = !!investment;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      amount: undefined,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  useEffect(() => {
    if (investment) {
      form.reset({
        name: investment.name,
        amount: investment.amount,
        date: investment.date.split('T')[0],
        notes: investment.notes ?? '',
      });
    } else {
      form.reset({
        name: '',
        amount: undefined,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [investment, open]);

  const onSubmit = (data: FormData) => {
    const payload = {
      name: data.name,
      amount: data.amount,
      date: data.date,
      notes: data.notes || undefined,
    };

    if (isEdit) {
      updateInvestment.mutate(
        { id: investment.id, data: payload },
        { onSuccess: () => { form.reset(); onOpenChange(false); } }
      );
    } else {
      createInvestment.mutate(payload, {
        onSuccess: () => { form.reset(); onOpenChange(false); },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Investment' : 'Add Investment'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Treadmill, Renovation, Equipment"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inv-amount">Amount *</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="inv-amount"
                type="number"
                min={1}
                step="0.01"
                className="pl-9"
                placeholder="0.00"
                {...form.register('amount')}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inv-date">Date *</Label>
            <Input
              id="inv-date"
              type="date"
              {...form.register('date')}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes about this investment..."
              rows={2}
              {...form.register('notes')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Saving...' : 'Adding...'}
                </>
              ) : isEdit ? 'Save Changes' : 'Add Investment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

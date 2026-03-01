import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IndianRupee, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
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
import { useCreateExpense, useUpdateExpense } from '../hooks/use-financials';
import type { Expense, ExpenseCategory } from '@/shared/types/common.types';

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'staff', label: 'Staff' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' },
];

const schema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass an expense to edit; omit for create mode */
  expense?: Expense;
}

export function ExpenseDialog({ open, onOpenChange, expense }: ExpenseDialogProps) {
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const isPending = createExpense.isPending || updateExpense.isPending;
  const isEdit = !!expense;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: undefined,
      category: 'other',
      date: new Date().toISOString().split('T')[0],
      description: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (expense) {
      form.reset({
        amount: expense.amount,
        category: expense.category,
        date: expense.date.split('T')[0],
        description: expense.description ?? '',
      });
    } else {
      form.reset({
        amount: undefined,
        category: 'other',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
  }, [expense, open]);

  const onSubmit = (data: FormData) => {
    const payload = {
      amount: data.amount,
      category: data.category as ExpenseCategory,
      date: data.date,
      description: data.description || undefined,
    };

    if (isEdit) {
      updateExpense.mutate(
        { id: expense.id, data: payload },
        { onSuccess: () => { form.reset(); onOpenChange(false); } }
      );
    } else {
      createExpense.mutate(payload, {
        onSuccess: () => { form.reset(); onOpenChange(false); },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="amount"
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
            <Label htmlFor="category">Category *</Label>
            <Select
              value={form.watch('category')}
              onValueChange={(v) => form.setValue('category', v)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...form.register('date')}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional description"
              {...form.register('description')}
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
              ) : isEdit ? 'Save Changes' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

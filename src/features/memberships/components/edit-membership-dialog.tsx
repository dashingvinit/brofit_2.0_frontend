import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useUpdateMembership } from '../hooks/use-memberships';
import type { Membership } from '@/shared/types/common.types';

const editMembershipSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  discountAmount: z.coerce.number().min(0, 'Discount cannot be negative'),
  autoRenew: z.boolean(),
  notes: z.string().optional(),
});

type EditMembershipFormData = z.infer<typeof editMembershipSchema>;

interface EditMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membership: Membership;
}

export function EditMembershipDialog({
  open,
  onOpenChange,
  membership,
}: EditMembershipDialogProps) {
  const updateMembership = useUpdateMembership();

  const form = useForm<EditMembershipFormData>({
    resolver: zodResolver(editMembershipSchema),
    defaultValues: {
      startDate: membership.startDate.split('T')[0],
      endDate: membership.endDate.split('T')[0],
      discountAmount: membership.discountAmount,
      autoRenew: membership.autoRenew,
      notes: membership.notes || '',
    },
  });

  const onSubmit = (data: EditMembershipFormData) => {
    updateMembership.mutate(
      {
        id: membership.id,
        data: {
          startDate: data.startDate,
          endDate: data.endDate,
          discountAmount: data.discountAmount,
          autoRenew: data.autoRenew,
          notes: data.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Membership</DialogTitle>
          <DialogDescription>
            Correct start date, end date, discount, and other details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...form.register('endDate')}
              />
              {form.formState.errors.endDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountAmount">Discount Amount (₹)</Label>
            <Input
              id="discountAmount"
              type="number"
              min={0}
              {...form.register('discountAmount')}
            />
            {form.formState.errors.discountAmount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.discountAmount.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoRenew"
              checked={form.watch('autoRenew')}
              onCheckedChange={(checked) =>
                form.setValue('autoRenew', checked === true)
              }
            />
            <Label htmlFor="autoRenew" className="text-sm font-normal">
              Auto-renew when membership expires
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Any notes about this membership..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMembership.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMembership.isPending}>
              {updateMembership.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

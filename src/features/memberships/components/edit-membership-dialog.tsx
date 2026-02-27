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
  endDate: z.string().min(1, 'End date is required'),
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
      endDate: membership.endDate.split('T')[0],
      autoRenew: membership.autoRenew,
      notes: membership.notes || '',
    },
  });

  const onSubmit = (data: EditMembershipFormData) => {
    updateMembership.mutate(
      {
        id: membership.id,
        data: {
          endDate: data.endDate,
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
            Update end date, auto-renew, and notes. Plan and pricing cannot be
            changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Snowflake } from 'lucide-react';
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
import { useFreezeMembership } from '../hooks/use-memberships';
import type { Membership } from '@/shared/types/common.types';

const freezeSchema = z
  .object({
    reason: z.string().optional(),
    freezeStartDate: z.string().min(1, 'Freeze start date is required'),
    freezeEndDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.freezeEndDate && data.freezeStartDate) {
        return new Date(data.freezeEndDate) > new Date(data.freezeStartDate);
      }
      return true;
    },
    { message: 'End date must be after start date', path: ['freezeEndDate'] }
  );

type FreezeFormData = z.infer<typeof freezeSchema>;

interface FreezeMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membership: Membership;
  memberName: string;
}

export function FreezeMembershipDialog({
  open,
  onOpenChange,
  membership,
  memberName,
}: FreezeMembershipDialogProps) {
  const freezeMembership = useFreezeMembership();

  const today = new Date().toISOString().split('T')[0];

  const form = useForm<FreezeFormData>({
    resolver: zodResolver(freezeSchema),
    defaultValues: {
      reason: '',
      freezeStartDate: today,
      freezeEndDate: '',
    },
  });

  const onSubmit = (data: FreezeFormData) => {
    freezeMembership.mutate(
      {
        id: membership.id,
        reason: data.reason || undefined,
        freezeStartDate: data.freezeStartDate,
        freezeEndDate: data.freezeEndDate || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-blue-500" />
            Freeze Membership
          </DialogTitle>
          <DialogDescription>
            Temporarily pause <span className="font-medium text-foreground">{memberName}</span>'s
            membership. They won't have active access until unfrozen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="freezeStartDate">Freeze From</Label>
              <Input
                id="freezeStartDate"
                type="date"
                {...form.register('freezeStartDate')}
              />
              {form.formState.errors.freezeStartDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.freezeStartDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="freezeEndDate">
                Auto-resume On{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="freezeEndDate"
                type="date"
                min={form.watch('freezeStartDate') || today}
                {...form.register('freezeEndDate')}
              />
              {form.formState.errors.freezeEndDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.freezeEndDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="reason"
              {...form.register('reason')}
              placeholder="e.g. Injury, travel, personal reasons..."
              rows={3}
            />
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-sm text-blue-700 dark:text-blue-400">
            {form.watch('freezeEndDate')
              ? `Membership will auto-resume on ${new Date(form.watch('freezeEndDate')!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`
              : 'Membership will remain frozen until manually unfrozen.'}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={freezeMembership.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={freezeMembership.isPending}>
              {freezeMembership.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Freezing...
                </>
              ) : (
                <>
                  <Snowflake className="mr-2 h-4 w-4" />
                  Freeze Membership
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

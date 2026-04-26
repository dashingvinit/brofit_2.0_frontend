import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, IndianRupee } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useUpdateTraining } from '../hooks/use-training';
import { useTrainers } from '@/features/trainer/hooks/use-trainers';
import type { Training } from '@/shared/types/common.types';

const editTrainingSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  discountAmount: z.coerce.number().min(0, 'Discount cannot be negative'),
  trainerId: z.string().optional().nullable(),
  trainerFixedPayout: z.coerce.number().nullable().optional(),
  autoRenew: z.boolean(),
  notes: z.string().optional(),
});

type EditTrainingFormData = z.infer<typeof editTrainingSchema>;

interface EditTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training: Training;
}

export function EditTrainingDialog({
  open,
  onOpenChange,
  training,
}: EditTrainingDialogProps) {
  const updateTraining = useUpdateTraining();
  const { data: trainersResponse, isLoading: trainersLoading } = useTrainers();
  const activeTrainers = trainersResponse?.data?.filter(t => t.isActive) || [];

  const form = useForm<EditTrainingFormData>({
    resolver: zodResolver(editTrainingSchema),
    defaultValues: {
      startDate: training.startDate.split('T')[0],
      endDate: training.endDate.split('T')[0],
      discountAmount: training.discountAmount,
      trainerId: training.trainerId,
      trainerFixedPayout: training.trainerFixedPayout,
      autoRenew: training.autoRenew,
      notes: training.notes || '',
    },
  });

  const selectedTrainerId = form.watch('trainerId');
  const selectedTrainer = activeTrainers.find(t => t.id === selectedTrainerId);

  const onSubmit = (data: EditTrainingFormData) => {
    updateTraining.mutate(
      {
        id: training.id,
        data: {
          startDate: data.startDate,
          endDate: data.endDate,
          discountAmount: data.discountAmount,
          trainerId: data.trainerId || undefined,
          trainerFixedPayout: data.trainerFixedPayout,
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Training</DialogTitle>
          <DialogDescription>
            Correct start date, end date, trainer details, and discount.
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

          <div className="space-y-2">
            <Label htmlFor="trainerId">Trainer</Label>
            {trainersLoading ? (
              <div className="flex items-center gap-2 h-10">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading trainers...</span>
              </div>
            ) : (
              <Select
                value={form.watch('trainerId') || ''}
                onValueChange={(value) => form.setValue('trainerId', value)}
              >
                <SelectTrigger id="trainerId">
                  <SelectValue placeholder="Select a trainer" />
                </SelectTrigger>
                <SelectContent>
                  {activeTrainers.map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </SelectItem>
                  ))}
                  {activeTrainers.length === 0 && (
                    <SelectItem value="_none" disabled>
                      No active trainers available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedTrainer && (
            <div className="space-y-2">
              <Label htmlFor="trainerFixedPayout">Trainer Fixed Payout (optional)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="trainerFixedPayout"
                  type="number"
                  min={0}
                  step={1}
                  className="pl-8"
                  placeholder="Leave empty for default split"
                  {...form.register('trainerFixedPayout')}
                  onChange={(e) => {
                    const val = e.target.value;
                    form.setValue('trainerFixedPayout', val === '' ? null : Number(val));
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to use the default {selectedTrainer.splitPercent ?? 60}% split.
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoRenew"
              checked={form.watch('autoRenew')}
              onCheckedChange={(checked) =>
                form.setValue('autoRenew', checked === true)
              }
            />
            <Label htmlFor="autoRenew" className="text-sm font-normal">
              Auto-renew when training expires
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Any notes about this training..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateTraining.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateTraining.isPending}>
              {updateTraining.isPending ? (
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

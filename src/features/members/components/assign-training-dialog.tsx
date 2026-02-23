import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dumbbell } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { trainingPlansApi } from '@/features/plans/api/training-plans-api';
import type { User, TrainingPlan } from '@/shared/types/common.types';
import { LoadingSpinner } from '@/shared/components/loading-spinner';
import { toast } from 'sonner';

const assignTrainingSchema = z.object({
  planId: z.string().optional(),
  planName: z.string().min(1, 'Training plan name is required'),
  trainerId: z.string().optional(),
  trainerName: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  sessionsPerWeek: z.string().optional(),
  notes: z.string().optional(),
});

type AssignTrainingFormData = z.infer<typeof assignTrainingSchema>;

interface AssignTrainingDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AssignTrainingDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: AssignTrainingDialogProps) {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssignTrainingFormData>({
    resolver: zodResolver(assignTrainingSchema),
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await trainingPlansApi.getActivePlans();
        setPlans(response.data);
      } catch (error) {
        console.error('Failed to fetch training plans:', error);
        toast.error('Failed to load training plans');
      } finally {
        setLoadingPlans(false);
      }
    };

    if (open) {
      fetchPlans();
      form.reset({
        startDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [open, form]);

  const calculateEndDate = (startDate: Date, durationDays: number): Date => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  };

  const onSubmit = async (data: AssignTrainingFormData) => {
    try {
      setIsSubmitting(true);

      const selectedPlan = plans.find((p) => p.id === data.planId);

      const startDate = new Date(data.startDate);
      let endDate: string | undefined;

      // Auto-calculate end date if plan has durationDays
      if (selectedPlan?.durationDays) {
        endDate = calculateEndDate(startDate, selectedPlan.durationDays).toISOString();
      } else if (data.endDate) {
        endDate = new Date(data.endDate).toISOString();
      }

      await trainingPlansApi.addTrainingToUser(user.id, {
        planId: data.planId,
        planName: data.planName,
        trainerId: data.trainerId,
        trainerName: data.trainerName,
        startDate: startDate.toISOString(),
        endDate: endDate,
        status: 'active',
        sessionsPerWeek: data.sessionsPerWeek ? parseInt(data.sessionsPerWeek) : undefined,
        notes: data.notes,
      });

      toast.success('Training plan assigned successfully!');
      onSuccess?.();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Failed to assign training plan:', error);
      const message = error.response?.data?.message || 'Failed to assign training plan';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Training Plan</DialogTitle>
          <DialogDescription>
            Assign a training plan to {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>

        {loadingPlans ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="planId">Training Plan {plans.length > 0 && '(Optional)'}</Label>
              <Select
                value={selectedPlanId}
                onValueChange={(value) => {
                  setSelectedPlanId(value);
                  form.setValue('planId', value);
                  const plan = plans.find((p) => p.id === value);
                  if (plan) {
                    form.setValue('planName', plan.name);
                    if (plan.sessionsPerWeek) {
                      form.setValue('sessionsPerWeek', plan.sessionsPerWeek.toString());
                    }
                  }
                }}
              >
                <SelectTrigger id="planId">
                  <SelectValue placeholder="Select a plan or create custom" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.category} - ${plan.price}
                      {plan.durationDays && ` (${plan.durationDays} days)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planName">Plan Name *</Label>
              <Input
                id="planName"
                {...form.register('planName')}
                placeholder="Enter custom plan name or select from dropdown"
              />
              {form.formState.errors.planName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.planName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trainerId">Trainer ID (Optional)</Label>
                <Input
                  id="trainerId"
                  {...form.register('trainerId')}
                  placeholder="Trainer ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainerName">Trainer Name (Optional)</Label>
                <Input
                  id="trainerName"
                  {...form.register('trainerName')}
                  placeholder="Trainer Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
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
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...form.register('endDate')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionsPerWeek">Sessions Per Week (Optional)</Label>
              <Input
                id="sessionsPerWeek"
                type="number"
                min="1"
                max="7"
                {...form.register('sessionsPerWeek')}
                placeholder="e.g., 3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Additional notes about the training plan"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Dumbbell className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Assigning...' : 'Assign Training'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

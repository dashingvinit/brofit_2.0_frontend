import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
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
import { membershipPlansApi } from '@/features/plans/api/membership-plans-api';
import type { User, MembershipPlan } from '@/shared/types/common.types';
import { LoadingSpinner } from '@/shared/components/loading-spinner';
import { toast } from 'sonner';

const assignMembershipSchema = z.object({
  planId: z.string().min(1, 'Please select a membership plan'),
  startDate: z.string().min(1, 'Start date is required'),
  amountPaid: z.string().optional(),
  paymentReference: z.string().optional(),
});

type AssignMembershipFormData = z.infer<typeof assignMembershipSchema>;

interface AssignMembershipDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AssignMembershipDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: AssignMembershipDialogProps) {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssignMembershipFormData>({
    resolver: zodResolver(assignMembershipSchema),
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await membershipPlansApi.getActivePlans();
        setPlans(response.data);
      } catch (error) {
        console.error('Failed to fetch membership plans:', error);
        toast.error('Failed to load membership plans');
      } finally {
        setLoadingPlans(false);
      }
    };

    if (open) {
      fetchPlans();
    }
  }, [open]);

  const calculateEndDate = (startDate: Date, durationDays: number): Date => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  };

  const onSubmit = async (data: AssignMembershipFormData) => {
    try {
      setIsSubmitting(true);

      const selectedPlan = plans.find((p) => p.id === data.planId);
      if (!selectedPlan) {
        toast.error('Selected plan not found');
        return;
      }

      const startDate = new Date(data.startDate);
      const endDate = calculateEndDate(startDate, selectedPlan.durationDays);

      await membershipPlansApi.addMembershipToUser(user.id, {
        planId: data.planId,
        planName: selectedPlan.name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
        amountPaid: data.amountPaid ? parseFloat(data.amountPaid) : undefined,
        paymentReference: data.paymentReference,
      });

      toast.success('Membership assigned successfully!');
      onSuccess?.();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Failed to assign membership:', error);
      const message = error.response?.data?.message || 'Failed to assign membership';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Membership</DialogTitle>
          <DialogDescription>
            Assign a membership plan to {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>

        {loadingPlans ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">
              No active membership plans available. Please create plans first.
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="planId">Membership Plan *</Label>
              <Select
                value={selectedPlanId}
                onValueChange={(value) => {
                  setSelectedPlanId(value);
                  form.setValue('planId', value);
                  const plan = plans.find((p) => p.id === value);
                  if (plan) {
                    form.setValue('amountPaid', plan.price.toString());
                  }
                }}
              >
                <SelectTrigger id="planId">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ${plan.price} ({plan.durationDays} days)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.planId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.planId.message}
                </p>
              )}
            </div>

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
              <Label htmlFor="amountPaid">Amount Paid (Optional)</Label>
              <Input
                id="amountPaid"
                type="number"
                step="0.01"
                {...form.register('amountPaid')}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentReference">Payment Reference (Optional)</Label>
              <Input
                id="paymentReference"
                {...form.register('paymentReference')}
                placeholder="Transaction ID or reference number"
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
                <Plus className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Assigning...' : 'Assign Membership'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

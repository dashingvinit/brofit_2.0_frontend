import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useCreatePlanType, useUpdatePlanType } from '../hooks/use-plan-types';
import type { PlanType } from '@/shared/types/common.types';

const planTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type PlanTypeFormData = z.infer<typeof planTypeSchema>;

interface PlanTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType?: PlanType | null;
}

export function PlanTypeDialog({ open, onOpenChange, planType }: PlanTypeDialogProps) {
  const isEditing = !!planType;
  const createMutation = useCreatePlanType();
  const updateMutation = useUpdatePlanType();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PlanTypeFormData>({
    resolver: zodResolver(planTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  // Reset form when dialog opens/closes or planType changes
  useEffect(() => {
    if (open) {
      if (planType) {
        reset({
          name: planType.name,
          description: planType.description || '',
          isActive: planType.isActive,
        });
      } else {
        reset({
          name: '',
          description: '',
          isActive: true,
        });
      }
    }
  }, [open, planType, reset]);

  const onSubmit = async (data: PlanTypeFormData) => {
    try {
      if (isEditing && planType) {
        await updateMutation.mutateAsync({
          id: planType.id,
          data: {
            name: data.name,
            description: data.description || undefined,
            isActive: data.isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          description: data.description || undefined,
          isActive: data.isActive,
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Plan Type' : 'Create Plan Type'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the plan type details below.'
              : 'Add a new plan type category (e.g., Cardio, Strength, Yoga).'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Cardio, Strength Training, Yoga"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this plan type..."
              rows={3}
              {...register('description')}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked as boolean)}
            />
            <Label
              htmlFor="isActive"
              className="text-sm font-normal cursor-pointer"
            >
              Active (visible to members)
            </Label>
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
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

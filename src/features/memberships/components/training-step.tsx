import { Loader2 } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { PlanTypePicker } from '@/shared/components/plan-type-picker';
import { PlanVariantPicker } from '@/shared/components/plan-variant-picker';
import type { Member, PlanType, PlanVariant, Trainer } from '@/shared/types/common.types';
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';

interface TrainingStepProps {
  selectedMember: Member | undefined;
  trainers: Trainer[];
  trainersLoading: boolean;
  trainingPlanTypes: PlanType[] | undefined;
  trainingPlanTypesLoading: boolean;
  trainingPlanVariants: PlanVariant[] | undefined;
  trainingVariantsLoading: boolean;
  trainingPlanTypeId: string;
  trainingPlanVariantId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: UseFormWatch<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  errors?: Record<string, { message?: string }>;
}

export function TrainingStep({
  selectedMember,
  trainers,
  trainersLoading,
  trainingPlanTypes,
  trainingPlanTypesLoading,
  trainingPlanVariants,
  trainingVariantsLoading,
  trainingPlanTypeId,
  trainingPlanVariantId,
  register,
  watch,
  setValue,
  errors = {},
}: TrainingStepProps) {
  const activeTrainers = trainers.filter((t) => t.isActive);

  return (
    <div className="space-y-6 px-6 pb-6">
      <div>
        <h3 className="text-lg font-semibold">Training Plan</h3>
        <p className="text-sm text-muted-foreground">
          Select a training plan and assign a trainer for{' '}
          <span className="font-medium text-foreground">
            {selectedMember?.firstName} {selectedMember?.lastName}
          </span>
          .
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="trainerId">Trainer *</Label>
        {trainersLoading ? (
          <div className="flex items-center gap-2 h-10">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading trainers...</span>
          </div>
        ) : (
          <Select
            value={watch('trainerId') || ''}
            onValueChange={(value) => setValue('trainerId', value)}
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
        {errors.trainerId && (
          <p className="text-sm text-destructive">{errors.trainerId.message}</p>
        )}
      </div>

      <PlanTypePicker
        planTypes={trainingPlanTypes}
        isLoading={trainingPlanTypesLoading}
        selectedPlanTypeId={trainingPlanTypeId}
        onSelect={(id) => {
          setValue('trainingPlanTypeId', id);
          setValue('trainingPlanVariantId', '');
        }}
        emptyMessage="No training plan types available. Please create a training plan type first."
      />

      {trainingPlanTypeId && (
        <PlanVariantPicker
          variants={trainingPlanVariants}
          isLoading={trainingVariantsLoading}
          selectedVariantId={trainingPlanVariantId}
          onSelect={(id) => setValue('trainingPlanVariantId', id)}
        />
      )}

      <div className="space-y-2">
        <Label htmlFor="trainingNotes">Training Notes</Label>
        <Textarea
          id="trainingNotes"
          {...register('trainingNotes')}
          placeholder="Any additional notes about this training..."
          rows={2}
        />
      </div>
    </div>
  );
}

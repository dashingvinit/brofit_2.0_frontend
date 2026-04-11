import { Loader2, IndianRupee } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
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
  const selectedTrainerId = watch('trainerId');
  const selectedTrainer = activeTrainers.find((t) => t.id === selectedTrainerId);
  const selectedVariant = trainingPlanVariants?.find((v) => v.id === trainingPlanVariantId);
  const trainerFixedPayout = watch('trainerFixedPayout');

  // Show suggested payout based on variant default or trainer split
  const suggestedPayout = selectedVariant && selectedTrainer
    ? selectedVariant.defaultTrainerFixedPayout != null
      ? selectedVariant.defaultTrainerFixedPayout
      : Math.round(selectedVariant.price * ((selectedVariant.defaultTrainerSplitPercent ?? selectedTrainer.splitPercent ?? 60) / 100))
    : null;

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

      {/* Trainer Fixed Payout */}
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
              placeholder={suggestedPayout != null ? `Suggested: ₹${suggestedPayout.toLocaleString()}` : 'Leave empty for default split'}
              value={trainerFixedPayout ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setValue('trainerFixedPayout', val === '' ? null : Number(val));
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Override the trainer's payout for this combo. Leave empty to use the default {selectedTrainer.splitPercent ?? 60}% split.
          </p>
        </div>
      )}

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

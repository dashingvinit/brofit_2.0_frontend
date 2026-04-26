import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import { Loader2, IndianRupee } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { PlanVariant, Trainer } from '@/shared/types/common.types';
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';

interface MembershipDetailsStepProps {
  selectedVariant: PlanVariant | undefined;
  endDate: string | null;
  addTraining?: boolean;
  onToggleTraining?: (checked: boolean) => void;
  mode?: 'membership' | 'training';
  trainers?: Trainer[];
  trainersLoading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: UseFormWatch<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  errors?: Record<string, { message?: string }>;
}

export function MembershipDetailsStep({
  selectedVariant,
  endDate,
  addTraining = false,
  onToggleTraining,
  mode = 'membership',
  trainers = [],
  trainersLoading = false,
  register,
  watch,
  setValue,
  errors = {},
}: MembershipDetailsStepProps) {
  const activeTrainers = trainers.filter((t) => t.isActive);
  const selectedTrainerId = watch('trainerId');
  const selectedTrainer = activeTrainers.find((t) => t.id === selectedTrainerId);
  const trainerFixedPayout = watch('trainerFixedPayout');
  const variantPrice = selectedVariant?.price ?? 0;
  
  const suggestedPayout = selectedVariant && selectedTrainer
    ? selectedVariant.defaultTrainerFixedPayout != null
      ? selectedVariant.defaultTrainerFixedPayout
      : Math.round(variantPrice * ((selectedVariant.defaultTrainerSplitPercent ?? selectedTrainer.splitPercent ?? 60) / 100))
    : null;

  return (
    <div className="space-y-6 px-6 pb-6">
      <div>
        <h3 className="text-lg font-semibold">
          {mode === 'membership' ? 'Membership Details' : 'Training Details'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {mode === 'membership' 
            ? 'Set the start date and any additional options.' 
            : 'Set the start date, trainer, and payout details.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
            aria-invalid={!!errors.startDate}
            aria-describedby={errors.startDate ? 'startDate-error' : undefined}
          />
          {errors.startDate && (
            <p id="startDate-error" className="text-sm text-destructive">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Input type="date" value={endDate || ''} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">
            Auto-calculated from plan duration ({selectedVariant?.durationDays} days)
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="autoRenew"
          checked={watch('autoRenew')}
          onCheckedChange={(checked) => setValue('autoRenew', checked === true)}
        />
        <Label htmlFor="autoRenew" className="text-sm font-normal">
          Auto-renew membership when it expires
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Any additional notes about this membership..."
          rows={3}
        />
      </div>

      <Separator />

      {mode === 'training' ? (
        <div className="space-y-6">
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
                {trainerFixedPayout != null && trainerFixedPayout !== ('' as unknown as number)
                  ? 'Negotiated fixed amount — gym absorbs any remaining discount.'
                  : `Leave empty to use the default ${selectedTrainer.splitPercent ?? 60}% split on the plan price (₹${variantPrice.toLocaleString()}). Discounts are absorbed by the gym.`}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="addTraining" className="text-sm font-medium">
              Also assign training
            </Label>
            <p className="text-xs text-muted-foreground">
              Optionally assign a personal training plan along with this membership.
            </p>
          </div>
          <Switch id="addTraining" checked={addTraining} onCheckedChange={onToggleTraining!} />
        </div>
      )}
    </div>
  );
}

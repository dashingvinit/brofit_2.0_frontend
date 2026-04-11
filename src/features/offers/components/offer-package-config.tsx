import { useEffect } from 'react';
import { IndianRupee } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { PlanTypePicker } from '@/shared/components/plan-type-picker';
import { PlanVariantPicker } from '@/shared/components/plan-variant-picker';
import { usePlanTypesByCategory } from '@/features/plans/hooks/use-plan-types';
import { usePlanVariantsByType } from '@/features/plans/hooks/use-plan-variants';
import type { OfferAppliesTo, PlanVariant } from '@/shared/types/common.types';
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';

interface OfferPackageConfigProps {
  appliesTo: OfferAppliesTo;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: UseFormWatch<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
}

export function OfferPackageConfig({ appliesTo, register, watch, setValue }: OfferPackageConfigProps) {
  const showMembership = appliesTo === 'membership' || appliesTo === 'both';
  const showTraining = appliesTo === 'training' || appliesTo === 'both';

  // Plan type/variant state
  const membershipPlanTypeId = watch('membershipPlanTypeId') || '';
  const trainingPlanTypeId = watch('trainingPlanTypeId') || '';
  const membershipPlanVariantId = watch('membershipPlanVariantId') || '';
  const trainingPlanVariantId = watch('trainingPlanVariantId') || '';
  const targetPrice = watch('targetPrice');
  const trainerPayoutMode = watch('trainerPayoutMode') || 'default';

  // Fetch plan types by category
  const { data: membershipPlanTypes } = usePlanTypesByCategory('membership');
  const { data: trainingPlanTypes } = usePlanTypesByCategory('training');

  // Fetch variants for selected plan types
  const { data: membershipVariants, isLoading: mVariantsLoading } = usePlanVariantsByType(
    membershipPlanTypeId,
    false,
  );
  const { data: trainingVariants, isLoading: tVariantsLoading } = usePlanVariantsByType(
    trainingPlanTypeId,
    false,
  );

  // Reset variant when plan type changes
  useEffect(() => {
    setValue('membershipPlanVariantId', '');
  }, [membershipPlanTypeId, setValue]);

  useEffect(() => {
    setValue('trainingPlanVariantId', '');
  }, [trainingPlanTypeId, setValue]);

  // Compute regular total for reference
  const selectedMembershipVariant = membershipVariants?.find(
    (v: PlanVariant) => v.id === membershipPlanVariantId,
  );
  const selectedTrainingVariant = trainingVariants?.find(
    (v: PlanVariant) => v.id === trainingPlanVariantId,
  );
  const regularTotal =
    (selectedMembershipVariant?.price ?? 0) + (selectedTrainingVariant?.price ?? 0);

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <p className="text-sm font-medium">Package Configuration</p>

      {/* Target Gender */}
      <div className="space-y-2">
        <Label htmlFor="targetGender">Target Gender</Label>
        <Select
          value={watch('targetGender') || 'any'}
          onValueChange={(v) => setValue('targetGender', v === 'any' ? null : v)}
        >
          <SelectTrigger id="targetGender">
            <SelectValue placeholder="Any gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any gender</SelectItem>
            <SelectItem value="Male">Male only</SelectItem>
            <SelectItem value="Female">Female only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Linked Membership Plan */}
      {showMembership && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Linked Membership Plan
            </Label>
            <PlanTypePicker
              planTypes={membershipPlanTypes}
              isLoading={false}
              selectedPlanTypeId={membershipPlanTypeId}
              onSelect={(id) => setValue('membershipPlanTypeId', id)}
            />
            {membershipPlanTypeId && (
              <PlanVariantPicker
                variants={membershipVariants}
                isLoading={mVariantsLoading}
                selectedVariantId={membershipPlanVariantId}
                onSelect={(id) => setValue('membershipPlanVariantId', id)}
              />
            )}
          </div>
        </>
      )}

      {/* Linked Training Plan */}
      {showTraining && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Linked Training Plan
            </Label>
            <PlanTypePicker
              planTypes={trainingPlanTypes}
              isLoading={false}
              selectedPlanTypeId={trainingPlanTypeId}
              onSelect={(id) => setValue('trainingPlanTypeId', id)}
            />
            {trainingPlanTypeId && (
              <PlanVariantPicker
                variants={trainingVariants}
                isLoading={tVariantsLoading}
                selectedVariantId={trainingPlanVariantId}
                onSelect={(id) => setValue('trainingPlanVariantId', id)}
              />
            )}
          </div>
        </>
      )}

      {/* Target Price */}
      {(selectedMembershipVariant || selectedTrainingVariant) && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="targetPrice">Target Total Price</Label>
            <div className="relative">
              <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="targetPrice"
                type="number"
                min={0}
                step={1}
                placeholder="e.g., 3000"
                className="pl-8"
                {...register('targetPrice')}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Regular price: ₹{regularTotal.toLocaleString()}.
              {targetPrice
                ? ` Discount: ₹${Math.max(0, regularTotal - Number(targetPrice)).toLocaleString()}`
                : ' Set a target to auto-calculate the discount.'}
            </p>
          </div>
        </>
      )}

      {/* Trainer Payout Override */}
      {showTraining && selectedTrainingVariant && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label>Trainer Payout Override</Label>
            <Select
              value={trainerPayoutMode}
              onValueChange={(v) => {
                setValue('trainerPayoutMode', v);
                if (v === 'default') {
                  setValue('trainerFixedPayout', null);
                  setValue('trainerSplitPercent', null);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Use trainer's default split</SelectItem>
                <SelectItem value="fixed">Fixed amount (₹)</SelectItem>
                <SelectItem value="split">Custom split (%)</SelectItem>
              </SelectContent>
            </Select>

            {trainerPayoutMode === 'fixed' && (
              <div className="relative">
                <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="e.g., 1200"
                  className="pl-8"
                  {...register('trainerFixedPayout')}
                />
              </div>
            )}
            {trainerPayoutMode === 'split' && (
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="e.g., 40"
                {...register('trainerSplitPercent')}
              />
            )}
            <p className="text-xs text-muted-foreground">
              Overrides the trainer's default payout for enrollments using this offer.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

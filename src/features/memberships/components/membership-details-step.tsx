import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import type { PlanVariant } from '@/shared/types/common.types';
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';

interface MembershipDetailsStepProps {
  selectedVariant: PlanVariant | undefined;
  endDate: string | null;
  addTraining: boolean;
  onToggleTraining: (checked: boolean) => void;
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
  addTraining,
  onToggleTraining,
  register,
  watch,
  setValue,
  errors = {},
}: MembershipDetailsStepProps) {
  return (
    <div className="space-y-6 px-6 pb-6">
      <div>
        <h3 className="text-lg font-semibold">Membership Details</h3>
        <p className="text-sm text-muted-foreground">
          Set the start date and any additional options.
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

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="addTraining" className="text-sm font-medium">
            Also assign training
          </Label>
          <p className="text-xs text-muted-foreground">
            Optionally assign a personal training plan along with this membership.
          </p>
        </div>
        <Switch id="addTraining" checked={addTraining} onCheckedChange={onToggleTraining} />
      </div>
    </div>
  );
}

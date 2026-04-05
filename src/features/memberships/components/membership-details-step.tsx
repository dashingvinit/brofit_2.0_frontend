import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { DiscountInput } from '@/shared/components/discount-input';
import type { Offer, PlanVariant } from '@/shared/types/common.types';
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';

interface MembershipDetailsStepProps {
  selectedVariant: PlanVariant | undefined;
  endDate: string | null;
  discountAmount: number;
  discountPercentage: number | '';
  onPercentageChange: (value: number | '') => void;
  discountOffers: Offer[];
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
  discountAmount,
  discountPercentage,
  onPercentageChange,
  discountOffers,
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
          Configure start date, discount, and other options.
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

      {discountOffers.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="offerId">Apply Offer (optional)</Label>
          <Select
            value={watch('offerId') || 'none'}
            onValueChange={(v) => {
              const realVal = v === 'none' ? '' : v;
              setValue('offerId', realVal);
              if (realVal && selectedVariant) {
                const offer = discountOffers.find((o) => o.id === realVal);
                if (offer && offer.discountValue !== null && offer.discountValue !== undefined) {
                  const computed =
                    offer.discountType === 'percentage'
                      ? Math.round((offer.discountValue / 100) * selectedVariant.price)
                      : offer.discountValue;
                  setValue('discountAmount', Math.min(computed, selectedVariant.price));
                  onPercentageChange('');
                }
              } else if (!realVal) {
                setValue('discountAmount', 0);
                onPercentageChange('');
              }
            }}
          >
            <SelectTrigger id="offerId">
              <SelectValue placeholder="No offer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No offer</SelectItem>
              {discountOffers.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.title}
                  {o.discountType === 'percentage'
                    ? ` — ${o.discountValue}% off`
                    : ` — ₹${o.discountValue} off`}
                  {o.code ? ` (${o.code})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <DiscountInput
        price={selectedVariant?.price}
        discountAmount={discountAmount}
        discountPercentage={discountPercentage}
        onPercentageChange={onPercentageChange}
        register={register}
        fieldName="discountAmount"
        onAmountChange={() => onPercentageChange('')}
        error={errors.discountAmount?.message}
      />

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

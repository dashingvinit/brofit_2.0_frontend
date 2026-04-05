import { IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import type { UseFormRegister } from 'react-hook-form';

const DISCOUNT_PRESETS = [5, 10, 15, 20, 25, 50];

interface DiscountInputProps {
  label?: string;
  price: number | undefined;
  discountAmount: number;
  discountPercentage: number | '';
  onPercentageChange: (value: number | '') => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  fieldName: string;
  onAmountChange?: () => void;
  error?: string;
}

export function DiscountInput({
  label = 'Discount',
  price,
  discountAmount,
  discountPercentage,
  onPercentageChange,
  register,
  fieldName,
  onAmountChange,
  error,
}: DiscountInputProps) {
  const finalPrice = price !== undefined ? Math.max(0, price - discountAmount) : undefined;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Preset percentage chips */}
      <div className="flex flex-wrap gap-2">
        {DISCOUNT_PRESETS.map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => onPercentageChange(discountPercentage === pct ? '' : pct)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              discountPercentage === pct
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {pct}%
          </button>
        ))}
      </div>

      {/* Custom % + fixed amount row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Custom %</p>
          <div className="relative">
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="0"
              value={discountPercentage}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Math.min(100, Math.max(0, Number(e.target.value)));
                onPercentageChange(val);
              }}
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Amount (₹)</p>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="number"
              min={0}
              max={price ?? 0}
              className="pl-9"
              {...register(fieldName, { onChange: onAmountChange })}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Price summary */}
      {price !== undefined && finalPrice !== undefined && (
        <Card className="bg-muted/50">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price</span>
              <span>
                <IndianRupee className="inline h-3 w-3" />
                {price.toLocaleString()}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>
                  - <IndianRupee className="inline h-3 w-3" />
                  {discountAmount.toLocaleString()}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Final Price</span>
              <span>
                <IndianRupee className="inline h-3.5 w-3.5" />
                {finalPrice.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

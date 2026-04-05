import { Check, IndianRupee, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import type { PlanVariant } from '@/shared/types/common.types';

interface PlanVariantPickerProps {
  variants: PlanVariant[] | undefined;
  isLoading: boolean;
  selectedVariantId: string;
  onSelect: (variantId: string) => void;
  error?: string;
}

export function PlanVariantPicker({
  variants,
  isLoading,
  selectedVariantId,
  onSelect,
  error,
}: PlanVariantPickerProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Duration & Pricing</Label>
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : variants && variants.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {variants.map((variant) => (
            <Card
              key={variant.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selectedVariantId === variant.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : ''
              }`}
              onClick={() => onSelect(variant.id)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{variant.durationLabel}</p>
                  <p className="text-xs text-muted-foreground">{variant.durationDays} days</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    <IndianRupee className="inline h-4 w-4" />
                    {variant.price.toLocaleString()}
                  </span>
                  {selectedVariantId === variant.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No active variants available for this plan type.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

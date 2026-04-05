import { Check, Dumbbell, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import type { PlanType } from '@/shared/types/common.types';

interface PlanTypePickerProps {
  planTypes: PlanType[] | undefined;
  isLoading: boolean;
  selectedPlanTypeId: string;
  onSelect: (planTypeId: string) => void;
  error?: string;
  emptyMessage?: string;
}

export function PlanTypePicker({
  planTypes,
  isLoading,
  selectedPlanTypeId,
  onSelect,
  error,
  emptyMessage = 'No plan types available.',
}: PlanTypePickerProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Plan Type</Label>
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : planTypes && planTypes.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {planTypes.map((planType) => (
            <Card
              key={planType.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selectedPlanTypeId === planType.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : ''
              }`}
              onClick={() => onSelect(planType.id)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{planType.name}</p>
                  {planType.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {planType.description}
                    </p>
                  )}
                </div>
                {selectedPlanTypeId === planType.id && (
                  <Check className="h-5 w-5 text-primary shrink-0" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

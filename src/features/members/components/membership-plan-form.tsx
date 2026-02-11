import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useCreateMembershipPlan } from '../hooks/use-membership-plan-management';

const planFormSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  durationDays: z.string().min(1, 'Duration is required'),
  price: z.string().min(1, 'Price is required'),
  features: z.array(z.string()).optional(),
});

type PlanFormData = z.infer<typeof planFormSchema>;

interface MembershipPlanFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MembershipPlanForm({ onSuccess, onCancel }: MembershipPlanFormProps) {
  const createPlan = useCreateMembershipPlan();
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
  });

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const onSubmit = (data: PlanFormData) => {
    createPlan.mutate(
      {
        name: data.name,
        description: data.description,
        durationDays: parseInt(data.durationDays),
        price: parseFloat(data.price),
        features: features,
      },
      {
        onSuccess: () => {
          reset();
          setFeatures([]);
          setFeatureInput('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Plan Details</h3>

        <div className="space-y-2">
          <Label htmlFor="name">Plan Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g., Monthly Membership"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Brief description of the plan"
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="durationDays">Duration (Days) *</Label>
            <Input
              id="durationDays"
              type="number"
              {...register('durationDays')}
              placeholder="30"
            />
            {errors.durationDays && (
              <p className="text-sm text-destructive">{errors.durationDays.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Suggested: 30 (monthly), 90 (quarterly), 365 (annual)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register('price')}
              placeholder="50.00"
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="feature">Features</Label>
          <div className="flex gap-2">
            <Input
              id="feature"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="Add a feature (e.g., Access to all equipment)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFeature();
                }
              }}
            />
            <Button type="button" onClick={addFeature} variant="outline">
              Add
            </Button>
          </div>
          {features.length > 0 && (
            <div className="mt-2 space-y-2">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-muted p-2 rounded"
                >
                  <span className="text-sm">{feature}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={createPlan.isPending}
          className="flex-1 md:flex-initial"
        >
          {createPlan.isPending ? 'Creating...' : 'Create Plan'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createPlan.isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

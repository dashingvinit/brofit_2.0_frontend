import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Calendar, DollarSign, ArrowLeft, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { LoadingSpinner } from '@/shared/components/loading-spinner';
import {
  usePlanVariantsByType,
  useDeletePlanVariant,
  useCreatePlanVariant,
  useUpdatePlanVariant,
} from '../hooks/use-plan-variants';
import type { PlanType, PlanVariant } from '@/shared/types/common.types';

const variantSchema = z.object({
  durationDays: z.coerce
    .number()
    .min(1, 'Duration must be at least 1 day')
    .max(3650, 'Duration cannot exceed 10 years'),
  durationLabel: z.string().min(1, 'Duration label is required').max(50, 'Label is too long'),
  price: z.coerce
    .number()
    .min(0, 'Price cannot be negative')
    .max(1000000, 'Price is too high'),
  isActive: z.boolean().default(true),
});

type VariantFormData = z.infer<typeof variantSchema>;

type ViewMode = 'list' | 'create' | 'edit';

interface PlanVariantsSheetProps {
  planType: PlanType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanVariantsSheet({ planType, open, onOpenChange }: PlanVariantsSheetProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingVariant, setEditingVariant] = useState<PlanVariant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<PlanVariant | null>(null);

  const { data: variants, isLoading } = usePlanVariantsByType(planType?.id || '', true);
  const deleteMutation = useDeletePlanVariant();
  const createMutation = useCreatePlanVariant();
  const updateMutation = useUpdatePlanVariant();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      durationDays: 30,
      durationLabel: '',
      price: 0,
      isActive: true,
    },
  });

  const isActive = watch('isActive');

  // Reset form when switching modes or variant changes
  useEffect(() => {
    if (viewMode === 'create') {
      reset({
        durationDays: 30,
        durationLabel: '',
        price: 0,
        isActive: true,
      });
    } else if (viewMode === 'edit' && editingVariant) {
      reset({
        durationDays: editingVariant.durationDays,
        durationLabel: editingVariant.durationLabel,
        price: editingVariant.price,
        isActive: editingVariant.isActive,
      });
    }
  }, [viewMode, editingVariant, reset]);

  // Reset to list view when sheet closes
  useEffect(() => {
    if (!open) {
      setViewMode('list');
      setEditingVariant(null);
    }
  }, [open]);

  const handleEdit = (variant: PlanVariant) => {
    setEditingVariant(variant);
    setViewMode('edit');
  };

  const handleDelete = (variant: PlanVariant) => {
    setVariantToDelete(variant);
    setDeleteDialogOpen(true);
  };

  const handleCancelForm = () => {
    setViewMode('list');
    setEditingVariant(null);
    reset();
  };

  const onSubmit = async (data: VariantFormData) => {
    if (!planType) return;

    try {
      if (viewMode === 'edit' && editingVariant) {
        await updateMutation.mutateAsync({
          id: editingVariant.id,
          data: {
            durationDays: data.durationDays,
            durationLabel: data.durationLabel,
            price: data.price,
            isActive: data.isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          planTypeId: planType.id,
          data: {
            durationDays: data.durationDays,
            durationLabel: data.durationLabel,
            price: data.price,
            isActive: data.isActive,
          },
        });
      }
      handleCancelForm();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const confirmDelete = () => {
    if (variantToDelete) {
      deleteMutation.mutate(variantToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setVariantToDelete(null);
        },
      });
    }
  };

  if (!planType) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-2">
              {viewMode !== 'list' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelForm}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex-1">
                <SheetTitle>
                  {viewMode === 'list' && 'Manage Pricing Variants'}
                  {viewMode === 'create' && 'Add New Variant'}
                  {viewMode === 'edit' && 'Edit Variant'}
                </SheetTitle>
                <SheetDescription>
                  {planType.name}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6">
            {viewMode === 'list' ? (
              <div className="space-y-4">
                <Button onClick={() => setViewMode('create')} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>

                <Separator />

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : variants && variants.length > 0 ? (
                  <div className="space-y-3">
                    {variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{variant.durationLabel}</h4>
                            <Badge
                              variant={variant.isActive ? 'default' : 'secondary'}
                              className="mt-1"
                            >
                              {variant.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(variant)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(variant)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="text-sm font-medium">{variant.durationDays} days</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Price</p>
                              <p className="text-sm font-medium">${variant.price}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No variants yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add pricing variants to offer different durations and prices
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="durationLabel">
                    Duration Label <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="durationLabel"
                    placeholder="e.g., 1 Month, 3 Months, 1 Year"
                    {...register('durationLabel')}
                    className={errors.durationLabel ? 'border-destructive' : ''}
                  />
                  {errors.durationLabel && (
                    <p className="text-sm text-destructive">{errors.durationLabel.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This is what members will see (e.g., "1 Month", "3 Months")
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="durationDays">
                      Duration (days) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="durationDays"
                      type="number"
                      placeholder="30"
                      {...register('durationDays')}
                      className={errors.durationDays ? 'border-destructive' : ''}
                    />
                    {errors.durationDays && (
                      <p className="text-sm text-destructive">{errors.durationDays.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Price <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('price')}
                      className={errors.price ? 'border-destructive' : ''}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(checked) => setValue('isActive', checked as boolean)}
                  />
                  <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                    Active (visible to members)
                  </Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelForm}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? 'Saving...' : viewMode === 'edit' ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{variantToDelete?.durationLabel}" variant for{' '}
              {planType.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

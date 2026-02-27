import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useCreatePlanType, useUpdatePlanType } from "../hooks/use-plan-types";
import type { PlanType, PlanCategory } from "@/shared/types/common.types";

const planTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().optional(),
  category: z.enum(["membership", "training"]),
  isActive: z.boolean().default(true),
});

type PlanTypeFormData = z.infer<typeof planTypeSchema>;

interface PlanTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType?: PlanType | null;
}

export function PlanTypeDialog({
  open,
  onOpenChange,
  planType,
}: PlanTypeDialogProps) {
  const isEditing = !!planType;
  const createMutation = useCreatePlanType();
  const updateMutation = useUpdatePlanType();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PlanTypeFormData>({
    resolver: zodResolver(planTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "membership",
      isActive: true,
    },
  });

  const isActive = watch("isActive");
  const category = watch("category");

  // Reset form when dialog opens/closes or planType changes
  useEffect(() => {
    if (open) {
      if (planType) {
        reset({
          name: planType.name,
          description: planType.description || "",
          category: planType.category,
          isActive: planType.isActive,
        });
      } else {
        reset({
          name: "",
          description: "",
          category: "membership",
          isActive: true,
        });
      }
    }
  }, [open, planType, reset]);

  const onSubmit = async (data: PlanTypeFormData) => {
    try {
      if (isEditing && planType) {
        await updateMutation.mutateAsync({
          id: planType.id,
          data: {
            name: data.name,
            description: data.description || undefined,
            category: data.category,
            isActive: data.isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          description: data.description || undefined,
          category: data.category,
          isActive: data.isActive,
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Plan Type" : "Create Plan Type"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the plan type details below."
              : `Add a new ${category === "training" ? "training" : "membership"} plan type.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Cardio, Strength Training, Yoga"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={(value) => setValue("category", value as PlanCategory)}>
              <SelectTrigger id="category" className={errors.category ? "border-destructive" : ""}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="membership">Membership</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this plan type..."
              rows={3}
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue("isActive", checked as boolean)
              }
            />
            <Label
              htmlFor="isActive"
              className="text-sm font-normal cursor-pointer"
            >
              Active (visible to members)
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

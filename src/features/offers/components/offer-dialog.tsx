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
import { useCreateOffer, useUpdateOffer } from "../hooks/use-offers";
import type { Offer, OfferType, DiscountType } from "@/shared/types/common.types";

const offerSchema = z
  .object({
    type: z.enum(["event", "referral", "discount", "promo"]),
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().default(true),
    discountType: z.enum(["flat", "percentage"]).optional(),
    discountValue: z.coerce.number().positive("Must be greater than 0").optional(),
    code: z.string().optional(),
    rewardAmount: z.coerce.number().nonnegative().optional(),
  })
  .refine(
    (data) => {
      if (["discount", "promo"].includes(data.type)) {
        return !!data.discountType && data.discountValue !== undefined;
      }
      return true;
    },
    {
      message: "Discount type and value are required for discount/promo offers",
      path: ["discountValue"],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    { message: "End date must be after start date", path: ["endDate"] }
  );

type OfferFormData = z.infer<typeof offerSchema>;

interface OfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer?: Offer | null;
}

export function OfferDialog({ open, onOpenChange, offer }: OfferDialogProps) {
  const isEditing = !!offer;
  const createMutation = useCreateOffer();
  const updateMutation = useUpdateOffer();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      type: "discount",
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      isActive: true,
      discountType: "percentage",
      discountValue: undefined,
      code: "",
      rewardAmount: undefined,
    },
  });

  const type = watch("type");
  const isActive = watch("isActive");
  const discountType = watch("discountType");
  const showDiscountFields = type === "discount" || type === "promo";
  const showReferralFields = type === "referral";

  useEffect(() => {
    if (open) {
      if (offer) {
        reset({
          type: offer.type,
          title: offer.title,
          description: offer.description || "",
          startDate: offer.startDate ? offer.startDate.slice(0, 10) : "",
          endDate: offer.endDate ? offer.endDate.slice(0, 10) : "",
          isActive: offer.isActive,
          discountType: offer.discountType || "percentage",
          discountValue: offer.discountValue ?? undefined,
          code: offer.code || "",
          rewardAmount: offer.rewardAmount ?? undefined,
        });
      } else {
        reset();
      }
    }
  }, [open, offer, reset]);

  const onSubmit = async (data: OfferFormData) => {
    try {
      const payload = {
        type: data.type as OfferType,
        title: data.title,
        description: data.description || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        isActive: data.isActive,
        discountType: showDiscountFields ? (data.discountType as DiscountType) : undefined,
        discountValue: showDiscountFields ? data.discountValue : undefined,
        code: data.code || undefined,
        rewardAmount: showReferralFields ? data.rewardAmount : undefined,
      };

      if (isEditing && offer) {
        await updateMutation.mutateAsync({ id: offer.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch {
      // handled by mutation hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Offer" : "Create Offer"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the offer details below."
              : "Set up a new offer for your gym members."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">
              Offer Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={type}
              onValueChange={(v) => setValue("type", v as OfferType)}
              disabled={isEditing}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">Discount — % or flat off on memberships/trainings</SelectItem>
                <SelectItem value="promo">Promo — campaign with optional promo code</SelectItem>
                <SelectItem value="event">Event — fitness camp, challenge, etc.</SelectItem>
                <SelectItem value="referral">Referral — refer &amp; earn reward</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder={
                type === "event"
                  ? "e.g., Summer Fitness Camp"
                  : type === "referral"
                  ? "e.g., Refer a Friend"
                  : "e.g., 10% off Annual Memberships"
              }
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this offer..."
              rows={2}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
                className={errors.endDate ? "border-destructive" : ""}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Discount / Promo fields */}
          {showDiscountFields && (
            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">Discount Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="discountType">
                    Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={discountType}
                    onValueChange={(v) => setValue("discountType", v as DiscountType)}
                  >
                    <SelectTrigger id="discountType">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Value <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min={0}
                    max={discountType === "percentage" ? 100 : undefined}
                    step="0.01"
                    placeholder={discountType === "percentage" ? "e.g., 10" : "e.g., 500"}
                    {...register("discountValue")}
                    className={errors.discountValue ? "border-destructive" : ""}
                  />
                  {errors.discountValue && (
                    <p className="text-sm text-destructive">{errors.discountValue.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Promo Code (optional)</Label>
                <Input
                  id="code"
                  placeholder="e.g., SUMMER10"
                  {...register("code")}
                />
              </div>
            </div>
          )}

          {/* Referral fields */}
          {showReferralFields && (
            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">Referral Details</p>
              <div className="space-y-2">
                <Label htmlFor="rewardAmount">Referrer Reward Amount (₹, optional)</Label>
                <Input
                  id="rewardAmount"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="e.g., 500"
                  {...register("rewardAmount")}
                />
                <p className="text-xs text-muted-foreground">
                  Informational — apply manually as a discount when renewing the referrer's membership.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked as boolean)}
            />
            <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
              Active
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
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

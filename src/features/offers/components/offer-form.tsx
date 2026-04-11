import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import { ChevronLeft, ChevronRight, Percent, Gift, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useCreateOffer, useUpdateOffer } from "../hooks/use-offers";
import { OfferDetailsStep } from "./offer-details-step";
import type { Offer, OfferType, DiscountType, OfferAppliesTo } from "@/shared/types/common.types";
import { cn } from "@/shared/lib/utils";

const offerSchema = z
  .object({
    type: z.enum(["event", "referral", "discount", "promo"]),
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().default(true),
    discountMode: z.enum(["amount_off", "target_price"]).default("amount_off"),
    discountType: z.enum(["flat", "percentage"]).optional(),
    discountValue: z.coerce.number().optional(),
    appliesTo: z.enum(["membership", "training", "both"]).default("membership"),
    code: z.string().optional(),
    rewardAmount: z.coerce.number().nonnegative().optional(),
    targetGender: z.string().nullable().optional(),
    planScope: z.enum(["all", "type", "variant"]).default("all"),
    membershipPlanTypeId: z.string().optional(),
    membershipPlanVariantId: z.string().nullable().optional(),
    trainingPlanTypeId: z.string().optional(),
    trainingPlanVariantId: z.string().nullable().optional(),
    targetPrice: z.coerce.number().nullable().optional(),
    trainerPayoutMode: z.enum(["default", "fixed", "split"]).default("default"),
    trainerFixedPayout: z.coerce.number().nonnegative().nullable().optional(),
    trainerSplitPercent: z.coerce.number().min(0).max(100).nullable().optional(),
  })
  .refine(
    (data) => {
      if (!["discount", "promo"].includes(data.type)) return true;
      if (data.discountMode === "target_price") return data.targetPrice != null && data.targetPrice > 0;
      return !!data.discountType && data.discountValue !== undefined && data.discountValue > 0;
    },
    (data) => ({
      message:
        data.discountMode === "target_price"
          ? "Enter a fixed price for this offer"
          : "Enter a discount value before creating this offer",
      path: data.discountMode === "target_price" ? ["targetPrice"] : ["discountValue"],
    })
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate && data.startDate.length > 0 && data.endDate.length > 0) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    { message: "End date must be after start date", path: ["endDate"] }
  );

export type OfferFormData = {
  type: "event" | "referral" | "discount" | "promo";
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  discountMode: "amount_off" | "target_price";
  discountType?: "flat" | "percentage";
  discountValue?: number;
  appliesTo: "membership" | "training" | "both";
  code?: string;
  rewardAmount?: number;
  targetGender?: string | null;
  planScope: "all" | "type" | "variant";
  membershipPlanTypeId?: string;
  membershipPlanVariantId?: string | null;
  trainingPlanTypeId?: string;
  trainingPlanVariantId?: string | null;
  targetPrice?: number | null;
  trainerPayoutMode: "default" | "fixed" | "split";
  trainerFixedPayout?: number | null;
  trainerSplitPercent?: number | null;
};

// ── Type selector config ───────────────────────────────────────────────────────
const OFFER_TYPES: {
  value: "discount" | "promo" | "event" | "referral";
  label: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  selectedBorderClass: string;
  selectedBgClass: string;
}[] = [
  {
    value: "discount",
    label: "Discount",
    description: "% or flat amount off a plan",
    icon: Percent,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/50",
    selectedBorderClass: "border-emerald-500",
    selectedBgClass: "bg-emerald-50/50 dark:bg-emerald-950/30",
  },
  {
    value: "promo",
    label: "Promo",
    description: "Campaign with optional code",
    icon: Gift,
    colorClass: "text-violet-600 dark:text-violet-400",
    bgClass: "bg-violet-50 dark:bg-violet-950/50",
    selectedBorderClass: "border-violet-500",
    selectedBgClass: "bg-violet-50/50 dark:bg-violet-950/30",
  },
  {
    value: "event",
    label: "Event",
    description: "Camp, challenge, or workshop",
    icon: Calendar,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-950/50",
    selectedBorderClass: "border-amber-500",
    selectedBgClass: "bg-amber-50/50 dark:bg-amber-950/30",
  },
  {
    value: "referral",
    label: "Referral",
    description: "Refer a friend & earn reward",
    icon: Users,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-950/50",
    selectedBorderClass: "border-blue-500",
    selectedBgClass: "bg-blue-50/50 dark:bg-blue-950/30",
  },
];

interface OfferFormProps {
  offer?: Offer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OfferForm({ offer, onSuccess, onCancel }: OfferFormProps) {
  const isEditing = !!offer;
  const [step, setStep] = useState(0);
  const createMutation = useCreateOffer();
  const updateMutation = useUpdateOffer();

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema) as Resolver<OfferFormData>,
    defaultValues: {
      type: "discount",
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      isActive: true,
      discountMode: "amount_off",
      discountType: "percentage",
      discountValue: undefined,
      appliesTo: "membership",
      code: "",
      rewardAmount: undefined,
      targetGender: null,
      planScope: "all",
      membershipPlanTypeId: "",
      membershipPlanVariantId: null,
      trainingPlanTypeId: "",
      trainingPlanVariantId: null,
      targetPrice: null,
      trainerPayoutMode: "default",
      trainerFixedPayout: null,
      trainerSplitPercent: null,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  const type = watch("type");
  const isActive = watch("isActive");
  const hasDetailsStep = type !== "event";

  useEffect(() => {
    if (offer) {
      let trainerPayoutMode: "default" | "fixed" | "split" = "default";
      if (offer.trainerFixedPayout != null) trainerPayoutMode = "fixed";
      else if (offer.trainerSplitPercent != null) trainerPayoutMode = "split";

      const hasMembershipVariant = !!offer.membershipPlanVariantId;
      const hasTrainingVariant = !!offer.trainingPlanVariantId;
      const hasMembershipType = !!offer.membershipPlanVariant?.planType?.id;
      const hasTrainingType = !!offer.trainingPlanVariant?.planType?.id;
      const planScope =
        hasMembershipVariant || hasTrainingVariant
          ? "variant"
          : hasMembershipType || hasTrainingType
          ? "type"
          : "all";

      reset({
        type: offer.type,
        title: offer.title,
        description: offer.description || "",
        startDate: offer.startDate ? offer.startDate.slice(0, 10) : "",
        endDate: offer.endDate ? offer.endDate.slice(0, 10) : "",
        isActive: offer.isActive,
        discountMode: offer.targetPrice ? "target_price" : "amount_off",
        discountType: offer.discountType || "percentage",
        discountValue: offer.discountValue ?? undefined,
        appliesTo: offer.appliesTo ?? "membership",
        code: offer.code || "",
        rewardAmount: offer.rewardAmount ?? undefined,
        targetGender: offer.targetGender ?? null,
        planScope,
        membershipPlanTypeId: offer.membershipPlanVariant?.planType?.id || "",
        membershipPlanVariantId: offer.membershipPlanVariantId ?? null,
        trainingPlanTypeId: offer.trainingPlanVariant?.planType?.id || "",
        trainingPlanVariantId: offer.trainingPlanVariantId ?? null,
        targetPrice: offer.targetPrice ?? null,
        trainerPayoutMode,
        trainerFixedPayout: offer.trainerFixedPayout ?? null,
        trainerSplitPercent: offer.trainerSplitPercent ?? null,
      });
    }
  }, [offer, reset]);

  const onSubmit = async (data: OfferFormData) => {
    const showDiscountFields = data.type === "discount" || data.type === "promo";
    const showReferralFields = data.type === "referral";

    const payload = {
      type: data.type as OfferType,
      title: data.title,
      description: data.description || undefined,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      isActive: data.isActive,
      discountType:
        showDiscountFields && data.discountMode === "amount_off"
          ? (data.discountType as DiscountType)
          : undefined,
      discountValue:
        showDiscountFields && data.discountMode === "amount_off"
          ? data.discountValue
          : undefined,
      appliesTo: showDiscountFields ? (data.appliesTo as OfferAppliesTo) : undefined,
      code: data.code || undefined,
      rewardAmount: showReferralFields ? data.rewardAmount : undefined,
      targetGender: showDiscountFields ? (data.targetGender || null) : null,
      membershipPlanVariantId:
        showDiscountFields &&
        data.planScope === "variant" &&
        (data.appliesTo === "membership" || data.appliesTo === "both")
          ? data.membershipPlanVariantId || null
          : null,
      trainingPlanVariantId:
        showDiscountFields &&
        data.planScope === "variant" &&
        (data.appliesTo === "training" || data.appliesTo === "both")
          ? data.trainingPlanVariantId || null
          : null,
      targetPrice:
        showDiscountFields && data.discountMode === "target_price"
          ? (data.targetPrice ?? null)
          : null,
      trainerFixedPayout:
        showDiscountFields &&
        data.trainerPayoutMode === "fixed" &&
        data.trainerFixedPayout != null
          ? Number(data.trainerFixedPayout)
          : null,
      trainerSplitPercent:
        showDiscountFields &&
        data.trainerPayoutMode === "split" &&
        data.trainerSplitPercent != null
          ? Number(data.trainerSplitPercent)
          : null,
    };

    try {
      if (isEditing && offer) {
        await updateMutation.mutateAsync({ id: offer.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess();
    } catch {
      // handled by mutation hooks
    }
  };

  const selectedTypeConfig = OFFER_TYPES.find((t) => t.value === type);

  const [isNavigating, setIsNavigating] = useState(false);

  const handleNext = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    try {
      const valid = await trigger(["type", "title", "startDate", "endDate"]);
      if (!valid) {
        const e = errors;
        if (e.endDate) toast.error(e.endDate.message);
        else if (e.title) toast.error(e.title.message);
        return;
      }
      setStep(1);
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="space-y-4"
    >
      {/* Step indicator */}
      {hasDetailsStep && (
        <div className="flex items-center gap-2">
          {["Basic Info", "Details"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-colors",
                  i === step
                    ? "bg-foreground text-background"
                    : i < step
                    ? "bg-foreground/20 text-foreground cursor-pointer hover:bg-foreground/30"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </button>
              <span
                className={cn(
                  "text-sm",
                  i === step ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              {i < 1 && <div className="w-6 h-px bg-border mx-1" />}
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-4 space-y-5">
          {/* ── Step 0: Basic Info ── */}
          {step === 0 && (
            <>
              {/* Type picker */}
              <div className="space-y-2">
                <Label>
                  Offer Type <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {OFFER_TYPES.map((t) => {
                    const Icon = t.icon;
                    const selected = type === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        disabled={isEditing}
                        onClick={() => setValue("type", t.value)}
                        className={cn(
                          "relative text-left p-3 rounded-xl border-2 transition-all",
                          selected
                            ? cn("border-2", t.selectedBorderClass, t.selectedBgClass)
                            : "border-border hover:border-border/80 hover:bg-muted/40",
                          isEditing && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <div
                          className={cn(
                            "inline-flex p-1.5 rounded-lg mb-2",
                            selected ? t.bgClass : "bg-muted",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-3.5 w-3.5",
                              selected ? t.colorClass : "text-muted-foreground",
                            )}
                          />
                        </div>
                        <div
                          className={cn(
                            "text-sm font-semibold leading-tight",
                            selected ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {t.label}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {t.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {isEditing && (
                  <p className="text-[11px] text-muted-foreground">
                    Offer type cannot be changed after creation.
                  </p>
                )}
              </div>

              {/* Divider with selected type label */}
              {selectedTypeConfig && (
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {selectedTypeConfig.label} details
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
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
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe this offer..."
                  rows={3}
                  {...register("description")}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" {...register("startDate")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                    className={errors.endDate ? "border-destructive" : ""}
                  />
                  {errors.endDate && (
                    <p className="text-xs text-destructive">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-2 py-1">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(v) => setValue("isActive", v as boolean)}
                />
                <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                  Active — offer is live and can be applied
                </Label>
              </div>
            </>
          )}

          {/* ── Step 1: Type-specific details ── */}
          {step === 1 && <OfferDetailsStep form={form} />}
        </CardContent>
      </Card>

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={step === 0 ? onCancel : () => setStep(0)}
        >
          {step === 0 ? (
            "Cancel"
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </>
          )}
        </Button>

        {step === 0 && hasDetailsStep ? (
          <Button type="button" onClick={handleNext} disabled={isNavigating}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit, (errs) => {
              const first = Object.values(errs)[0];
              if (first?.message) toast.error(first.message as string);
            })}
          >
            {isSubmitting ? "Saving..." : isEditing ? "Update Offer" : "Create Offer"}
          </Button>
        )}
      </div>
    </form>
  );
}

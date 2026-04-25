import { useEffect, useRef } from "react";
import { IndianRupee, Percent, ShoppingBag, Dumbbell, Layers } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { PlanTypePicker } from "@/shared/components/plan-type-picker";
import { PlanVariantPicker } from "@/shared/components/plan-variant-picker";
import { usePlanTypesByCategory } from "@/features/plans/hooks/use-plan-types";
import { usePlanVariantsByType } from "@/features/plans/hooks/use-plan-variants";
import type { PlanVariant } from "@/shared/types/common.types";
import type { UseFormReturn } from "react-hook-form";
import type { OfferFormData } from "./offer-form";
import { cn } from "@/shared/lib/utils";

interface OfferDetailsStepProps {
  form: UseFormReturn<OfferFormData>;
}

// ── Segmented control ─────────────────────────────────────────────────────────
function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ElementType }[];
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5">
      {options.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              selected
                ? "bg-background text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon className="h-3 w-3" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Field group ───────────────────────────────────────────────────────────────
function FieldGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 divide-y divide-border">
      {children}
    </div>
  );
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <div className="shrink-0 pt-0.5">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">{hint}</p>}
      </div>
      <div className="flex-1 flex justify-end">{children}</div>
    </div>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useMembershipPicker(planTypeId: string) {
  const { data: planTypes } = usePlanTypesByCategory("membership");
  const { data: variants, isLoading } = usePlanVariantsByType(planTypeId, false);
  return { planTypes, variants, isLoading };
}

function useTrainingPicker(planTypeId: string) {
  const { data: planTypes } = usePlanTypesByCategory("training");
  const { data: variants, isLoading } = usePlanVariantsByType(planTypeId, false);
  return { planTypes, variants, isLoading };
}

// ── Price preview ─────────────────────────────────────────────────────────────
function PricePreview({
  discountMode,
  discountType,
  discountValue,
  targetPrice,
  membershipPrice,
  trainingPrice,
  appliesTo,
}: {
  discountMode: string;
  discountType?: string;
  discountValue?: number;
  targetPrice?: number | null;
  membershipPrice?: number;
  trainingPrice?: number;
  appliesTo: string;
}) {
  const basePrice =
    appliesTo === "both"
      ? (membershipPrice ?? 0) + (trainingPrice ?? 0)
      : appliesTo === "training"
      ? trainingPrice
      : membershipPrice;

  if (discountMode === "amount_off") {
    if (!discountValue) return null;
    const savings =
      basePrice !== undefined
        ? discountType === "percentage"
          ? Math.round(basePrice * (discountValue / 100))
          : discountValue
        : undefined;
    const memberPays =
      basePrice !== undefined && savings !== undefined
        ? Math.max(0, basePrice - savings)
        : undefined;

    return (
      <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3 space-y-2">
        <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
          Price preview
        </p>
        {basePrice !== undefined && basePrice > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Regular price</span>
            <span>₹{basePrice.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Discount</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            −{discountType === "percentage"
              ? `${discountValue}%`
              : `₹${discountValue.toLocaleString()}`}
            {basePrice !== undefined && savings !== undefined
              ? ` (₹${savings.toLocaleString()})`
              : ""}
          </span>
        </div>
        {memberPays !== undefined && (
          <div className="flex justify-between font-semibold border-t border-emerald-200 dark:border-emerald-900 pt-2 text-sm">
            <span>Member pays</span>
            <span>₹{memberPays.toLocaleString()}</span>
          </div>
        )}
        {basePrice === undefined && (
          <p className="text-[11px] text-muted-foreground">
            Select a plan variant above to see the exact amount
          </p>
        )}
      </div>
    );
  }

  if (discountMode === "target_price") {
    if (!targetPrice) return null;
    const savings =
      basePrice !== undefined && basePrice > 0
        ? Math.max(0, basePrice - targetPrice)
        : undefined;

    return (
      <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3 space-y-2">
        <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
          Price preview
        </p>
        {basePrice !== undefined && basePrice > 0 && (
          <>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Regular price</span>
              <span>₹{basePrice.toLocaleString()}</span>
            </div>
            {appliesTo === "both" &&
              membershipPrice !== undefined &&
              trainingPrice !== undefined && (
                <div className="ml-3 space-y-0.5">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>↳ Membership</span>
                    <span>₹{membershipPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>↳ Training</span>
                    <span>₹{trainingPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}
          </>
        )}
        {savings !== undefined && savings > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Member saves</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              ₹{savings.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between font-semibold border-t border-emerald-200 dark:border-emerald-900 pt-2 text-sm">
          <span>Member pays</span>
          <span>₹{targetPrice.toLocaleString()}</span>
        </div>
        {(basePrice === undefined || basePrice === 0) && (
          <p className="text-[11px] text-muted-foreground">
            Select plan variants above to see savings
          </p>
        )}
      </div>
    );
  }

  return null;
}

// ── Main component ────────────────────────────────────────────────────────────
export function OfferDetailsStep({ form }: OfferDetailsStepProps) {
  const { register, setValue, watch, formState: { errors, touchedFields, isSubmitted } } = form;

  const type = watch("type");
  const discountMode = watch("discountMode");
  const discountType = watch("discountType") ?? "percentage";
  const discountValue = watch("discountValue");
  const targetPrice = watch("targetPrice");
  const appliesTo = watch("appliesTo");
  const planScope = watch("planScope");
  const membershipPlanTypeId = watch("membershipPlanTypeId") || "";
  const membershipPlanVariantId = watch("membershipPlanVariantId") || "";
  const trainingPlanTypeId = watch("trainingPlanTypeId") || "";
  const trainingPlanVariantId = watch("trainingPlanVariantId") || "";
  const trainerPayoutMode = watch("trainerPayoutMode");

  const membership = useMembershipPicker(membershipPlanTypeId);
  const training = useTrainingPicker(trainingPlanTypeId);

  const selectedMembershipVariant = membership.variants?.find(
    (v: PlanVariant) => v.id === membershipPlanVariantId,
  );
  const selectedTrainingVariant = training.variants?.find(
    (v: PlanVariant) => v.id === trainingPlanVariantId,
  );

  const showTrainerPayout =
    (type === "discount" || type === "promo") &&
    (appliesTo === "training" || appliesTo === "both") &&
    planScope === "variant" &&
    !!(appliesTo === "both"
      ? selectedTrainingVariant
      : selectedMembershipVariant ?? selectedTrainingVariant);

  // Show error only after the field is touched OR a submit was attempted
  const showDiscountError = !!errors.discountValue && (!!touchedFields.discountValue || isSubmitted);

  // Skip effects on the initial mount — they should only react to user-driven changes,
  // not fire when the component first mounts and wipe values already set by reset().
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) return;
    setValue("membershipPlanTypeId", "");
    setValue("membershipPlanVariantId", null);
    setValue("trainingPlanTypeId", "");
    setValue("trainingPlanVariantId", null);
  }, [appliesTo, setValue]);

  useEffect(() => {
    if (!isMounted.current) return;
    setValue("membershipPlanVariantId", null);
  }, [membershipPlanTypeId, setValue]);

  useEffect(() => {
    if (!isMounted.current) return;
    setValue("trainingPlanVariantId", null);
  }, [trainingPlanTypeId, setValue]);

  useEffect(() => {
    if (!isMounted.current) return;
    if (planScope === "all") {
      setValue("membershipPlanTypeId", "");
      setValue("membershipPlanVariantId", null);
      setValue("trainingPlanTypeId", "");
      setValue("trainingPlanVariantId", null);
    }
  }, [planScope, setValue]);

  // Declared last so it runs after the above effects on mount, setting isMounted only after
  // the initial effect runs are skipped.
  useEffect(() => { isMounted.current = true; }, []);

  // ── Referral ─────────────────────────────────────────────────────────────
  if (type === "referral") {
    return (
      <div className="space-y-3">
        <FieldGroup>
          <FieldRow
            label="Referral reward"
            hint="Credited to the referrer. Apply manually on their next renewal."
          >
            <div className="relative w-36">
              <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="rewardAmount"
                type="number"
                min={0}
                step="1"
                placeholder="500"
                className="pl-8 h-8 text-sm"
                {...register("rewardAmount")}
              />
            </div>
          </FieldRow>
        </FieldGroup>
      </div>
    );
  }

  // ── Discount / Promo ──────────────────────────────────────────────────────
  if (type === "discount" || type === "promo") {
    return (
      <div className="space-y-4">

        {/* ── Group 1: Who & which plans ── */}
        <FieldGroup>
          <FieldRow label="Applies to">
            <SegmentedControl
              value={appliesTo}
              onChange={(v) => setValue("appliesTo", v as "membership" | "training" | "both")}
              options={[
                { value: "membership", label: "Membership", icon: ShoppingBag },
                { value: "training", label: "Training", icon: Dumbbell },
                { value: "both", label: "Both", icon: Layers },
              ]}
            />
          </FieldRow>

          <FieldRow
            label="Target gender"
            hint="Leave as 'Any' to allow all members"
          >
            <Select
              value={watch("targetGender") ?? "any"}
              onValueChange={(v) => setValue("targetGender", v === "any" ? null : v)}
            >
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any gender</SelectItem>
                <SelectItem value="Male">Male only</SelectItem>
                <SelectItem value="Female">Female only</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        </FieldGroup>

        {/* ── Group 2: Discount value ── */}
        <FieldGroup>
          <FieldRow
            label="Discount mode"
            hint={
              discountMode === "amount_off"
                ? "Deducted from the plan's regular price"
                : appliesTo === "both"
                ? "One combined fixed price for membership + training"
                : "Member pays this exact amount"
            }
          >
            <SegmentedControl
              value={discountMode}
              onChange={(v) => setValue("discountMode", v as "amount_off" | "target_price")}
              options={[
                { value: "amount_off", label: "% / ₹ off" },
                { value: "target_price", label: "Fixed price" },
              ]}
            />
          </FieldRow>

          {discountMode === "amount_off" && (
            <FieldRow label="Discount value">
              {/* Unit + Value inline — no separate labels, no layout mismatch */}
              <div className="flex items-center gap-2">
                <SegmentedControl
                  value={discountType}
                  onChange={(v) => setValue("discountType", v as "percentage" | "flat")}
                  options={[
                    { value: "percentage", label: "%" },
                    { value: "flat", label: "₹" },
                  ]}
                />
                <div className="relative w-28">
                  {discountType === "percentage" ? (
                    <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  ) : (
                    <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  )}
                  <Input
                    type="number"
                    min={0}
                    max={discountType === "percentage" ? 100 : undefined}
                    step="1"
                    placeholder={discountType === "percentage" ? "10" : "500"}
                    className={cn(
                      "h-8 text-sm",
                      discountType === "percentage" ? "pr-8" : "pl-8",
                      showDiscountError && "border-destructive",
                    )}
                    {...register("discountValue")}
                  />
                </div>
              </div>
            </FieldRow>
          )}

          {discountMode === "amount_off" && showDiscountError && (
            <div className="px-4 pb-3 -mt-1">
              <p className="text-xs text-destructive">{errors.discountValue?.message}</p>
            </div>
          )}

          {discountMode === "target_price" && (
            <FieldRow
              label={appliesTo === "both" ? "Combined price" : "Member pays"}
            >
              <div className="relative w-36">
                <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="3000"
                  className="pl-8 h-8 text-sm"
                  {...register("targetPrice")}
                />
              </div>
            </FieldRow>
          )}

          {type === "promo" && (
            <FieldRow label="Promo code" hint="Optional — leave blank if no code needed">
              <Input
                placeholder="SUMMER10"
                style={{ textTransform: "uppercase" }}
                className="w-36 h-8 text-sm font-mono"
                {...register("code")}
              />
            </FieldRow>
          )}
        </FieldGroup>

        {/* ── Group 3: Plan restriction ── */}
        <FieldGroup>
          <FieldRow
            label="Plan restriction"
            hint={
              planScope === "all"
                ? "Any plan qualifies"
                : planScope === "type"
                ? "Only plans under the selected type"
                : "One specific variant — unlocks price preview"
            }
          >
            <SegmentedControl
              value={planScope}
              onChange={(v) => setValue("planScope", v as "all" | "type" | "variant")}
              options={[
                { value: "all", label: "All plans" },
                { value: "type", label: "By type" },
                { value: "variant", label: "Specific" },
              ]}
            />
          </FieldRow>

          {planScope !== "all" && (
            <div className="px-4 py-3 space-y-3">
              {(appliesTo === "membership" || appliesTo === "both") && (
                <div className="space-y-2">
                  {appliesTo === "both" && (
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <ShoppingBag className="h-3 w-3" /> Membership plan
                    </p>
                  )}
                  <PlanTypePicker
                    planTypes={membership.planTypes}
                    isLoading={false}
                    selectedPlanTypeId={membershipPlanTypeId}
                    onSelect={(id) => setValue("membershipPlanTypeId", id)}
                  />
                  {planScope === "variant" && membershipPlanTypeId && (
                    <PlanVariantPicker
                      variants={membership.variants}
                      isLoading={membership.isLoading}
                      selectedVariantId={membershipPlanVariantId}
                      onSelect={(id) => setValue("membershipPlanVariantId", id)}
                    />
                  )}
                </div>
              )}

              {(appliesTo === "training" || appliesTo === "both") && (
                <div className="space-y-2">
                  {appliesTo === "both" && (
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Dumbbell className="h-3 w-3" /> Training plan
                    </p>
                  )}
                  <PlanTypePicker
                    planTypes={training.planTypes}
                    isLoading={false}
                    selectedPlanTypeId={trainingPlanTypeId}
                    onSelect={(id) => setValue("trainingPlanTypeId", id)}
                  />
                  {planScope === "variant" && trainingPlanTypeId && (
                    <PlanVariantPicker
                      variants={training.variants}
                      isLoading={training.isLoading}
                      selectedVariantId={trainingPlanVariantId}
                      onSelect={(id) => setValue("trainingPlanVariantId", id)}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </FieldGroup>

        {/* ── Price preview (outside groups — appears dynamically) ── */}
        <PricePreview
          discountMode={discountMode}
          discountType={discountType}
          discountValue={discountValue ? Number(discountValue) : undefined}
          targetPrice={targetPrice ? Number(targetPrice) : null}
          membershipPrice={selectedMembershipVariant?.price}
          trainingPrice={selectedTrainingVariant?.price}
          appliesTo={appliesTo}
        />

        {/* ── Group 4: Trainer payout (conditional) ── */}
        {showTrainerPayout && (
          <FieldGroup>
            <FieldRow
              label="Trainer payout"
              hint="Overrides trainer's default for this offer"
            >
              <Select
                value={trainerPayoutMode}
                onValueChange={(v) => {
                  setValue("trainerPayoutMode", v as "default" | "fixed" | "split");
                  if (v === "default") {
                    setValue("trainerFixedPayout", null);
                    setValue("trainerSplitPercent", null);
                  }
                }}
              >
                <SelectTrigger className="w-44 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default split</SelectItem>
                  <SelectItem value="fixed">Fixed amount (₹)</SelectItem>
                  <SelectItem value="split">Custom split (%)</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>

            {trainerPayoutMode === "fixed" && (
              <FieldRow label="Fixed amount">
                <div className="relative w-36">
                  <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="1200"
                    className="pl-8 h-8 text-sm"
                    {...register("trainerFixedPayout")}
                  />
                </div>
              </FieldRow>
            )}

            {trainerPayoutMode === "split" && (
              <FieldRow label="Split percentage">
                <div className="relative w-28">
                  <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    placeholder="40"
                    className="pr-8 h-8 text-sm"
                    {...register("trainerSplitPercent")}
                  />
                </div>
              </FieldRow>
            )}
          </FieldGroup>
        )}
      </div>
    );
  }

  return null;
}

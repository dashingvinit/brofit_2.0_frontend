import { useState, useEffect } from 'react';
import { Tag, X, User } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { PaymentFields } from '@/shared/components/payment-fields';
import type { Member, PlanType, PlanVariant, Offer } from '@/shared/types/common.types';
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';

interface MembershipPaymentStepProps {
  selectedMember: Member | undefined;
  selectedPlanType: PlanType | undefined;
  selectedVariant: PlanVariant | undefined;
  finalPrice: number;
  startDate: string;
  endDate: string | null;
  addTraining: boolean;
  selectedTrainingVariant: PlanVariant | undefined;
  trainingPlanTypes: PlanType[] | undefined;
  trainingPlanTypeId: string;
  trainingFinalPrice: number;
  discountOffers: Offer[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: UseFormWatch<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  errors?: Record<string, { message?: string }>;
}

/** Proportionally splits a flat discount across two items.
 *  Caps at combined price and redistributes overflow — no negatives possible.
 */
function splitDiscount(
  flatDiscount: number,
  membershipBase: number,
  trainingBase: number
): { membershipDiscount: number; trainingDiscount: number } {
  const total = membershipBase + trainingBase;
  if (total === 0) return { membershipDiscount: 0, trainingDiscount: 0 };

  const capped = Math.min(flatDiscount, total);
  let mDiscount = Math.round((capped * membershipBase) / total);
  let tDiscount = capped - mDiscount;

  if (mDiscount > membershipBase) {
    tDiscount = Math.min(tDiscount + (mDiscount - membershipBase), trainingBase);
    mDiscount = membershipBase;
  } else if (tDiscount > trainingBase) {
    mDiscount = Math.min(mDiscount + (tDiscount - trainingBase), membershipBase);
    tDiscount = trainingBase;
  }

  return { membershipDiscount: mDiscount, trainingDiscount: tDiscount };
}

export function MembershipPaymentStep({
  selectedMember,
  selectedPlanType,
  selectedVariant,
  finalPrice,
  startDate,
  endDate,
  addTraining,
  selectedTrainingVariant,
  trainingPlanTypes,
  trainingPlanTypeId,
  trainingFinalPrice,
  discountOffers,
  register,
  watch,
  setValue,
  errors = {},
}: MembershipPaymentStepProps) {
  const collectPayment = watch('collectPayment');
  const offerId = watch('offerId') || '';

  const membershipBase = selectedVariant?.price ?? 0;
  const trainingBase = selectedTrainingVariant?.price ?? 0;
  const subtotal = membershipBase + (addTraining ? trainingBase : 0);

  const membershipDiscount = membershipBase - finalPrice;
  const trainingDiscount = addTraining ? trainingBase - trainingFinalPrice : 0;
  const totalDiscount = membershipDiscount + trainingDiscount;
  const totalDue = Math.max(0, subtotal - totalDiscount);

  // Filter offers by context, gender, and plan variant match
  const visibleOffers = discountOffers.filter((o) => {
    // Hide training-only offers when no training is selected
    if (!addTraining && o.appliesTo === 'training') return false;

    // Gender filter
    if (o.targetGender && selectedMember?.gender !== o.targetGender) return false;

    // Plan variant match: if offer requires a specific membership variant, it must match
    if (o.membershipPlanVariantId && o.membershipPlanVariantId !== selectedVariant?.id) return false;

    // For training variant: only block if training IS added but wrong variant selected.
    // If training isn't added yet, still show combo offers so user knows they exist.
    if (o.trainingPlanVariantId && addTraining && o.trainingPlanVariantId !== selectedTrainingVariant?.id) return false;

    return true;
  });

  // Combo offers visible but training not yet added — show as a hint
  const comboOffersNeedingTraining = visibleOffers.filter(
    (o) => o.appliesTo === 'both' && !addTraining
  );

  const selectedOffer = visibleOffers.find((o) => o.id === offerId);

  // Manual discount state — derived from current form values when no offer is active
  const currentManualDiscount = !offerId ? totalDiscount : 0;
  const [manualInput, setManualInput] = useState(currentManualDiscount);

  // Keep manual input in sync when variant changes (resets discounts)
  useEffect(() => {
    if (!offerId) setManualInput(totalDiscount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipBase, trainingBase]);

  function applyManualDiscount(value: number) {
    const amount = Math.max(0, value);
    setManualInput(amount);
    if (addTraining && selectedTrainingVariant) {
      const { membershipDiscount: mD, trainingDiscount: tD } = splitDiscount(amount, membershipBase, trainingBase);
      setValue('discountAmount', mD);
      setValue('trainingDiscountAmount', tD);
    } else {
      setValue('discountAmount', Math.min(amount, membershipBase));
      setValue('trainingDiscountAmount', 0);
    }
  }

  function handleOfferChange(value: string) {
    const newOfferId = value === 'none' ? '' : value;
    setValue('offerId', newOfferId);
    setManualInput(0);

    if (!newOfferId) {
      setValue('discountAmount', 0);
      setValue('trainingDiscountAmount', 0);
      return;
    }

    const offer = visibleOffers.find((o) => o.id === newOfferId);
    if (!offer) return;

    // Target-price based offers: compute discount to reach target total
    if (offer.targetPrice != null) {
      const totalDiscount = Math.max(0, subtotal - offer.targetPrice);
      if (addTraining && selectedTrainingVariant) {
        const { membershipDiscount: mD, trainingDiscount: tD } = splitDiscount(totalDiscount, membershipBase, trainingBase);
        setValue('discountAmount', mD);
        setValue('trainingDiscountAmount', tD);
      } else {
        setValue('discountAmount', Math.min(totalDiscount, membershipBase));
        setValue('trainingDiscountAmount', 0);
      }
    } else if (offer.discountValue != null) {
      // Legacy discount flow
      if (offer.appliesTo === 'training' && addTraining) {
        const computed =
          offer.discountType === 'percentage'
            ? Math.round((offer.discountValue / 100) * trainingBase)
            : offer.discountValue;
        setValue('discountAmount', 0);
        setValue('trainingDiscountAmount', Math.min(computed, trainingBase));
      } else if (offer.appliesTo === 'both' && addTraining) {
        const flatDiscount =
          offer.discountType === 'percentage'
            ? Math.round((offer.discountValue / 100) * subtotal)
            : offer.discountValue;
        const { membershipDiscount: mD, trainingDiscount: tD } = splitDiscount(flatDiscount, membershipBase, trainingBase);
        setValue('discountAmount', mD);
        setValue('trainingDiscountAmount', tD);
      } else {
        const computed =
          offer.discountType === 'percentage'
            ? Math.round((offer.discountValue / 100) * membershipBase)
            : offer.discountValue;
        setValue('discountAmount', Math.min(computed, membershipBase));
        setValue('trainingDiscountAmount', 0);
      }
    }

    // Set trainer payout override from offer
    if (offer.trainerFixedPayout != null) {
      setValue('trainerFixedPayout', offer.trainerFixedPayout);
    }
  }

  function clearOffer() {
    setValue('offerId', '');
    setValue('discountAmount', 0);
    setValue('trainingDiscountAmount', 0);
    setValue('trainerFixedPayout', null);
    setManualInput(0);
  }

  return (
    <div className="space-y-6 px-6 pb-6">
      <div>
        <h3 className="text-lg font-semibold">Review & Payment</h3>
        <p className="text-sm text-muted-foreground">
          Confirm the details, apply any offer, and record payment.
        </p>
      </div>

      {/* Invoice */}
      <div className="rounded-lg border overflow-hidden text-sm">

        {/* Member header */}
        {selectedMember && (
          <>
            <div className="px-4 py-2.5 flex items-center gap-2 bg-muted/50">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">
                {selectedMember.firstName} {selectedMember.lastName}
              </span>
              <span className="text-muted-foreground text-xs">· {selectedMember.phone}</span>
            </div>
            <Separator />
          </>
        )}

        {/* Column header */}
        <div className="px-4 py-2 flex items-center justify-between bg-muted/30">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Item</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rate</span>
        </div>
        <Separator />

        {/* Membership line */}
        <div className="px-4 py-3 flex items-start justify-between gap-4">
          <div>
            <p className="font-medium">{selectedPlanType?.name} · {selectedVariant?.durationLabel}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{startDate} → {endDate}</p>
          </div>
          <span className="font-medium tabular-nums shrink-0">₹{membershipBase.toLocaleString()}</span>
        </div>

        {/* Training line */}
        {addTraining && selectedTrainingVariant && (
          <>
            <Separator />
            <div className="px-4 py-3 flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">
                  {trainingPlanTypes?.find((p) => p.id === trainingPlanTypeId)?.name} · {selectedTrainingVariant.durationLabel}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Personal Training</p>
              </div>
              <span className="font-medium tabular-nums shrink-0">₹{trainingBase.toLocaleString()}</span>
            </div>
          </>
        )}

        {/* Subtotal row — only shown when both items present */}
        {addTraining && selectedTrainingVariant && (
          <>
            <Separator />
            <div className="px-4 py-2 flex items-center justify-between bg-muted/20">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="text-xs text-muted-foreground tabular-nums">₹{subtotal.toLocaleString()}</span>
            </div>
          </>
        )}

        {/* Discount section */}
        <Separator />
        <div className="px-4 py-3 space-y-3">

          {/* Offer picker or applied offer */}
          {!selectedOffer ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {visibleOffers.filter((o) => !(o.appliesTo === 'both' && !addTraining)).length > 0 ? (
                  <Select value="none" onValueChange={handleOfferChange}>
                    <SelectTrigger className="h-8 text-sm border-dashed flex-1">
                      <SelectValue placeholder="Apply offer…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No offer</SelectItem>
                      {visibleOffers
                        .filter((o) => !(o.appliesTo === 'both' && !addTraining))
                        .map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.title}
                            {o.targetPrice != null
                              ? ` — ₹${o.targetPrice.toLocaleString()} total`
                              : o.discountType === 'percentage'
                              ? ` — ${o.discountValue}% off`
                              : ` — ₹${o.discountValue?.toLocaleString()} off`}
                            {o.appliesTo === 'both' ? ' (combo)' : o.appliesTo === 'training' ? ' (training)' : ''}
                            {o.targetGender ? ` · ${o.targetGender}` : ''}
                            {o.code ? ` · ${o.code}` : ''}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs text-muted-foreground">No active offers</span>
                )}
              </div>

              {/* Combo offer hint — shown when combo offers exist but training not added */}
              {comboOffersNeedingTraining.length > 0 && (
                <div className="flex items-start gap-2 pl-5 rounded-md bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
                  <Tag className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <span className="font-medium">
                      {comboOffersNeedingTraining.map((o) => o.title).join(', ')}
                    </span>
                    {' '}— combo offer available. Go back and enable "Assign Training" to apply it.</p>
                </div>
              )}

              {/* Manual discount — shown only when no offer applied */}
              <div className="flex items-center gap-2 pl-5">
                <Label className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  Manual discount
                </Label>
                <div className="relative w-32">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    min={0}
                    max={subtotal}
                    className="pl-6 h-7 text-sm"
                    value={manualInput || ''}
                    placeholder="0"
                    onChange={(e) => applyManualDiscount(Number(e.target.value))}
                  />
                </div>
                {addTraining && selectedTrainingVariant && manualInput > 0 && (
                  <span className="text-xs text-muted-foreground">
                    split proportionally
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Tag className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-medium text-emerald-600 dark:text-emerald-400 truncate">
                    {selectedOffer.title}
                  </span>
                  {selectedOffer.appliesTo === 'both' && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">combo</Badge>
                  )}
                  {selectedOffer.code && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">{selectedOffer.code}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                    −₹{totalDiscount.toLocaleString()}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={clearOffer}
                    aria-label="Remove offer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Per-item split — only for combo offers */}
              {selectedOffer.appliesTo === 'both' && addTraining && (
                <div className="ml-5 space-y-0.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>↳ Membership</span>
                    <span className="tabular-nums">−₹{membershipDiscount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>↳ Training</span>
                    <span className="tabular-nums">−₹{trainingDiscount.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total */}
        <Separator />
        <div className="px-4 py-3 flex items-center justify-between bg-muted/50">
          <span className="font-semibold">Total Due</span>
          <span className="text-lg font-bold tabular-nums">₹{totalDue.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment collection */}
      <PaymentFields
        collectPayment={collectPayment}
        defaultAmount={totalDue}
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
      />
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CalendarDays,
  CreditCard,
  IndianRupee,
  User,
  Dumbbell,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { FormStepIndicator } from '@/shared/components/form-step-indicator';
import { MemberPicker } from '@/shared/components/member-picker';
import { PlanTypePicker } from '@/shared/components/plan-type-picker';
import { PlanVariantPicker } from '@/shared/components/plan-variant-picker';
import { PaymentFields } from '@/shared/components/payment-fields';
import { useMembers } from '@/features/members/hooks/use-members';
import { usePlanTypesByCategory } from '@/features/plans/hooks/use-plan-types';
import { usePlanVariantsByType } from '@/features/plans/hooks/use-plan-variants';
import { useTrainers } from '@/features/trainer/hooks/use-trainers';
import { useCreateTraining, useActiveTraining } from '../hooks/use-training';
import { useOffers } from '@/features/offers/hooks/use-offers';
import type { CreateTrainingData, PaymentMethod } from '@/shared/types/common.types';

const createTrainingSchema = z
  .object({
    memberId: z.string().min(1, 'Please select a member'),
    planTypeId: z.string().min(1, 'Please select a plan type'),
    planVariantId: z.string().min(1, 'Please select a plan variant'),
    trainerId: z.string().min(1, 'Please select a trainer'),
    startDate: z.string().min(1, 'Start date is required'),
    discountAmount: z.coerce.number().min(0, 'Discount cannot be negative').default(0),
    trainerFixedPayout: z.union([z.number().min(0), z.null()]).optional().nullable(),
    offerId: z.string().optional(),
    autoRenew: z.boolean().default(false),
    notes: z.string().optional(),
    collectPayment: z.boolean().default(false),
    paymentAmount: z.coerce.number().optional(),
    paymentMethod: z.string().optional(),
    paymentReference: z.string().optional(),
    paymentNotes: z.string().optional(),
    paymentDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.collectPayment) {
        return !!data.paymentMethod && (data.paymentAmount ?? 0) > 0;
      }
      return true;
    },
    {
      message: 'Payment amount and method are required when collecting payment',
      path: ['paymentAmount'],
    }
  );

type CreateTrainingFormData = z.infer<typeof createTrainingSchema>;

interface CreateTrainingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  preselectedMemberId?: string;
}

const STEPS = [
  { id: 'member', label: 'Select Member', icon: User },
  { id: 'plan', label: 'Choose Plan', icon: Dumbbell },
  { id: 'details', label: 'Details', icon: CalendarDays },
  { id: 'payment', label: 'Payment', icon: CreditCard },
];

const STEP_FOR_FIELD: Record<string, number> = {
  memberId: 0,
  planTypeId: 1,
  planVariantId: 1,
  trainerId: 2,
  startDate: 2,
  discountAmount: 2,
  trainerFixedPayout: 2,
  paymentAmount: 3,
  paymentMethod: 3,
};

export function CreateTrainingForm({
  onSuccess,
  onCancel,
  preselectedMemberId,
}: CreateTrainingFormProps) {
  const [currentStep, setCurrentStep] = useState(preselectedMemberId ? 1 : 0);
  const [memberSearch, setMemberSearch] = useState('');
  const [showPayoutOverride, setShowPayoutOverride] = useState(false);

  const { data: membersResponse, isLoading: membersLoading } = useMembers();
  const { data: planTypes, isLoading: planTypesLoading } = usePlanTypesByCategory('training');
  const { data: trainersResponse, isLoading: trainersLoading } = useTrainers();
  const { data: activeOffers } = useOffers(undefined, true);
  const createTraining = useCreateTraining();

  const form = useForm<CreateTrainingFormData>({
    resolver: zodResolver(createTrainingSchema),
    defaultValues: {
      memberId: preselectedMemberId || '',
      startDate: new Date().toISOString().split('T')[0],
      discountAmount: 0,
      trainerFixedPayout: null,
      offerId: '',
      autoRenew: false,
      collectPayment: false,
      trainerId: '',
      paymentDate: new Date().toISOString().split('T')[0],
    },
  });

  const planTypeId = form.watch('planTypeId');
  const planVariantId = form.watch('planVariantId');
  const memberId = form.watch('memberId');
  const trainerId = form.watch('trainerId');
  const startDate = form.watch('startDate');
  const offerId = form.watch('offerId') || '';
  const discountAmount = Number(form.watch('discountAmount')) || 0;
  const trainerFixedPayout = form.watch('trainerFixedPayout');
  const collectPayment = form.watch('collectPayment');

  const { data: planVariants, isLoading: variantsLoading } = usePlanVariantsByType(planTypeId, false);
  const { data: activeTrainingResponse } = useActiveTraining(memberId || '');
  const existingActiveTraining = activeTrainingResponse?.data;

  const members = membersResponse?.data ?? [];
  const trainers = trainersResponse?.data ?? [];
  const activeTrainers = trainers.filter((t) => t.isActive);

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.includes(q)
    );
  }, [members, memberSearch]);

  const selectedMember = members.find((m) => m.id === memberId);
  const selectedPlanType = planTypes?.find((p) => p.id === planTypeId);
  const selectedVariant = planVariants?.find((v) => v.id === planVariantId);
  const selectedTrainer = trainers.find((t) => t.id === trainerId);

  const discountOffers = useMemo(() => {
    return (activeOffers ?? []).filter((o) => {
      if (o.type !== 'discount' && o.type !== 'promo') return false;
      if (o.appliesTo !== 'training') return false;
      if (o.targetGender && selectedMember?.gender !== o.targetGender) return false;
      if (o.trainingPlanVariantId && o.trainingPlanVariantId !== selectedVariant?.id) return false;
      return true;
    });
  }, [activeOffers, selectedMember, selectedVariant]);

  const selectedOffer = discountOffers.find((o) => o.id === offerId);
  const finalPrice = selectedVariant ? Math.max(0, selectedVariant.price - discountAmount) : 0;
  const splitPercent = selectedTrainer?.splitPercent ?? 60;
  // Trainer payout is calculated on the gross plan price, not the discounted price.
  // Discounts come out of the gym's share, not the trainer's.
  const suggestedPayout = selectedTrainer && selectedVariant
    ? Math.round((selectedVariant.price * splitPercent) / 100)
    : 0;
  const isFixedPayoutActive = trainerFixedPayout != null;

  // If the currently-selected offer becomes invalid for the new member/variant, drop it.
  useEffect(() => {
    if (offerId && !selectedOffer) {
      form.setValue('offerId', '');
      form.setValue('discountAmount', 0);
    }
  }, [offerId, selectedOffer, form]);

  const endDate = useMemo(() => {
    if (!startDate || !selectedVariant) return null;
    const start = new Date(startDate);
    start.setDate(start.getDate() + selectedVariant.durationDays);
    return start.toISOString().split('T')[0];
  }, [startDate, selectedVariant]);

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!memberId;
      case 1: return !!planTypeId && !!planVariantId;
      case 2: return !!startDate && !!trainerId;
      case 3: return true;
      default: return false;
    }
  };

  const handleApplyOffer = (value: string) => {
    const next = value === 'none' ? '' : value;
    form.setValue('offerId', next);
    if (!next) {
      form.setValue('discountAmount', 0);
      form.setValue('trainerFixedPayout', null);
      return;
    }
    if (!selectedVariant) return;
    const offer = discountOffers.find((o) => o.id === next);
    if (!offer) return;

    if (offer.targetPrice != null) {
      form.setValue('discountAmount', Math.max(0, selectedVariant.price - offer.targetPrice));
    } else if (offer.discountValue != null) {
      const computed = offer.discountType === 'percentage'
        ? Math.round((offer.discountValue / 100) * selectedVariant.price)
        : offer.discountValue;
      form.setValue('discountAmount', Math.min(computed, selectedVariant.price));
    }
    if (offer.trainerFixedPayout != null) {
      form.setValue('trainerFixedPayout', offer.trainerFixedPayout);
      setShowPayoutOverride(true);
    }
  };

  const onSubmit = (data: CreateTrainingFormData) => {
    if (currentStep !== STEPS.length - 1) return;
    const payload: CreateTrainingData = {
      memberId: data.memberId,
      planVariantId: data.planVariantId,
      trainerId: data.trainerId,
      startDate: data.startDate,
      discountAmount: data.discountAmount || 0,
      offerId: data.offerId || undefined,
      autoRenew: data.autoRenew,
      notes: data.notes,
      trainerFixedPayout: data.trainerFixedPayout ?? null,
    };

    if (data.collectPayment && data.paymentAmount && data.paymentMethod) {
      payload.paymentAmount = data.paymentAmount;
      payload.paymentMethod = data.paymentMethod as PaymentMethod;
      payload.paymentReference = data.paymentReference;
      payload.paymentNotes = data.paymentNotes;
      payload.paymentDate = data.paymentDate;
    }

    createTraining.mutate(payload, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  const onValidationError = (errors: Record<string, { message?: string }>) => {
    const firstError = Object.values(errors).find((e) => e?.message)?.message;
    toast.error(firstError ?? 'Please fix the highlighted fields before submitting.');
    const earliest = Object.keys(errors)
      .map((k) => STEP_FOR_FIELD[k] ?? STEPS.length - 1)
      .sort((a, b) => a - b)[0];
    if (earliest != null && earliest < currentStep) setCurrentStep(earliest);
  };

  return (
    <div className="space-y-6">
      <FormStepIndicator steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />

      <Separator />

      <form
        onSubmit={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }}
      >
        {currentStep === 0 && (
          <MemberPicker
            members={filteredMembers}
            isLoading={membersLoading}
            selectedMemberId={memberId}
            search={memberSearch}
            onSearchChange={setMemberSearch}
            onSelect={(id) => form.setValue('memberId', id)}
            error={form.formState.errors.memberId?.message}
            activeWarning={existingActiveTraining ? { type: 'training', item: existingActiveTraining } : null}
          />
        )}

        {currentStep === 1 && (
          <div className="space-y-6 px-6 pb-6">
            <div>
              <h3 className="text-lg font-semibold">Choose a Training Plan</h3>
              <p className="text-sm text-muted-foreground">
                Select a training plan type and duration for{' '}
                <span className="font-medium text-foreground">
                  {selectedMember?.firstName} {selectedMember?.lastName}
                </span>
                .
              </p>
            </div>
            <PlanTypePicker
              planTypes={planTypes}
              isLoading={planTypesLoading}
              selectedPlanTypeId={planTypeId}
              onSelect={(id) => {
                form.setValue('planTypeId', id);
                form.setValue('planVariantId', '');
              }}
              error={form.formState.errors.planTypeId?.message}
              emptyMessage="No training plan types available. Please create a training plan type first."
            />
            {planTypeId && (
              <PlanVariantPicker
                variants={planVariants}
                isLoading={variantsLoading}
                selectedVariantId={planVariantId}
                onSelect={(id) => form.setValue('planVariantId', id)}
                error={form.formState.errors.planVariantId?.message}
              />
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 px-6 pb-6">
            <div>
              <h3 className="text-lg font-semibold">Training Details</h3>
              <p className="text-sm text-muted-foreground">
                Configure trainer, dates, discount, and notes.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainerId">Trainer *</Label>
              {trainersLoading ? (
                <div className="flex items-center gap-2 h-10">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading trainers...</span>
                </div>
              ) : (
                <Select
                  value={trainerId || ''}
                  onValueChange={(v) => form.setValue('trainerId', v)}
                >
                  <SelectTrigger id="trainerId">
                    <SelectValue placeholder="Select a trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTrainers.length > 0 ? (
                      activeTrainers.map((trainer) => (
                        <SelectItem key={trainer.id} value={trainer.id}>
                          {trainer.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_none" disabled>
                        No active trainers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              {form.formState.errors.trainerId && (
                <p className="text-sm text-destructive">{form.formState.errors.trainerId.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input id="startDate" type="date" {...form.register('startDate')} />
                {form.formState.errors.startDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate || ''} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  Auto-calculated ({selectedVariant?.durationDays} days)
                </p>
              </div>
            </div>

            {discountOffers.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="offerId">Apply Offer (optional)</Label>
                <Select value={offerId || 'none'} onValueChange={handleApplyOffer}>
                  <SelectTrigger id="offerId">
                    <SelectValue placeholder="No offer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No offer</SelectItem>
                    {discountOffers.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.title}
                        {o.targetPrice != null
                          ? ` — ₹${o.targetPrice.toLocaleString()} total`
                          : o.discountType === 'percentage'
                          ? ` — ${o.discountValue}% off`
                          : ` — ₹${o.discountValue?.toLocaleString()} off`}
                        {o.targetGender ? ` · ${o.targetGender}` : ''}
                        {o.code ? ` · ${o.code}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (activeOffers ?? []).some((o) => (o.type === 'discount' || o.type === 'promo') && o.appliesTo === 'training') && selectedVariant ? (
              <p className="text-xs text-muted-foreground">
                No offers available for this member &amp; plan combination.
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="discountAmount">Discount Amount</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="discountAmount"
                  type="number"
                  min={0}
                  max={selectedVariant?.price || 0}
                  className="pl-9"
                  value={discountAmount || ''}
                  placeholder="0"
                  onChange={(e) => {
                    const next = e.target.value === '' ? 0 : Number(e.target.value);
                    form.setValue('discountAmount', Number.isNaN(next) ? 0 : next);
                    if (offerId) form.setValue('offerId', '');
                  }}
                />
              </div>
              {form.formState.errors.discountAmount && (
                <p className="text-sm text-destructive">{form.formState.errors.discountAmount.message}</p>
              )}
            </div>

            {selectedVariant && selectedTrainer && (
              showPayoutOverride ? (
                <div className="space-y-2">
                  <Label htmlFor="trainerFixedPayout" className="text-xs text-muted-foreground">
                    Override trainer payout for this training
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="trainerFixedPayout"
                        type="number"
                        min={0}
                        className="pl-9"
                        placeholder={`Default: ₹${suggestedPayout.toLocaleString()} (${splitPercent}% split)`}
                        value={trainerFixedPayout ?? ''}
                        onChange={(e) => {
                          form.setValue('trainerFixedPayout', e.target.value === '' ? null : Number(e.target.value));
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        form.setValue('trainerFixedPayout', null);
                        setShowPayoutOverride(false);
                      }}
                    >
                      Use split
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only use if you've negotiated a fixed payout. Leave blank to keep the {splitPercent}% split.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPayoutOverride(true)}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  Override trainer payout for this training
                </button>
              )
            )}

            {selectedVariant && (
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plan Price</span>
                    <span>
                      <IndianRupee className="inline h-3 w-3" />
                      {selectedVariant.price.toLocaleString()}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount{selectedOffer ? ` (${selectedOffer.title})` : ''}</span>
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
                  {selectedTrainer && (
                    <>
                      <Separator />
                      <div className={`flex justify-between text-sm ${isFixedPayoutActive ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
                        <span>
                          Trainer payout {isFixedPayoutActive ? '(negotiated)' : `(${splitPercent}% split)`}
                        </span>
                        <span className={isFixedPayoutActive ? 'font-medium' : undefined}>
                          <IndianRupee className="inline h-3 w-3" />
                          {(isFixedPayoutActive ? Number(trainerFixedPayout) : suggestedPayout).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoRenew"
                checked={form.watch('autoRenew')}
                onCheckedChange={(checked) => form.setValue('autoRenew', checked === true)}
              />
              <Label htmlFor="autoRenew" className="text-sm font-normal">
                Auto-renew training when it expires
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Any additional notes about this training..."
                rows={3}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 px-6 pb-6">
            <div>
              <h3 className="text-lg font-semibold">Payment</h3>
              <p className="text-sm text-muted-foreground">
                Optionally record an initial payment for this training.
              </p>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold text-sm">Training Summary</h4>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Member: </span>
                    <span className="font-medium">
                      {selectedMember?.firstName} {selectedMember?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plan: </span>
                    <span className="font-medium">
                      {selectedPlanType?.name} - {selectedVariant?.durationLabel}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trainer: </span>
                    <span className="font-medium">{selectedTrainer?.name ?? '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-medium">{startDate} to {endDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount Due: </span>
                    <span className="font-bold">
                      <IndianRupee className="inline h-3 w-3" />
                      {finalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <PaymentFields
              collectPayment={collectPayment}
              defaultAmount={finalPrice}
              register={form.register}
              watch={form.watch}
              setValue={form.setValue}
              errors={form.formState.errors as Record<string, { message?: string }>}
            />
          </div>
        )}

        <div className="flex items-center justify-between border-t px-6 py-4">
          <div>
            {currentStep > 0 ? (
              <Button type="button" variant="outline" onClick={() => setCurrentStep((s) => s - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            ) : onCancel ? (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createTraining.isPending}
              >
                Cancel
              </Button>
            ) : (
              <div />
            )}
          </div>

          <div>
            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={() => canProceed() && setCurrentStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => form.handleSubmit(onSubmit, onValidationError)()}
                disabled={createTraining.isPending}
              >
                {createTraining.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Training'
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

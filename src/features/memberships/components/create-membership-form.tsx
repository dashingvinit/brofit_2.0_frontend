import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, CreditCard, Dumbbell, User, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { FormStepIndicator } from '@/shared/components/form-step-indicator';
import { MemberPicker } from '@/shared/components/member-picker';
import { PlanTypePicker } from '@/shared/components/plan-type-picker';
import { PlanVariantPicker } from '@/shared/components/plan-variant-picker';
import { MembershipDetailsStep } from './membership-details-step';
import { TrainingStep } from './training-step';
import { MembershipPaymentStep } from './membership-payment-step';
import { useMembers } from '@/features/members/hooks/use-members';
import { usePlanTypesByCategory } from '@/features/plans/hooks/use-plan-types';
import { usePlanVariantsByType } from '@/features/plans/hooks/use-plan-variants';
import { useCreateMembership, useActiveMembership } from '../hooks/use-memberships';
import { useCreateTraining } from '@/features/training/hooks/use-training';
import { useTrainers } from '@/features/trainer/hooks/use-trainers';
import { useOffers } from '@/features/offers/hooks/use-offers';
import type { CreateMembershipData, CreateTrainingData, PaymentMethod } from '@/shared/types/common.types';

const createMembershipSchema = z
  .object({
    memberId: z.string().min(1, 'Please select a member'),
    planTypeId: z.string().min(1, 'Please select a plan type'),
    planVariantId: z.string().min(1, 'Please select a plan variant'),
    startDate: z.string().min(1, 'Start date is required'),
    discountAmount: z.coerce.number().min(0).default(0),
    offerId: z.string().optional(),
    autoRenew: z.boolean().default(false),
    notes: z.string().optional(),
    collectPayment: z.boolean().default(false),
    paymentAmount: z.coerce.number().optional(),
    paymentMethod: z.string().optional(),
    paymentReference: z.string().optional(),
    paymentNotes: z.string().optional(),
    paymentDate: z.string().optional(),
    addTraining: z.boolean().default(false),
    trainingPlanTypeId: z.string().optional(),
    trainingPlanVariantId: z.string().optional(),
    trainerId: z.string().optional(),
    trainingDiscountAmount: z.coerce.number().min(0).default(0),
    trainingNotes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.collectPayment) {
        return !!data.paymentMethod && (data.paymentAmount ?? 0) > 0;
      }
      return true;
    },
    { message: 'Payment amount and method are required when collecting payment', path: ['paymentAmount'] }
  )
  .refine(
    (data) => {
      if (data.addTraining) {
        return !!data.trainingPlanTypeId && !!data.trainingPlanVariantId && !!data.trainerId;
      }
      return true;
    },
    { message: 'Training plan, variant, and trainer are required', path: ['trainerId'] }
  );

type CreateMembershipFormData = z.infer<typeof createMembershipSchema>;

interface CreateMembershipFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  preselectedMemberId?: string;
}

const BASE_STEPS = [
  { id: 'member', label: 'Select Member', icon: User },
  { id: 'plan', label: 'Choose Plan', icon: Dumbbell },
  { id: 'details', label: 'Details', icon: CalendarDays },
  { id: 'payment', label: 'Payment', icon: CreditCard },
] as const;

const TRAINING_STEP = { id: 'training' as const, label: 'Training', icon: Dumbbell };

export function CreateMembershipForm({ onSuccess, onCancel, preselectedMemberId }: CreateMembershipFormProps) {
  const [currentStep, setCurrentStep] = useState(preselectedMemberId ? 1 : 0);
  const [memberSearch, setMemberSearch] = useState('');

  const { data: membersResponse, isLoading: membersLoading } = useMembers();
  const { data: planTypes, isLoading: planTypesLoading } = usePlanTypesByCategory('membership');
  const { data: trainingPlanTypes, isLoading: trainingPlanTypesLoading } = usePlanTypesByCategory('training');
  const { data: activeOffers } = useOffers(undefined, true);
  const { data: trainersResponse, isLoading: trainersLoading } = useTrainers();
  const createMembership = useCreateMembership();
  const createTraining = useCreateTraining();

  const discountOffers = (activeOffers ?? []).filter((o) => o.type === 'discount' || o.type === 'promo');
  const trainers = trainersResponse?.data ?? [];
  const members = membersResponse?.data ?? [];

  const form = useForm<CreateMembershipFormData>({
    resolver: zodResolver(createMembershipSchema),
    defaultValues: {
      memberId: preselectedMemberId || '',
      startDate: new Date().toISOString().split('T')[0],
      discountAmount: 0,
      offerId: '',
      autoRenew: false,
      collectPayment: false,
      addTraining: false,
      trainerId: '',
      trainingDiscountAmount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
    },
  });

  const selectedPlanTypeId = form.watch('planTypeId');
  const selectedPlanVariantId = form.watch('planVariantId');
  const selectedMemberId = form.watch('memberId');
  const discountAmount = form.watch('discountAmount') || 0;
  const startDate = form.watch('startDate');
  const addTraining = form.watch('addTraining');
  const trainingPlanTypeId = form.watch('trainingPlanTypeId') ?? '';
  const trainingPlanVariantId = form.watch('trainingPlanVariantId') ?? '';
  const trainingDiscountAmount = form.watch('trainingDiscountAmount') || 0;

  const steps = useMemo(() => {
    if (addTraining) return [...BASE_STEPS.slice(0, 3), TRAINING_STEP, BASE_STEPS[3]];
    return [...BASE_STEPS];
  }, [addTraining]);

  const currentStepId = steps[currentStep]?.id;

  const { data: planVariants, isLoading: variantsLoading } = usePlanVariantsByType(selectedPlanTypeId, false);
  const { data: trainingPlanVariants, isLoading: trainingVariantsLoading } = usePlanVariantsByType(trainingPlanTypeId, false);
  const { data: activeMembershipResponse } = useActiveMembership(selectedMemberId || '');

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

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const selectedPlanType = planTypes?.find((p) => p.id === selectedPlanTypeId);
  const selectedVariant = planVariants?.find((v) => v.id === selectedPlanVariantId);
  const selectedTrainingVariant = trainingPlanVariants?.find((v) => v.id === trainingPlanVariantId);
  const finalPrice = selectedVariant ? Math.max(0, selectedVariant.price - discountAmount) : 0;
  const trainingFinalPrice = selectedTrainingVariant
    ? Math.max(0, selectedTrainingVariant.price - trainingDiscountAmount)
    : 0;

  const endDate = useMemo(() => {
    if (!startDate || !selectedVariant) return null;
    const start = new Date(startDate);
    start.setDate(start.getDate() + selectedVariant.durationDays);
    return start.toISOString().split('T')[0];
  }, [startDate, selectedVariant]);

  // Reset discounts when offer is cleared or variant changes
  useEffect(() => {
    form.setValue('discountAmount', 0);
    form.setValue('offerId', '');
  }, [selectedPlanVariantId, form]);

  useEffect(() => {
    form.setValue('trainingDiscountAmount', 0);
  }, [trainingPlanVariantId, form]);

  const canProceed = () => {
    switch (currentStepId) {
      case 'member': return !!selectedMemberId;
      case 'plan': return !!selectedPlanTypeId && !!selectedPlanVariantId;
      case 'details': return !!startDate;
      case 'training': return !!trainingPlanTypeId && !!trainingPlanVariantId && !!form.watch('trainerId');
      case 'payment': return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceed()) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleToggleTraining = (checked: boolean) => {
    form.setValue('addTraining', checked);
    if (!checked) {
      if (currentStepId === 'training') setCurrentStep((s) => s - 1);
      if (currentStepId === 'payment') setCurrentStep(steps.length - 2);
      form.setValue('trainingPlanTypeId', '');
      form.setValue('trainingPlanVariantId', '');
      form.setValue('trainerId', '');
      form.setValue('trainingDiscountAmount', 0);
      form.setValue('trainingNotes', '');
      // Clear offer if it was combo-only
      form.setValue('offerId', '');
      form.setValue('discountAmount', 0);
    }
  };

  const isSubmitting = createMembership.isPending || createTraining.isPending;

  const onSubmit = (data: CreateMembershipFormData) => {
    const membershipFinalPrice = finalPrice;
    const trainingFinalPriceVal = trainingFinalPrice;
    const totalDue = membershipFinalPrice + (data.addTraining ? trainingFinalPriceVal : 0);

    // Split collected payment proportionally across membership and training
    let membershipPaymentAmount: number | undefined;
    let trainingPaymentAmount: number | undefined;
    if (data.collectPayment && data.paymentAmount && data.paymentMethod) {
      if (data.addTraining && trainingFinalPriceVal > 0 && totalDue > 0) {
        membershipPaymentAmount = Math.round((data.paymentAmount * membershipFinalPrice) / totalDue);
        trainingPaymentAmount = data.paymentAmount - membershipPaymentAmount;
      } else {
        membershipPaymentAmount = data.paymentAmount;
      }
    }

    const payload: CreateMembershipData = {
      memberId: data.memberId,
      planVariantId: data.planVariantId,
      startDate: data.startDate,
      discountAmount: data.discountAmount || 0,
      offerId: data.offerId || undefined,
      autoRenew: data.autoRenew,
      notes: data.notes,
    };

    if (membershipPaymentAmount && data.paymentMethod) {
      payload.paymentAmount = membershipPaymentAmount;
      payload.paymentMethod = data.paymentMethod as PaymentMethod;
      payload.paymentReference = data.paymentReference;
      payload.paymentNotes = data.paymentNotes;
      payload.paymentDate = data.paymentDate;
    }

    createMembership.mutate(payload, {
      onSuccess: () => {
        if (data.addTraining && data.trainingPlanVariantId && data.trainerId) {
          const trainingPayload: CreateTrainingData = {
            memberId: data.memberId,
            planVariantId: data.trainingPlanVariantId,
            trainerId: data.trainerId,
            startDate: data.startDate,
            discountAmount: data.trainingDiscountAmount || 0,
            notes: data.trainingNotes,
          };
          if (trainingPaymentAmount && data.paymentMethod) {
            trainingPayload.paymentAmount = trainingPaymentAmount;
            trainingPayload.paymentMethod = data.paymentMethod as PaymentMethod;
            trainingPayload.paymentReference = data.paymentReference;
            trainingPayload.paymentNotes = data.paymentNotes;
            trainingPayload.paymentDate = data.paymentDate;
          }
          createTraining.mutate(trainingPayload, {
            onSuccess: () => { form.reset(); onSuccess?.(); },
            onError: () => { form.reset(); onSuccess?.(); },
          });
        } else {
          form.reset();
          onSuccess?.();
        }
      },
    });
  };

  const existingActiveMembership = activeMembershipResponse?.data;

  return (
    <div className="space-y-6">
      <FormStepIndicator steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />

      <Separator />

      <form onSubmit={(e) => e.preventDefault()}>
        {currentStepId === 'member' && (
          <MemberPicker
            members={filteredMembers}
            isLoading={membersLoading}
            selectedMemberId={selectedMemberId}
            search={memberSearch}
            onSearchChange={setMemberSearch}
            onSelect={(id) => form.setValue('memberId', id)}
            error={form.formState.errors.memberId?.message}
            activeWarning={existingActiveMembership ? { type: 'membership', item: existingActiveMembership } : null}
          />
        )}

        {currentStepId === 'plan' && (
          <div className="space-y-6 px-6 pb-6">
            <div>
              <h3 className="text-lg font-semibold">Choose a Plan</h3>
              <p className="text-sm text-muted-foreground">
                Select a plan type and duration for{' '}
                <span className="font-medium text-foreground">
                  {selectedMember?.firstName} {selectedMember?.lastName}
                </span>
                .
              </p>
            </div>
            <PlanTypePicker
              planTypes={planTypes}
              isLoading={planTypesLoading}
              selectedPlanTypeId={selectedPlanTypeId}
              onSelect={(id) => {
                form.setValue('planTypeId', id);
                form.setValue('planVariantId', '');
              }}
              error={form.formState.errors.planTypeId?.message}
            />
            {selectedPlanTypeId && (
              <PlanVariantPicker
                variants={planVariants}
                isLoading={variantsLoading}
                selectedVariantId={selectedPlanVariantId}
                onSelect={(id) => form.setValue('planVariantId', id)}
                error={form.formState.errors.planVariantId?.message}
              />
            )}
          </div>
        )}

        {currentStepId === 'details' && (
          <MembershipDetailsStep
            selectedVariant={selectedVariant}
            endDate={endDate}
            addTraining={addTraining}
            onToggleTraining={handleToggleTraining}
            register={form.register}
            watch={form.watch}
            setValue={form.setValue}
            errors={form.formState.errors as Record<string, { message?: string }>}
          />
        )}

        {currentStepId === 'training' && (
          <TrainingStep
            selectedMember={selectedMember}
            trainers={trainers}
            trainersLoading={trainersLoading}
            trainingPlanTypes={trainingPlanTypes}
            trainingPlanTypesLoading={trainingPlanTypesLoading}
            trainingPlanVariants={trainingPlanVariants}
            trainingVariantsLoading={trainingVariantsLoading}
            trainingPlanTypeId={trainingPlanTypeId}
            trainingPlanVariantId={trainingPlanVariantId}
            register={form.register}
            watch={form.watch}
            setValue={form.setValue}
            errors={form.formState.errors as Record<string, { message?: string }>}
          />
        )}

        {currentStepId === 'payment' && (
          <MembershipPaymentStep
            selectedMember={selectedMember}
            selectedPlanType={selectedPlanType}
            selectedVariant={selectedVariant}
            finalPrice={finalPrice}
            startDate={startDate}
            endDate={endDate}
            addTraining={addTraining}
            selectedTrainingVariant={selectedTrainingVariant}
            trainingPlanTypes={trainingPlanTypes}
            trainingPlanTypeId={trainingPlanTypeId}
            trainingFinalPrice={trainingFinalPrice}
            discountOffers={discountOffers}
            register={form.register}
            watch={form.watch}
            setValue={form.setValue}
            errors={form.formState.errors as Record<string, { message?: string }>}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <div>
            {currentStep > 0 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            ) : onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            ) : (
              <div />
            )}
          </div>

          <div>
            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={() => form.handleSubmit(onSubmit)()} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : addTraining ? (
                  'Create Membership & Training'
                ) : (
                  'Create Membership'
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

import { useState, useMemo } from 'react';
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
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useMembers } from '@/features/members/hooks/use-members';
import { usePlanTypes, usePlanTypesByCategory } from '@/features/plans/hooks/use-plan-types';
import { usePlanVariantsByType } from '@/features/plans/hooks/use-plan-variants';
import { useCreateMembership, useActiveMembership } from '../hooks/use-memberships';
import { useCreateTraining } from '@/features/training/hooks/use-training';
import type { CreateMembershipData, CreateTrainingData, PaymentMethod } from '@/shared/types/common.types';

const createMembershipSchema = z
  .object({
    memberId: z.string().min(1, 'Please select a member'),
    planTypeId: z.string().min(1, 'Please select a plan type'),
    planVariantId: z.string().min(1, 'Please select a plan variant'),
    startDate: z.string().min(1, 'Start date is required'),
    discountAmount: z.coerce.number().min(0, 'Discount cannot be negative').default(0),
    autoRenew: z.boolean().default(false),
    notes: z.string().optional(),
    collectPayment: z.boolean().default(false),
    paymentAmount: z.coerce.number().optional(),
    paymentMethod: z.string().optional(),
    paymentReference: z.string().optional(),
    paymentNotes: z.string().optional(),
    // Training fields
    addTraining: z.boolean().default(false),
    trainingPlanTypeId: z.string().optional(),
    trainingPlanVariantId: z.string().optional(),
    trainerName: z.string().optional(),
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
    {
      message: 'Payment amount and method are required when collecting payment',
      path: ['paymentAmount'],
    }
  )
  .refine(
    (data) => {
      if (data.addTraining) {
        return !!data.trainingPlanTypeId && !!data.trainingPlanVariantId && !!data.trainerName;
      }
      return true;
    },
    {
      message: 'Training plan, variant, and trainer name are required',
      path: ['trainerName'],
    }
  );

type CreateMembershipFormData = z.infer<typeof createMembershipSchema>;

interface CreateMembershipFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BASE_STEPS = [
  { id: 'member', label: 'Select Member', icon: User },
  { id: 'plan', label: 'Choose Plan', icon: Dumbbell },
  { id: 'details', label: 'Details', icon: CalendarDays },
  { id: 'payment', label: 'Payment', icon: CreditCard },
] as const;

const TRAINING_STEP = { id: 'training' as const, label: 'Training', icon: Dumbbell };

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

export function CreateMembershipForm({
  onSuccess,
  onCancel,
}: CreateMembershipFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [memberSearch, setMemberSearch] = useState('');

  const { data: membersResponse, isLoading: membersLoading } = useMembers();
  const { data: planTypes, isLoading: planTypesLoading } = usePlanTypesByCategory('membership');
  const { data: trainingPlanTypes, isLoading: trainingPlanTypesLoading } = usePlanTypesByCategory('training');
  const createMembership = useCreateMembership();
  const createTraining = useCreateTraining();

  const form = useForm<CreateMembershipFormData>({
    resolver: zodResolver(createMembershipSchema),
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
      discountAmount: 0,
      autoRenew: false,
      collectPayment: false,
      addTraining: false,
      trainingDiscountAmount: 0,
    },
  });

  const selectedPlanTypeId = form.watch('planTypeId');
  const selectedPlanVariantId = form.watch('planVariantId');
  const selectedMemberId = form.watch('memberId');
  const discountAmount = form.watch('discountAmount') || 0;
  const collectPayment = form.watch('collectPayment');
  const startDate = form.watch('startDate');
  const addTraining = form.watch('addTraining');
  const trainingPlanTypeId = form.watch('trainingPlanTypeId');
  const trainingPlanVariantId = form.watch('trainingPlanVariantId');

  // Dynamic steps based on addTraining toggle
  const steps = useMemo(() => {
    if (addTraining) {
      // Insert training step before payment (index 3)
      return [...BASE_STEPS.slice(0, 3), TRAINING_STEP, BASE_STEPS[3]];
    }
    return [...BASE_STEPS];
  }, [addTraining]);

  const { data: planVariants, isLoading: variantsLoading } =
    usePlanVariantsByType(selectedPlanTypeId, false);

  const { data: trainingPlanVariants, isLoading: trainingVariantsLoading } =
    usePlanVariantsByType(trainingPlanTypeId || '', false);

  const { data: activeMembershipResponse } = useActiveMembership(
    selectedMemberId || ''
  );
  const existingActiveMembership = activeMembershipResponse?.data;

  const members = membersResponse?.data ?? [];
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
  const selectedVariant = planVariants?.find(
    (v) => v.id === selectedPlanVariantId
  );
  const finalPrice = selectedVariant
    ? Math.max(0, selectedVariant.price - discountAmount)
    : 0;

  const selectedTrainingVariant = trainingPlanVariants?.find(
    (v) => v.id === trainingPlanVariantId
  );

  const endDate = useMemo(() => {
    if (!startDate || !selectedVariant) return null;
    const start = new Date(startDate);
    start.setDate(start.getDate() + selectedVariant.durationDays);
    return start.toISOString().split('T')[0];
  }, [startDate, selectedVariant]);

  // Get the current step ID
  const currentStepId = steps[currentStep]?.id;

  const canProceed = () => {
    switch (currentStepId) {
      case 'member':
        return !!selectedMemberId;
      case 'plan':
        return !!selectedPlanTypeId && !!selectedPlanVariantId;
      case 'details':
        return !!startDate;
      case 'training':
        return !!trainingPlanTypeId && !!trainingPlanVariantId && !!form.watch('trainerName');
      case 'payment':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceed()) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  // When toggling addTraining, adjust currentStep if needed
  const handleToggleTraining = (checked: boolean) => {
    form.setValue('addTraining', checked);
    if (!checked) {
      // If we're currently on the training step, go back
      if (currentStepId === 'training') {
        setCurrentStep((s) => s - 1);
      }
      // If we're on payment and training was on (payment was at index 4), adjust
      if (currentStepId === 'payment' && currentStep === 4) {
        setCurrentStep(3);
      }
      // Clear training fields
      form.setValue('trainingPlanTypeId', '');
      form.setValue('trainingPlanVariantId', '');
      form.setValue('trainerName', '');
      form.setValue('trainingDiscountAmount', 0);
      form.setValue('trainingNotes', '');
    }
  };

  const isSubmitting = createMembership.isPending || createTraining.isPending;

  const onSubmit = (data: CreateMembershipFormData) => {
    const payload: CreateMembershipData = {
      memberId: data.memberId,
      planVariantId: data.planVariantId,
      startDate: data.startDate,
      discountAmount: data.discountAmount || 0,
      autoRenew: data.autoRenew,
      notes: data.notes,
    };

    if (data.collectPayment && data.paymentAmount && data.paymentMethod) {
      payload.paymentAmount = data.paymentAmount;
      payload.paymentMethod = data.paymentMethod as PaymentMethod;
      payload.paymentReference = data.paymentReference;
      payload.paymentNotes = data.paymentNotes;
    }

    createMembership.mutate(payload, {
      onSuccess: () => {
        // If training is enabled, create it after membership
        if (data.addTraining && data.trainingPlanVariantId && data.trainerName) {
          const trainingPayload: CreateTrainingData = {
            memberId: data.memberId,
            planVariantId: data.trainingPlanVariantId,
            trainerName: data.trainerName,
            startDate: data.startDate,
            discountAmount: data.trainingDiscountAmount || 0,
            notes: data.trainingNotes,
          };

          createTraining.mutate(trainingPayload, {
            onSuccess: () => {
              form.reset();
              onSuccess?.();
            },
          });
        } else {
          form.reset();
          onSuccess?.();
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <nav aria-label="Progress" className="px-6 pt-6">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <li
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (index < currentStep) setCurrentStep(index);
                  }}
                  disabled={index > currentStep}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'text-muted-foreground'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      isCurrent
                        ? 'bg-primary-foreground/20'
                        : isCompleted
                          ? 'bg-primary/20'
                          : 'bg-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 hidden h-px flex-1 sm:block ${
                      isCompleted ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <Separator />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Step: Select Member */}
        {currentStepId === 'member' && (
          <div className="space-y-4 px-6 pb-6">
            <div>
              <h3 className="text-lg font-semibold">Select a Member</h3>
              <p className="text-sm text-muted-foreground">
                Choose the member who will receive this membership.
              </p>
            </div>

            <Input
              placeholder="Search by name, email, or phone..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />

            {membersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No members found. Try a different search term.
              </p>
            ) : (
              <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-1">
                {filteredMembers.map((member) => (
                  <Card
                    key={member.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      selectedMemberId === member.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : ''
                    }`}
                    onClick={() => form.setValue('memberId', member.id)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={member.isActive ? 'default' : 'secondary'}
                        >
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {selectedMemberId === member.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {form.formState.errors.memberId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.memberId.message}
              </p>
            )}

            {/* Active membership warning */}
            {selectedMemberId && existingActiveMembership && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-400">
                    This member already has an active membership
                  </p>
                  <p className="text-amber-700 dark:text-amber-500 mt-0.5">
                    {existingActiveMembership.planVariant?.planType?.name} -{' '}
                    {existingActiveMembership.planVariant?.durationLabel} (expires{' '}
                    {new Date(existingActiveMembership.endDate).toLocaleDateString(
                      'en-IN',
                      { day: 'numeric', month: 'short', year: 'numeric' }
                    )}
                    ). Creating another will result in overlapping memberships.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Choose Plan */}
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

            {/* Plan Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Plan Type</Label>
              {planTypesLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {planTypes?.map((planType) => (
                    <Card
                      key={planType.id}
                      className={`cursor-pointer transition-all hover:border-primary/50 ${
                        selectedPlanTypeId === planType.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : ''
                      }`}
                      onClick={() => {
                        form.setValue('planTypeId', planType.id);
                        form.setValue('planVariantId', '');
                      }}
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
              )}
              {form.formState.errors.planTypeId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.planTypeId.message}
                </p>
              )}
            </div>

            {/* Plan Variant Selection */}
            {selectedPlanTypeId && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Duration & Pricing</Label>
                {variantsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : planVariants && planVariants.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {planVariants.map((variant) => (
                      <Card
                        key={variant.id}
                        className={`cursor-pointer transition-all hover:border-primary/50 ${
                          selectedPlanVariantId === variant.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : ''
                        }`}
                        onClick={() =>
                          form.setValue('planVariantId', variant.id)
                        }
                      >
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <p className="font-medium">
                              {variant.durationLabel}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {variant.durationDays} days
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">
                              <IndianRupee className="inline h-4 w-4" />
                              {variant.price.toLocaleString()}
                            </span>
                            {selectedPlanVariantId === variant.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No active variants available for this plan type.
                  </p>
                )}
                {form.formState.errors.planVariantId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.planVariantId.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step: Membership Details */}
        {currentStepId === 'details' && (
          <div className="space-y-6 px-6 pb-6">
            <div>
              <h3 className="text-lg font-semibold">Membership Details</h3>
              <p className="text-sm text-muted-foreground">
                Configure start date, discount, and other options.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...form.register('startDate')}
                />
                {form.formState.errors.startDate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-calculated from plan duration (
                  {selectedVariant?.durationDays} days)
                </p>
              </div>
            </div>

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
                  {...form.register('discountAmount')}
                />
              </div>
              {form.formState.errors.discountAmount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.discountAmount.message}
                </p>
              )}
            </div>

            {/* Price Summary */}
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
                      <span>Discount</span>
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
                </CardContent>
              </Card>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoRenew"
                checked={form.watch('autoRenew')}
                onCheckedChange={(checked) =>
                  form.setValue('autoRenew', checked === true)
                }
              />
              <Label htmlFor="autoRenew" className="text-sm font-normal">
                Auto-renew membership when it expires
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Any additional notes about this membership..."
                rows={3}
              />
            </div>

            <Separator />

            {/* Add Training Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="addTraining" className="text-sm font-medium">
                  Also assign training
                </Label>
                <p className="text-xs text-muted-foreground">
                  Optionally assign a personal training plan along with this membership.
                </p>
              </div>
              <Switch
                id="addTraining"
                checked={addTraining}
                onCheckedChange={handleToggleTraining}
              />
            </div>
          </div>
        )}

        {/* Step: Training (conditional) */}
        {currentStepId === 'training' && (
          <div className="space-y-6 px-6 pb-6">
            <div>
              <h3 className="text-lg font-semibold">Training Plan</h3>
              <p className="text-sm text-muted-foreground">
                Select a training plan and assign a trainer for{' '}
                <span className="font-medium text-foreground">
                  {selectedMember?.firstName} {selectedMember?.lastName}
                </span>
                .
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainerName">Trainer Name *</Label>
              <Input
                id="trainerName"
                placeholder="Enter trainer name"
                {...form.register('trainerName')}
              />
              {form.formState.errors.trainerName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.trainerName.message}
                </p>
              )}
            </div>

            {/* Training Plan Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Training Plan Type</Label>
              {trainingPlanTypesLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : trainingPlanTypes && trainingPlanTypes.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {trainingPlanTypes.map((planType) => (
                    <Card
                      key={planType.id}
                      className={`cursor-pointer transition-all hover:border-primary/50 ${
                        trainingPlanTypeId === planType.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : ''
                      }`}
                      onClick={() => {
                        form.setValue('trainingPlanTypeId', planType.id);
                        form.setValue('trainingPlanVariantId', '');
                      }}
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
                        {trainingPlanTypeId === planType.id && (
                          <Check className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No training plan types available. Please create a training plan type first.
                </p>
              )}
            </div>

            {/* Training Variant Selection */}
            {trainingPlanTypeId && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Duration & Pricing</Label>
                {trainingVariantsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : trainingPlanVariants && trainingPlanVariants.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {trainingPlanVariants.map((variant) => (
                      <Card
                        key={variant.id}
                        className={`cursor-pointer transition-all hover:border-primary/50 ${
                          trainingPlanVariantId === variant.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : ''
                        }`}
                        onClick={() =>
                          form.setValue('trainingPlanVariantId', variant.id)
                        }
                      >
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <p className="font-medium">{variant.durationLabel}</p>
                            <p className="text-xs text-muted-foreground">
                              {variant.durationDays} days
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">
                              <IndianRupee className="inline h-4 w-4" />
                              {variant.price.toLocaleString()}
                            </span>
                            {trainingPlanVariantId === variant.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No active variants available for this training plan type.
                  </p>
                )}
              </div>
            )}

            {/* Training discount */}
            <div className="space-y-2">
              <Label htmlFor="trainingDiscountAmount">Training Discount</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="trainingDiscountAmount"
                  type="number"
                  min={0}
                  max={selectedTrainingVariant?.price || 0}
                  className="pl-9"
                  {...form.register('trainingDiscountAmount')}
                />
              </div>
            </div>

            {/* Training price summary */}
            {selectedTrainingVariant && (
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Training Price</span>
                    <span>
                      <IndianRupee className="inline h-3 w-3" />
                      {selectedTrainingVariant.price.toLocaleString()}
                    </span>
                  </div>
                  {(form.watch('trainingDiscountAmount') || 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>
                        - <IndianRupee className="inline h-3 w-3" />
                        {(form.watch('trainingDiscountAmount') || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Training Final Price</span>
                    <span>
                      <IndianRupee className="inline h-3.5 w-3.5" />
                      {Math.max(0, selectedTrainingVariant.price - (form.watch('trainingDiscountAmount') || 0)).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="trainingNotes">Training Notes</Label>
              <Textarea
                id="trainingNotes"
                {...form.register('trainingNotes')}
                placeholder="Any additional notes about this training..."
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Step: Payment */}
        {currentStepId === 'payment' && (
          <div className="space-y-6 px-6 pb-6">
            <div>
              <h3 className="text-lg font-semibold">Payment</h3>
              <p className="text-sm text-muted-foreground">
                Optionally record an initial payment for this membership.
              </p>
            </div>

            {/* Summary Card */}
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold text-sm">Membership Summary</h4>
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
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-medium">
                      {startDate} to {endDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount Due: </span>
                    <span className="font-bold">
                      <IndianRupee className="inline h-3 w-3" />
                      {finalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {addTraining && selectedTrainingVariant && (
                  <>
                    <Separator />
                    <h4 className="font-semibold text-sm">Training</h4>
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <span className="text-muted-foreground">Trainer: </span>
                        <span className="font-medium">{form.watch('trainerName')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Training Plan: </span>
                        <span className="font-medium">
                          {trainingPlanTypes?.find(p => p.id === trainingPlanTypeId)?.name} - {selectedTrainingVariant.durationLabel}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Training Amount: </span>
                        <span className="font-bold">
                          <IndianRupee className="inline h-3 w-3" />
                          {Math.max(0, selectedTrainingVariant.price - (form.watch('trainingDiscountAmount') || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="collectPayment"
                checked={collectPayment}
                onCheckedChange={(checked) =>
                  form.setValue('collectPayment', checked === true)
                }
              />
              <Label htmlFor="collectPayment" className="text-sm font-normal">
                Record initial payment now
              </Label>
            </div>

            {collectPayment && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Payment Amount *</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="paymentAmount"
                        type="number"
                        min={0}
                        className="pl-9"
                        defaultValue={finalPrice}
                        {...form.register('paymentAmount')}
                      />
                    </div>
                    {form.formState.errors.paymentAmount && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.paymentAmount.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select
                      value={form.watch('paymentMethod') || ''}
                      onValueChange={(value) =>
                        form.setValue('paymentMethod', value)
                      }
                    >
                      <SelectTrigger id="paymentMethod">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentReference">
                    Payment Reference / Transaction ID
                  </Label>
                  <Input
                    id="paymentReference"
                    {...form.register('paymentReference')}
                    placeholder="e.g., UPI transaction ID, cheque number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentNotes">Payment Notes</Label>
                  <Textarea
                    id="paymentNotes"
                    {...form.register('paymentNotes')}
                    placeholder="Any notes about this payment..."
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
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
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            ) : (
              <div />
            )}
          </div>

          <div>
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  addTraining ? 'Create Membership & Training' : 'Create Membership'
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

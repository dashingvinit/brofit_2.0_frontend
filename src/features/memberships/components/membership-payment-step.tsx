import { IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { PaymentFields } from '@/shared/components/payment-fields';
import type { Member, PlanType, PlanVariant, Training } from '@/shared/types/common.types';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: UseFormWatch<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  errors?: Record<string, { message?: string }>;
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
  register,
  watch,
  setValue,
  errors = {},
}: MembershipPaymentStepProps) {
  const collectPayment = watch('collectPayment');

  return (
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
                  <span className="text-muted-foreground">Training Plan: </span>
                  <span className="font-medium">
                    {trainingPlanTypes?.find((p) => p.id === trainingPlanTypeId)?.name} -{' '}
                    {selectedTrainingVariant.durationLabel}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Training Amount: </span>
                  <span className="font-bold">
                    <IndianRupee className="inline h-3 w-3" />
                    {trainingFinalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <PaymentFields
        collectPayment={collectPayment}
        defaultAmount={finalPrice}
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
      />
    </div>
  );
}

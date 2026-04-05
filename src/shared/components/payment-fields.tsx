import { useEffect } from 'react';
import { IndianRupee } from 'lucide-react';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { PAYMENT_METHODS } from '@/shared/constants/payment';
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';

interface PaymentFieldsProps {
  collectPayment: boolean;
  defaultAmount?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: UseFormWatch<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  errors?: Record<string, { message?: string }>;
}

export function PaymentFields({
  collectPayment,
  defaultAmount,
  register,
  watch,
  setValue,
  errors = {},
}: PaymentFieldsProps) {
  useEffect(() => {
    if (collectPayment && defaultAmount !== undefined) {
      setValue('paymentAmount', defaultAmount);
    }
  }, [collectPayment, defaultAmount, setValue]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="collectPayment"
          checked={collectPayment}
          onCheckedChange={(checked) => setValue('collectPayment', checked === true)}
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
                  {...register('paymentAmount')}
                  aria-invalid={!!errors.paymentAmount}
                  aria-describedby={errors.paymentAmount ? 'paymentAmount-error' : undefined}
                />
              </div>
              {errors.paymentAmount && (
                <p id="paymentAmount-error" className="text-sm text-destructive">
                  {errors.paymentAmount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={watch('paymentMethod') || ''}
                onValueChange={(value) => setValue('paymentMethod', value)}
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
            <Label htmlFor="paymentDate">Payment Date *</Label>
            <Input id="paymentDate" type="date" {...register('paymentDate')} />
            <p className="text-xs text-muted-foreground">
              When was this payment actually received?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentReference">Payment Reference / Transaction ID</Label>
            <Input
              id="paymentReference"
              {...register('paymentReference')}
              placeholder="e.g., UPI transaction ID, cheque number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentNotes">Payment Notes</Label>
            <Textarea
              id="paymentNotes"
              {...register('paymentNotes')}
              placeholder="Any notes about this payment..."
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

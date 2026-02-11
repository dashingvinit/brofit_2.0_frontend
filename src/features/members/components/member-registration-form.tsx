import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useMemberRegistration } from "../hooks/use-member-registration";
import { useMembershipPlans } from "../hooks/use-membership-plans";
import { useTrainers } from "../hooks/use-trainers";
import { LoadingSpinner } from "@/shared/components/loading-spinner";

const memberRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format").or(z.literal("")),
  phone: z.string().optional(),
  planId: z.string().min(1, "Membership plan is required"),
  trainerId: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  amountPaid: z.string().min(1, "Amount is required"),
});

type MemberRegistrationFormData = z.infer<typeof memberRegistrationSchema>;

interface MemberRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MemberRegistrationForm({
  onSuccess,
  onCancel,
}: MemberRegistrationFormProps) {
  const { data: plans, isLoading: plansLoading } = useMembershipPlans();
  const { data: trainers, isLoading: trainersLoading } = useTrainers();
  const registerMember = useMemberRegistration();

  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>("");

  const form = useForm<MemberRegistrationFormData>({
    resolver: zodResolver(memberRegistrationSchema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = (data: MemberRegistrationFormData) => {
    registerMember.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        planId: data.planId,
        trainerId: data.trainerId,
        startDate: new Date(data.startDate),
        amountPaid: parseFloat(data.amountPaid),
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  if (plansLoading || trainersLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">
          No active membership plans available. Please create plans first.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            {...form.register("firstName")}
            placeholder="John"
          />
          {form.formState.errors.firstName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            {...form.register("lastName")}
            placeholder="Doe"
          />
          {form.formState.errors.lastName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (Optional)</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          placeholder="john.doe@example.com"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          {...form.register("phone")}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="trainerId">Assign Trainer (Optional)</Label>
        <Select
          value={selectedTrainerId}
          onValueChange={(value) => {
            setSelectedTrainerId(value);
            form.setValue("trainerId", value);
          }}
        >
          <SelectTrigger id="trainerId">
            <SelectValue placeholder="Select a trainer (optional)" />
          </SelectTrigger>
          <SelectContent>
            {trainers && trainers.length > 0 ? (
              trainers.map((trainer) => (
                <SelectItem key={trainer.id} value={trainer.id}>
                  {trainer.firstName} {trainer.lastName}
                  {trainer.email && ` (${trainer.email})`}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-trainers" disabled>
                No trainers available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {form.formState.errors.trainerId && (
          <p className="text-sm text-destructive">
            {form.formState.errors.trainerId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="planId">Membership Plan</Label>
        <Select
          value={selectedPlanId}
          onValueChange={(value) => {
            setSelectedPlanId(value);
            form.setValue("planId", value);
            const plan = plans.find((p) => p.id === value);
            if (plan) {
              form.setValue("amountPaid", plan.price.toString());
            }
          }}
        >
          <SelectTrigger id="planId">
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name} - ${plan.price} ({plan.durationDays} days)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.planId && (
          <p className="text-sm text-destructive">
            {form.formState.errors.planId.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" {...form.register("startDate")} />
          {form.formState.errors.startDate && (
            <p className="text-sm text-destructive">
              {form.formState.errors.startDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amountPaid">Amount Paid</Label>
          <Input
            id="amountPaid"
            type="number"
            step="0.01"
            {...form.register("amountPaid")}
            placeholder="0.00"
          />
          {form.formState.errors.amountPaid && (
            <p className="text-sm text-destructive">
              {form.formState.errors.amountPaid.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={registerMember.isPending}>
          {registerMember.isPending ? "Registering..." : "Register Member"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={registerMember.isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

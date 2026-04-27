import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useMemberRegistration } from "../hooks/use-member-registration";
import type { CreateMemberData } from "@/shared/types/common.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

const memberRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal(""))
    .transform((val) => val || ""),
  phone: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  joinDate: z.string().min(1, "Join date is required"),
  notes: z.string().optional(),
});

type MemberRegistrationFormData = z.infer<typeof memberRegistrationSchema>;

interface MemberRegistrationFormProps {
  onSuccess?: (memberId: string) => void;
  onCancel?: () => void;
}

export function MemberRegistrationForm({
  onSuccess,
  onCancel,
}: MemberRegistrationFormProps) {
  const { createMemberAsync, isLoading } = useMemberRegistration();
  const [gender, setGender] = useState<string>("");
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const generatedEmailRef = useRef("");

  const form = useForm<MemberRegistrationFormData>({
    resolver: zodResolver(memberRegistrationSchema),
    defaultValues: {
      dateOfBirth: "2008-01-01",
      joinDate: new Date().toISOString().split("T")[0],
      email: "",
    },
  });

  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");

  useEffect(() => {
    if (firstName && lastName) {
      const sanitize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
      const generatedEmail = `${sanitize(firstName)}.${sanitize(lastName)}@dummy.com`;
      const currentEmail = form.getValues("email");

      if (!currentEmail || currentEmail === generatedEmailRef.current) {
        form.setValue("email", generatedEmail);
      }

      generatedEmailRef.current = generatedEmail;
    }
  }, [firstName, lastName, form]);

  const onSubmit = (data: MemberRegistrationFormData, bypass = false) => {
    const memberData: CreateMemberData = {
      firstName: data.firstName,
      middleName: data.middleName || undefined,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      joinDate: data.joinDate,
      notes: data.notes,
      bypassDuplicateCheck: bypass,
    };

    createMemberAsync(memberData)
      .then((response) => {
        form.reset();
        onSuccess?.(response.data.id);
      })
      .catch((error) => {
        if (error.response?.status === 409) {
          setDuplicateError(error.response.data.message);
        }
      });
  };

  return (
    <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...form.register("firstName")}
            placeholder="John"
            aria-invalid={!!form.formState.errors.firstName}
            aria-describedby={
              form.formState.errors.firstName ? "firstName-error" : undefined
            }
          />
          {form.formState.errors.firstName && (
            <p id="firstName-error" className="text-sm text-destructive">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            {...form.register("middleName")}
            placeholder="(optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            {...form.register("lastName")}
            placeholder="Doe"
            aria-invalid={!!form.formState.errors.lastName}
            aria-describedby={
              form.formState.errors.lastName ? "lastName-error" : undefined
            }
          />
          {form.formState.errors.lastName && (
            <p id="lastName-error" className="text-sm text-destructive">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          placeholder="john.doe@dummy.com"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          {...form.register("phone")}
          placeholder="+1 (555) 123-4567"
          aria-invalid={!!form.formState.errors.phone}
          aria-describedby={
            form.formState.errors.phone ? "phone-error" : undefined
          }
        />
        {form.formState.errors.phone && (
          <p id="phone-error" className="text-sm text-destructive">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...form.register("dateOfBirth")}
            max={new Date().toISOString().split("T")[0]}
            aria-invalid={!!form.formState.errors.dateOfBirth}
            aria-describedby={
              form.formState.errors.dateOfBirth
                ? "dateOfBirth-error"
                : undefined
            }
          />
          {form.formState.errors.dateOfBirth && (
            <p id="dateOfBirth-error" className="text-sm text-destructive">
              {form.formState.errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select
            value={gender}
            onValueChange={(value) => {
              setGender(value);
              form.setValue("gender", value);
            }}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.gender && (
            <p className="text-sm text-destructive">
              {form.formState.errors.gender.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="joinDate">Join Date *</Label>
        <Input
          id="joinDate"
          type="date"
          {...form.register("joinDate")}
          aria-invalid={!!form.formState.errors.joinDate}
          aria-describedby={
            form.formState.errors.joinDate ? "joinDate-error" : undefined
          }
        />
        {form.formState.errors.joinDate && (
          <p id="joinDate-error" className="text-sm text-destructive">
            {form.formState.errors.joinDate.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...form.register("notes")}
          placeholder="Any additional information about this member..."
          rows={4}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register Member"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>


      <AlertDialog open={!!duplicateError} onOpenChange={(open) => !open && setDuplicateError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Possible Duplicate Member</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>{duplicateError}</p>
                <p>
                  Is this a new member (e.g. family member sharing a phone) or did you mean to use the existing record?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const values = form.getValues();
                onSubmit(values, true);
              }}
            >
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

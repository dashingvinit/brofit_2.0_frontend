import { CreditCard, Calendar, DollarSign } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import type { MembershipPlan } from "@/shared/types/common.types";
import { useDeactivateMembershipPlan } from "../hooks/use-membership-plan-management";

interface MembershipPlansListProps {
  plans?: MembershipPlan[];
  isLoading?: boolean;
}

export function MembershipPlansList({
  plans,
  isLoading,
}: MembershipPlansListProps) {
  const deactivatePlan = useDeactivateMembershipPlan();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No membership plans yet</h3>
        <p className="text-muted-foreground mt-2">
          Create your first membership plan to get started
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                )}
              </div>
              <Badge variant={plan.isActive ? "default" : "secondary"}>
                {plan.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">${plan.price}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{plan.durationDays} days</span>
              </div>
            </div>

            {plan.features && plan.features.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {plan.isActive && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => deactivatePlan.mutate(plan.id)}
                disabled={deactivatePlan.isPending}
              >
                Deactivate
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

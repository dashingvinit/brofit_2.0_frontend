import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { PageHeader } from '@/shared/components/page-header';
import { MembershipPlansList } from '../components/membership-plans-list';
import { MembershipPlanForm } from '../components/membership-plan-form';
import { useAllMembershipPlans } from '../hooks/use-membership-plan-management';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

export function MembershipPlansPage() {
  const { data: plans, isLoading } = useAllMembershipPlans();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSuccess = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membership Plans"
        description="Create and manage your gym membership plans"
        actions={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        }
      />

      <MembershipPlansList plans={plans} isLoading={isLoading} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Membership Plan</DialogTitle>
          </DialogHeader>
          <MembershipPlanForm
            onSuccess={handleSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/shared/components/ui/card';
import { PageHeader } from '@/shared/components/page-header';
import { CreateMembershipForm } from '../components/create-membership-form';
import { ROUTES } from '@/shared/lib/constants';

export function CreateMembershipPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedMemberId = searchParams.get('memberId') ?? undefined;

  const handleSuccess = () => {
    navigate(ROUTES.MEMBERSHIPS || '/memberships');
  };

  const handleCancel = () => {
    navigate(ROUTES.MEMBERSHIPS || '/memberships');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Create New Membership"
        description="Assign a membership plan to a member with optional payment recording."
      />

      <Card className="max-w-4xl">
        <CreateMembershipForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          preselectedMemberId={preselectedMemberId}
        />
      </Card>
    </div>
  );
}

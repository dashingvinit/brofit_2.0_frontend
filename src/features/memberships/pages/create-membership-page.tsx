import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/shared/components/ui/card';
import { PageHeader } from '@/shared/components/page-header';
import { CreateMembershipForm } from '../components/create-membership-form';
import { ROUTES } from '@/shared/lib/constants';
import { useReturnTo } from '@/shared/hooks/use-return-to';

export function CreateMembershipPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedMemberId = searchParams.get('memberId') ?? undefined;

  const returnTo = useReturnTo(
    preselectedMemberId ? `${ROUTES.MEMBERS}/${preselectedMemberId}` : ROUTES.MEMBERSHIPS
  );
  const goBack = () => navigate(returnTo);

  const handleSuccess = (membershipId?: string) => {
    if (membershipId) {
      navigate(`${ROUTES.MEMBERSHIPS}/${membershipId}/receipt`, { state: { from: returnTo } });
    } else {
      goBack();
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Create New Membership"
        description="Assign a membership plan to a member with optional payment recording."
      />

      <Card>
        <CreateMembershipForm
          onSuccess={handleSuccess}
          onCancel={goBack}
          preselectedMemberId={preselectedMemberId}
        />
      </Card>
    </div>
  );
}

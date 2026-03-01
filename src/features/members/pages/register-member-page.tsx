import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/components/ui/card';
import { PageHeader } from '@/shared/components/page-header';
import { MemberRegistrationForm } from '../components/member-registration-form';
import { ROUTES } from '@/shared/lib/constants';

export function RegisterMemberPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(ROUTES.MEMBERS || '/members');
  };

  const handleCancel = () => {
    navigate(ROUTES.MEMBERS || '/members');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Register New Member"
        description="Add a new member to your gym. Membership and training plans can be assigned separately."
      />

      <Card className="max-w-3xl">
        <MemberRegistrationForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  );
}

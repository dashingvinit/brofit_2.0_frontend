import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/shared/components/ui/card';
import { PageHeader } from '@/shared/components/page-header';
import { CreateTrainingForm } from '../components/create-training-form';
import { ROUTES } from '@/shared/lib/constants';
import { useReturnTo } from '@/shared/hooks/use-return-to';

export function CreateTrainingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedMemberId = searchParams.get('memberId') ?? undefined;

  const returnTo = useReturnTo(
    preselectedMemberId ? `${ROUTES.MEMBERS}/${preselectedMemberId}` : ROUTES.TRAININGS
  );
  const goBack = () => navigate(returnTo);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Create New Training"
        description="Assign a training plan to a member with a trainer and optional payment recording."
      />

      <Card className="max-w-4xl">
        <CreateTrainingForm
          onSuccess={goBack}
          onCancel={goBack}
          preselectedMemberId={preselectedMemberId}
        />
      </Card>
    </div>
  );
}

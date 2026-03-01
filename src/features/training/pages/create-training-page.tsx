import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/shared/components/ui/card';
import { PageHeader } from '@/shared/components/page-header';
import { CreateTrainingForm } from '../components/create-training-form';
import { ROUTES } from '@/shared/lib/constants';

export function CreateTrainingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedMemberId = searchParams.get('memberId') ?? undefined;

  const handleSuccess = () => {
    navigate(ROUTES.TRAININGS || '/trainings');
  };

  const handleCancel = () => {
    navigate(ROUTES.TRAININGS || '/trainings');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Create New Training"
        description="Assign a training plan to a member with a trainer and optional payment recording."
      />

      <Card className="max-w-4xl">
        <CreateTrainingForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          preselectedMemberId={preselectedMemberId}
        />
      </Card>
    </div>
  );
}

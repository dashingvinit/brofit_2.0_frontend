import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { PageHeader } from '@/shared/components/page-header';
import { MembersList } from '../components/members-list';
import { useMembers } from '../hooks/use-members';
import { ROUTES } from '@/shared/lib/constants';

export function MembersListPage() {
  const navigate = useNavigate();
  const { data: members, isLoading } = useMembers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Manage your gym members"
        actions={
          <Button onClick={() => navigate(ROUTES.REGISTER_MEMBER || '/members/register')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        }
      />

      <MembersList members={members} isLoading={isLoading} />
    </div>
  );
}

import { useUser } from '@clerk/clerk-react';
import { Card } from '@/shared/components/ui/card';
import { PageHeader } from '@/shared/components/page-header';

export function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.firstName || 'User'}!`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Members</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Active Memberships</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Trainers</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <p className="text-muted-foreground">
          Your dashboard is ready! More features coming soon.
        </p>
      </Card>
    </div>
  );
}

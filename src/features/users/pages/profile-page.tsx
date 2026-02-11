import { useUser } from '@clerk/clerk-react';
import { Card } from '@/shared/components/ui/card';
import { PageHeader } from '@/shared/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';

export function ProfilePage() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account settings" />

      <Card className="p-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
            <AvatarFallback className="text-2xl">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{user?.fullName}</h2>
            <p className="text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <dl className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{user?.primaryEmailAddress?.emailAddress}</dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{user?.fullName}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-muted-foreground">Member Since</dt>
            <dd className="font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '--'}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

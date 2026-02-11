import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { ROUTES } from '@/shared/lib/constants';

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl font-bold">Welcome to Brofit 2.0</h1>
        <p className="text-xl text-muted-foreground">
          The ultimate gym management platform for trainers, members, and administrators.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to={ROUTES.SIGN_UP}>
            <Button size="lg">Get Started</Button>
          </Link>
          <Link to={ROUTES.SIGN_IN}>
            <Button size="lg" variant="outline">Sign In</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">For Members</h3>
            <p className="text-muted-foreground">Track your fitness journey and connect with trainers</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">For Trainers</h3>
            <p className="text-muted-foreground">Manage your clients and training programs</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">For Admins</h3>
            <p className="text-muted-foreground">Oversee operations and membership plans</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

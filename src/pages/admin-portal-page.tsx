import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { ROUTES } from '@/shared/lib/constants';
import { Dumbbell, LogIn, UserPlus, ArrowLeft, ShieldCheck } from 'lucide-react';

export function AdminPortalPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground text-sm">
            Manage members, plans, trainers, and gym operations.
          </p>
        </div>

        <div className="space-y-3">
          <Link to={ROUTES.SIGN_IN} className="block">
            <Button size="lg" className="w-full gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
          <Link to={ROUTES.SIGN_UP} className="block">
            <Button size="lg" variant="outline" className="w-full gap-2">
              <UserPlus className="h-4 w-4" />
              Sign Up
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Home
          </Link>
        </div>
      </Card>

      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Dumbbell className="h-4 w-4" />
        <span>Brofit 2.0</span>
      </div>
    </div>
  );
}

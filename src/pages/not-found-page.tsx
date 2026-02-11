import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/lib/constants';

export function NotFoundPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <Link to={ROUTES.HOME}>
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}

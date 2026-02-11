import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/lib/constants';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="text-2xl font-bold">
            Brofit 2.0
          </Link>
          <nav className="flex items-center gap-4">
            <Link to={ROUTES.SIGN_IN}>
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to={ROUTES.SIGN_UP}>
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 Brofit 2.0. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

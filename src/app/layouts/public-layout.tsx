import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '@/shared/lib/constants';
import { ThemeToggle } from '@/shared/components/theme-toggle';
import { Dumbbell } from 'lucide-react';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-2xl font-bold"
          >
            <Dumbbell className="h-6 w-6 text-primary" />
            Brofit 2.0
          </Link>
          <nav className="flex items-center gap-2">
            <a
              href="#facilities"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 hidden sm:inline-flex"
            >
              Facilities
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-1">
          <p className="font-medium">Brofit 2.0 — Train Hard, Stay Humble</p>
          <p>&copy; 2026 Brofit 2.0. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

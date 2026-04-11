import { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { ThemeProvider } from '@/shared/components/theme-provider';
import { Toaster } from '@/shared/components/ui/sonner';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvider>
          {children}
          <Toaster richColors closeButton />
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

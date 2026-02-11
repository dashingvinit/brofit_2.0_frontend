import { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { ThemeProvider } from '@/shared/components/theme-provider';

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
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  /** @deprecated Use title instead */
  message?: string;
}

export function EmptyState({ icon, title, description, action, className, message }: EmptyStateProps) {
  // Backwards-compat: if only message is passed (old usage), render the simple form
  if (message && !description && !icon && !action) {
    return (
      <p className={cn('text-sm text-muted-foreground text-center py-6', className)}>
        {message}
      </p>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-16', className)}>
      {icon && (
        <div className="rounded-full bg-muted p-4 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-1">{title ?? message}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}

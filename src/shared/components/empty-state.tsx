import { cn } from "@/shared/lib/utils";

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <p
      className={cn(
        "text-sm text-muted-foreground text-center py-6",
        className,
      )}
    >
      {message}
    </p>
  );
}

import { IndianRupee } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { formatCurrency } from "@/shared/lib/utils";

export interface StatCardProps {
  label: string;
  shortLabel: string;
  value: number | undefined;
  subtext?: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  isLoading: boolean;
  isCurrency?: boolean;
  /** Makes the card clickable and shows a selected ring when true */
  isSelected?: boolean;
  onClick?: () => void;
  animationDelay?: number;
  /** Masks the value and subtext with dots for privacy */
  hidden?: boolean;
}

export function StatCard({
  label,
  shortLabel,
  value,
  subtext,
  icon: Icon,
  colorClass,
  bgClass,
  isLoading,
  isCurrency,
  isSelected,
  onClick,
  animationDelay = 0,
  hidden = false,
}: StatCardProps) {
  const delayClass =
    animationDelay === 0
      ? "delay-0"
      : animationDelay <= 75
        ? "delay-75"
        : animationDelay <= 100
          ? "delay-100"
          : animationDelay <= 150
            ? "delay-150"
            : animationDelay <= 200
              ? "delay-200"
              : "delay-300";

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-3 lg:hidden">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-5 w-10" />
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-md animate-in fade-in zoom-in-95",
        `duration-300 fill-mode-both ${delayClass}`,
        onClick && "cursor-pointer",
        isSelected && "ring-2 ring-primary",
      )}
    >
      {/* Compact layout on mobile */}
      <div className="p-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className={cn("rounded-lg p-2 shrink-0", bgClass)}>
            <Icon className={cn("h-4 w-4", colorClass)} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground leading-tight truncate">
              {shortLabel}
            </p>
            <p className="text-lg font-bold leading-tight tracking-tight font-display">
              {hidden ? (
                <span className="tracking-widest text-muted-foreground">••••</span>
              ) : isCurrency ? (
                <span className="inline-flex items-center">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {formatCurrency(value ?? 0)}
                </span>
              ) : (
                value ?? 0
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Full layout on desktop */}
      <div className="hidden lg:block">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <div className={cn("rounded-lg p-2", bgClass)}>
            <Icon className={cn("h-4 w-4", colorClass)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight font-display">
            {hidden ? (
              <span className="tracking-widest text-muted-foreground">••••</span>
            ) : isCurrency ? (
              <span className="inline-flex items-center">
                <IndianRupee className="h-5 w-5" />
                {formatCurrency(value ?? 0)}
              </span>
            ) : (
              value ?? 0
            )}
          </div>
          {!hidden && subtext && (
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

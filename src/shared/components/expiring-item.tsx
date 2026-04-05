import { AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { daysUntil } from "@/shared/lib/utils";

export interface ExpiringItemProps {
  name: string;
  plan: string;
  endDate: string;
  type: "membership" | "training";
  onClick: () => void;
}

export function ExpiringItem({ name, plan, endDate, type, onClick }: ExpiringItemProps) {
  const days = daysUntil(endDate);
  const urgent = days <= 2;

  // Use different icons so urgency is not communicated by color alone
  const UrgencyIcon = urgent ? AlertTriangle : Clock;

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`rounded-full p-1.5 shrink-0 ${
            urgent
              ? "bg-red-100 dark:bg-red-950/50"
              : "bg-amber-100 dark:bg-amber-950/50"
          }`}
        >
          <UrgencyIcon
            className={`h-3.5 w-3.5 ${
              urgent
                ? "text-red-600 dark:text-red-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{plan}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <Badge
          variant={type === "membership" ? "default" : "secondary"}
          className="text-[10px] px-1.5 hidden sm:inline-flex"
        >
          {type === "membership" ? "Membership" : "Training"}
        </Badge>
        <span
          className={`text-xs font-medium whitespace-nowrap ${
            urgent
              ? "text-red-600 dark:text-red-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
        </span>
      </div>
    </div>
  );
}

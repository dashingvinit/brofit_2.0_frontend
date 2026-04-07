import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAttendancePeakHours } from "../hooks/use-attendance";

function hourLabel(hour: number) {
  if (hour === 0) return "12a";
  if (hour < 12) return `${hour}a`;
  if (hour === 12) return "12p";
  return `${hour - 12}p`;
}

function tooltipHourRange(hour: number) {
  const fmt = (h: number) => {
    const ampm = h < 12 ? "AM" : "PM";
    const disp = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${disp}${ampm}`;
  };
  return `${fmt(hour)} – ${fmt(hour === 23 ? 0 : hour + 1)}`;
}

interface TooltipPayloadItem {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length || label == null) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md space-y-1">
      <p className="font-medium text-foreground mb-1.5">{tooltipHourRange(label)}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-semibold text-foreground tabular-nums ml-auto pl-3">
            {p.name === "avg" ? p.value.toFixed(1) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PeakHoursChart() {
  const { data: res, isLoading } = useAttendancePeakHours();

  const todayBuckets = res?.data?.today ?? [];
  const avgBuckets = res?.data?.avg ?? [];

  const todayMap = new Map(todayBuckets.map((b) => [b.hour, b.count]));
  const avgMap = new Map(avgBuckets.map((b) => [b.hour, b.avg]));
  const chartData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    today: todayMap.get(hour) ?? 0,
    avg: avgMap.get(hour) ?? 0,
  }));

  const hasAnyAvg = avgBuckets.some((b) => b.avg > 0);
  const hasAnyToday = todayBuckets.some((b) => b.count > 0);
  const isEmpty = !hasAnyAvg && !hasAnyToday;

  // Find peak hour from avg (fall back to today)
  const peakBucket = hasAnyAvg
    ? avgBuckets.reduce((best, b) => (b.avg > best.avg ? b : best), { hour: -1, avg: 0 })
    : todayBuckets.reduce((best, b) => (b.count > best.count ? b : best), { hour: -1, count: 0 });
  const peakHour = peakBucket.hour;

  // Show ticks at 0, 6, 12, 18
  const tickHours = new Set([0, 6, 12, 18, 23]);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-semibold">Peak Hours</span>
          <span className="text-xs text-muted-foreground hidden sm:block">
            avg check-ins by hour of day
          </span>
        </div>
        {!isLoading && peakHour >= 0 && (hasAnyAvg || hasAnyToday) && (
          <div className="flex items-center gap-4 text-xs">
            {/* Legend */}
            <div className="flex items-center gap-3 text-muted-foreground">
              {hasAnyAvg && (
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded-full bg-violet-500 inline-block" />
                  avg
                </span>
              )}
              {hasAnyToday && (
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded-full bg-blue-400 inline-block" />
                  today
                </span>
              )}
            </div>
            <span className="text-muted-foreground hidden md:block">
              busiest{" "}
              <span className="font-semibold text-foreground">{tooltipHourRange(peakHour)}</span>
            </span>
          </div>
        )}
      </div>

      <div className="px-2 pt-4 pb-2">
        {isLoading ? (
          <Skeleton className="h-[160px] w-full" />
        ) : isEmpty ? (
          <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
            No attendance data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(271 81% 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(271 81% 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradToday" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(213 94% 68%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(213 94% 68%)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
              />

              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(h) => (tickHours.has(h) ? hourLabel(h) : "")}
                interval={0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickCount={4}
                allowDecimals={false}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />

              {/* avg — render behind today */}
              {hasAnyAvg && (
                <Area
                  type="monotone"
                  dataKey="avg"
                  name="avg"
                  stroke="hsl(271 81% 60%)"
                  strokeWidth={2}
                  fill="url(#gradAvg)"
                  dot={false}
                  activeDot={{ r: 3, fill: "hsl(271 81% 60%)" }}
                />
              )}

              {/* today — render on top */}
              {hasAnyToday && (
                <Area
                  type="monotone"
                  dataKey="today"
                  name="today"
                  stroke="hsl(213 94% 68%)"
                  strokeWidth={2}
                  fill="url(#gradToday)"
                  dot={false}
                  activeDot={{ r: 3, fill: "hsl(213 94% 68%)" }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

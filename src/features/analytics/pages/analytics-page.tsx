import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  BarChart3,
  RefreshCw,
  RotateCcw,
  PiggyBank,
  AlertTriangle,
  Tag,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/shared/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Tooltip,
  LabelList,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { PageHeader } from '@/shared/components/page-header';
import { EmptyState } from '@/shared/components/empty-state';
import {
  useRetention,
  useRevenueBreakdown,
  useTopPlans,
  usePaymentMethods,
  useTrainerPerformance,
  useMemberGrowth,
  useDemographics,
  useMembershipDurationPreference,
  useUnitEconomics,
  useProjection,
  useDiscounts,
} from '../hooks/use-analytics';
import { Button } from '@/shared/components/ui/button';
import { useMemberStats } from '@/features/members/hooks/use-members';
import { useMembershipStats } from '@/features/memberships/hooks/use-memberships';
import { useTrainingStats } from '@/features/training/hooks/use-training';
import { formatCurrency } from '@/shared/lib/utils';
import type { PaymentMethod } from '@/shared/types/common.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  other: 'Other',
};

const RANK_STYLES = [
  { medal: '🥇', bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
  { medal: '🥈', bar: 'bg-zinc-400', badge: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' },
  { medal: '🥉', bar: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300' },
];

type TimeWindow = 3 | 6 | 12 | 24 | 36;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
        {children}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function TimeToggle({
  value,
  onChange,
  options,
}: {
  value: TimeWindow;
  onChange: (v: TimeWindow) => void;
  options: TimeWindow[];
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border bg-muted/50 p-0.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
            value === o
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {o}M
        </button>
      ))}
    </div>
  );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────

function AnalyticsStatCards() {
  const { data: memberStatsRes, isLoading: memberLoading } = useMemberStats();
  const { data: membershipStatsRes, isLoading: membershipLoading } = useMembershipStats();
  const { data: trainingStatsRes, isLoading: trainingLoading } = useTrainingStats();

  const isLoading = memberLoading || membershipLoading || trainingLoading;

  const membershipCollected = membershipStatsRes?.data?.collectedThisMonth ?? 0;
  const trainingCollected = trainingStatsRes?.data?.collectedThisMonth ?? 0;
  const monthlyRevenue = membershipCollected + trainingCollected;

  const cards = [
    {
      label: 'Total Members',
      shortLabel: 'Members',
      value: memberStatsRes?.data ? String(memberStatsRes.data.total) : '—',
      icon: Users,
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      label: 'Active Members',
      shortLabel: 'Active',
      value: memberStatsRes?.data ? String(memberStatsRes.data.active) : '—',
      icon: UserCheck,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      label: 'Active Memberships',
      shortLabel: 'Memberships',
      value: membershipStatsRes?.data ? String(membershipStatsRes.data.active) : '—',
      icon: TrendingUp,
      colorClass: 'text-violet-600 dark:text-violet-400',
      bgClass: 'bg-violet-50 dark:bg-violet-950/50',
    },
    {
      label: 'Monthly Revenue',
      shortLabel: 'Revenue',
      value: isLoading ? '—' : `₹${formatCurrency(monthlyRevenue)}`,
      icon: IndianRupee,
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-3 lg:hidden">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-24 mb-1" />
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, shortLabel, value, icon: Icon, colorClass, bgClass }) => (
        <Card key={label} className="overflow-hidden transition-shadow hover:shadow-md">
          {/* Mobile */}
          <div className="p-3 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className={`rounded-lg p-2 shrink-0 ${bgClass}`}>
                <Icon className={`h-4 w-4 ${colorClass}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground leading-tight truncate">
                  {shortLabel}
                </p>
                <p className="text-base font-bold leading-tight tracking-tight truncate font-display">
                  {value}
                </p>
              </div>
            </div>
          </div>
          {/* Desktop */}
          <div className="hidden lg:block">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <div className={`rounded-lg p-2 ${bgClass}`}>
                <Icon className={`h-4 w-4 ${colorClass}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight font-display">{value}</div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Lifetime Earnings Pie ─────────────────────────────────────────────────────

const lifetimePieConfig = {
  membership: {
    label: 'Membership',
    color: 'var(--chart-1)',
  },
  training: {
    label: 'Training',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

function LifetimeEarningsPieCard() {
  const { data: membershipStatsRes, isLoading: membershipLoading } = useMembershipStats();
  const { data: trainingStatsRes, isLoading: trainingLoading } = useTrainingStats();
  const { data: memberStatsRes, isLoading: memberLoading } = useMemberStats();
  const { data: revenueRes, isLoading: revenueLoading } = useRevenueBreakdown(60);

  const isLoading = membershipLoading || trainingLoading || memberLoading || revenueLoading;

  const membershipTotal = membershipStatsRes?.data?.totalCollected ?? 0;
  const trainingTotal = trainingStatsRes?.data?.totalCollected ?? 0;
  const grandTotal = membershipTotal + trainingTotal;
  const totalMembers = memberStatsRes?.data?.total ?? 0;
  const avgTicketSize = totalMembers > 0 ? grandTotal / totalMembers : 0;

  const activeMonths = (revenueRes?.data ?? []).filter((p) => p.total > 0).length;
  const avgMonthlyIncome = activeMonths > 0 ? grandTotal / activeMonths : 0;

  const membershipPct = grandTotal > 0 ? Math.round((membershipTotal / grandTotal) * 1000) / 10 : 0;
  const trainingPct = grandTotal > 0 ? Math.round((trainingTotal / grandTotal) * 1000) / 10 : 0;

  const chartData = [
    { name: 'membership', value: membershipTotal, label: 'Membership' },
    { name: 'training', value: trainingTotal, label: 'Training' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
          Lifetime Earnings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap gap-6">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-28" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ) : grandTotal === 0 ? (
          <EmptyState message="No revenue data yet" />
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ChartContainer config={lifetimePieConfig} className="h-[160px] w-[160px] shrink-0">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex items-center justify-between gap-4 w-full">
                          <span className="text-muted-foreground">
                            {lifetimePieConfig[name as keyof typeof lifetimePieConfig]?.label ?? name}
                          </span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            ₹{formatCurrency(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  strokeWidth={2}
                >
                  <Cell fill="var(--color-membership)" />
                  <Cell fill="var(--color-training)" />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="flex-1 w-full space-y-4">
              <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Total lifetime earnings</p>
                  <p className="text-2xl font-bold tracking-tight font-display inline-flex items-center">
                    <IndianRupee className="h-5 w-5" />
                    {formatCurrency(grandTotal)}
                  </p>
                </div>
                {avgMonthlyIncome > 0 && (
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Avg monthly income</p>
                    <p className="text-2xl font-bold tracking-tight font-display inline-flex items-center">
                      <IndianRupee className="h-5 w-5" />
                      {formatCurrency(Math.round(avgMonthlyIncome))}
                    </p>
                  </div>
                )}
                {avgTicketSize > 0 && (
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Avg ticket / member</p>
                    <p className="text-2xl font-bold tracking-tight font-display inline-flex items-center">
                      <IndianRupee className="h-5 w-5" />
                      {formatCurrency(Math.round(avgTicketSize))}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--chart-1)]" />
                      <span className="text-muted-foreground">Membership</span>
                    </div>
                    <span className="font-medium inline-flex items-center">
                      <IndianRupee className="h-3 w-3" />
                      {formatCurrency(membershipTotal)}
                      <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                        ({membershipPct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-[var(--chart-1)]"
                      style={{ width: `${membershipPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--chart-2)]" />
                      <span className="text-muted-foreground">Training</span>
                    </div>
                    <span className="font-medium inline-flex items-center">
                      <IndianRupee className="h-3 w-3" />
                      {formatCurrency(trainingTotal)}
                      <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                        ({trainingPct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-[var(--chart-2)]"
                      style={{ width: `${trainingPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Member Growth Chart ───────────────────────────────────────────────────────

const memberGrowthChartConfig = {
  newMembers: {
    label: 'New Members',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

function MemberGrowthCard() {
  const [window, setWindow] = useState<TimeWindow>(12);
  const { data: growthRes, isLoading } = useMemberGrowth(window);
  const points = growthRes?.data ?? [];

  const chartData = points.map((p) => ({
    month: new Date(p.year, p.month - 1, 1).toLocaleString('default', { month: 'short', year: '2-digit' }),
    newMembers: p.newMembers,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Member Growth
          <div className="ml-auto">
            <TimeToggle value={window} onChange={setWindow} options={[3, 6, 12]} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-end gap-2 h-40">
            {Array.from({ length: window }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                <Skeleton className="w-full" style={{ height: `${20 + i * 4}px` }} />
                <Skeleton className="h-2.5 w-5" />
              </div>
            ))}
          </div>
        ) : (
          <ChartContainer config={memberGrowthChartConfig} className="h-[180px] w-full">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="newMembers" fill="var(--color-newMembers)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Revenue Breakdown Chart ───────────────────────────────────────────────────

const revenueChartConfig = {
  membership: {
    label: 'Membership',
    color: 'var(--chart-1)',
  },
  training: {
    label: 'Training',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

const discountChartConfig = {
  offer: {
    label: 'From Offers',
    color: '#8b5cf6',
  },
  flat: {
    label: 'Flat Discount',
    color: '#f59e0b',
  },
} satisfies ChartConfig;

function RevenueBreakdownCard() {
  const [window, setWindow] = useState<TimeWindow>(6);
  const { data: revenueRes, isLoading } = useRevenueBreakdown(window);
  const points = revenueRes?.data ?? [];

  const chartData = points.map((p) => ({
    month: new Date(p.year, p.month - 1, 1).toLocaleString('default', { month: 'short', year: '2-digit' }),
    membership: p.membership,
    training: p.training,
  }));

  const formatYTick = (v: number) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
    return `₹${v}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Revenue by Category
          <div className="ml-auto">
            <TimeToggle value={window} onChange={setWindow} options={[3, 6, 12]} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-end gap-2 h-40">
            {Array.from({ length: window }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                <Skeleton className="w-full" style={{ height: `${30 + i * 6}px` }} />
                <Skeleton className="h-2.5 w-6" />
              </div>
            ))}
          </div>
        ) : (
          <ChartContainer config={revenueChartConfig} className="h-[180px] w-full">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tick={{ fontSize: 11 }}
                tickFormatter={formatYTick}
              />
              <ChartTooltip
                cursor={false}
                content={(props) => (
                  <ChartTooltipContent
                    {...props}
                    payload={[...(props.payload ?? [])].sort((a, b) =>
                      a.dataKey === 'training' ? -1 : b.dataKey === 'training' ? 1 : 0
                    )}
                    indicator="dot"
                    formatter={(value, name) => (
                      <div className="flex items-center justify-between gap-4 w-full">
                        <span className="text-muted-foreground">
                          {revenueChartConfig[name as keyof typeof revenueChartConfig]?.label ?? name}
                        </span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          ₹{formatCurrency(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                )}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="membership" fill="var(--color-membership)" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="training" fill="var(--color-training)" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Discounts Given Card ─────────────────────────────────────────────────────

function DiscountsCard() {
  const navigate = useNavigate();
  const [window, setWindow] = useState<TimeWindow>(6);
  const { data: res, isLoading } = useDiscounts(window);
  const d = res?.data;

  const chartData = (d?.byMonth ?? []).map((p) => ({
    month: new Date(p.year, p.month - 1, 1).toLocaleString('default', { month: 'short', year: '2-digit' }),
    offer: p.offer,
    flat: p.flat,
  }));

  const formatYTick = (v: number) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
    return `₹${v}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          Discounts Given
          <div className="ml-auto">
            <TimeToggle value={window} onChange={setWindow} options={[3, 6, 12]} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading || !d ? (
          <>
            <div className="grid gap-3 grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
            <Skeleton className="h-[180px] w-full" />
          </>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid gap-3 grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                <p className="text-base font-bold text-amber-600 dark:text-amber-400 inline-flex items-center font-display">
                  <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
                  {formatCurrency(d.total)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">From Offers</p>
                <p className="text-base font-bold text-violet-600 dark:text-violet-400 inline-flex items-center font-display">
                  <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
                  {formatCurrency(d.totalOfferDriven)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Flat</p>
                <p className="text-base font-bold text-amber-600 dark:text-amber-400 inline-flex items-center font-display">
                  <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
                  {formatCurrency(d.totalFlat)}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {d.discountedCount} of {d.totalSales} sales were discounted
              {d.totalSales > 0 ? ` · ${d.discountRate}%` : ''}
            </p>

            {/* Stacked chart */}
            {d.total > 0 ? (
              <ChartContainer config={discountChartConfig} className="h-[180px] w-full">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    tick={{ fontSize: 11 }}
                    tickFormatter={formatYTick}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        formatter={(value, name) => (
                          <div className="flex items-center justify-between gap-4 w-full">
                            <span className="text-muted-foreground">
                              {discountChartConfig[name as keyof typeof discountChartConfig]?.label ?? name}
                            </span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                              ₹{formatCurrency(Number(value))}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="offer" fill="var(--color-offer)" radius={[0, 0, 0, 0]} stackId="a" />
                  <Bar dataKey="flat" fill="var(--color-flat)" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyState message="No discounts given in this window" />
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/members?hasDiscount=true')}
            >
              View discounted memberships
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Top Plans Card ────────────────────────────────────────────────────────────

function TopPlansCard() {
  const { data: plansRes, isLoading } = useTopPlans(6);
  const plans = plansRes?.data ?? [];
  const maxCount = Math.max(...plans.map((p) => p.totalCount), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          Best-Selling Plans
          <span className="ml-auto text-xs font-normal text-muted-foreground">Last 6 months</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <EmptyState message="No plan data yet" />
        ) : (
          <div className="space-y-3">
            {plans.map((plan, rank) => {
              const barWidth = (plan.totalCount / maxCount) * 100;
              const isMembership = plan.category === 'membership';
              const rankStyle = RANK_STYLES[rank];
              const barColor = rankStyle
                ? rankStyle.bar
                : isMembership
                ? 'bg-blue-500'
                : 'bg-violet-500';
              const badgeColor = isMembership
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                : 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300';

              return (
                <div key={plan.planName} className="group">
                  <div className="flex items-center gap-3 py-2">
                    <span className="w-5 text-center shrink-0 text-sm">
                      {rankStyle ? (
                        rankStyle.medal
                      ) : (
                        <span className="text-xs text-muted-foreground">{rank + 1}</span>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-medium truncate">{plan.planName}</span>
                        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${badgeColor}`}>
                          {plan.category}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${barColor}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0 text-right space-y-0.5">
                      <p className="text-sm font-semibold inline-flex items-center justify-end">
                        <IndianRupee className="h-3 w-3" />
                        {formatCurrency(plan.totalRevenue)}
                      </p>
                      <p className="text-xs text-muted-foreground">{plan.totalCount} sold</p>
                    </div>
                  </div>

                  {plan.variants.length > 0 && (
                    <div className="ml-8 mb-1 flex flex-wrap gap-1.5">
                      {plan.variants.map((v) => (
                        <span
                          key={v.planVariantId}
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {v.durationLabel}
                          <span className="font-medium text-foreground">{v.count}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Retention Card ────────────────────────────────────────────────────────────

const retentionPieConfig = {
  repeat: { label: 'Repeat', color: '#10b981' },
  oneTime: { label: 'One-time', color: '#f59e0b' },
  churned: { label: 'Churned', color: '#f87171' },
} satisfies ChartConfig;

function RetentionCard() {
  const { data: retentionRes, isLoading } = useRetention();
  const r = retentionRes?.data;

  const pieData = r
    ? [
        { name: 'repeat', label: 'Repeat', value: r.repeatCount, color: '#10b981' },
        { name: 'oneTime', label: 'One-time', value: r.oneTimeCount, color: '#f59e0b' },
        { name: 'churned', label: 'Churned', value: r.churnedCount, color: '#f87171' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          Member Retention
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-36 w-36 rounded-full" />
            <div className="space-y-2 w-full">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ) : r ? (
          <div className="flex flex-col items-center gap-4">
            <ChartContainer config={retentionPieConfig} className="h-[180px] w-[180px] shrink-0">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                        <p className="font-medium">{d.label}</p>
                        <p className="text-muted-foreground">{d.value} members</p>
                      </div>
                    );
                  }}
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  strokeWidth={2}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="w-full space-y-2.5">
              {[
                { label: 'Repeat', value: r.repeatCount, color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'One-time', value: r.oneTimeCount, color: 'bg-amber-400', textColor: 'text-amber-600 dark:text-amber-400' },
                { label: 'Churned', value: r.churnedCount, color: 'bg-red-400', textColor: 'text-red-600 dark:text-red-400' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${row.color}`} />
                    <span className="text-muted-foreground">{row.label}</span>
                  </div>
                  <span className={`font-semibold ${row.textColor}`}>{row.value}</span>
                </div>
              ))}
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Retention rate</span>
                <span className="font-bold text-violet-600 dark:text-violet-400">{r.retentionRate}%</span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ─── Payment Methods Card ──────────────────────────────────────────────────────

const METHOD_HEX: Record<PaymentMethod, string> = {
  cash: '#10b981',
  card: '#3b82f6',
  upi: '#8b5cf6',
  bank_transfer: '#f59e0b',
  other: '#a1a1aa',
};

function PaymentMethodsCard() {
  const { data: methodsRes, isLoading } = usePaymentMethods();
  const methods = methodsRes?.data ?? [];

  const pieData = methods.map((m) => ({
    name: METHOD_LABELS[m.method],
    value: m.amount,
    count: m.count,
    percentage: m.percentage,
    color: METHOD_HEX[m.method],
  }));

  const paymentConfig = Object.fromEntries(
    methods.map((m) => [METHOD_LABELS[m.method], { label: METHOD_LABELS[m.method] }])
  ) satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
          Payment Methods
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-36 w-36 rounded-full" />
            <div className="space-y-2 w-full">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ) : methods.length === 0 ? (
          <EmptyState message="No payment data yet" />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <ChartContainer config={paymentConfig} className="h-[180px] w-[180px] shrink-0">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md space-y-1">
                        <p className="font-medium">{d.name}</p>
                        <p className="text-muted-foreground">₹{formatCurrency(d.value)}</p>
                        <p className="text-muted-foreground">{d.count} transactions · {d.percentage}%</p>
                      </div>
                    );
                  }}
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={80}
                  strokeWidth={2}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="w-full space-y-2.5">
              {pieData.map((m) => (
                <div key={m.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: m.color }} />
                    <span className="text-muted-foreground">{m.name}</span>
                    <span className="text-xs text-muted-foreground">({m.count})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold inline-flex items-center">
                      <IndianRupee className="h-3 w-3" />
                      {formatCurrency(m.value)}
                    </span>
                    <span className="text-xs text-muted-foreground w-9 text-right">{m.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Demographics Card ─────────────────────────────────────────────────────────

const GENDER_COLORS = ['#3b82f6', '#ec4899', '#a1a1aa', '#f59e0b'];

const ageChartConfig = {
  count: { label: 'Members', color: 'var(--chart-1)' },
} satisfies ChartConfig;

function DemographicsCard() {
  const { data: demoRes, isLoading } = useDemographics();
  const demo = demoRes?.data;

  const genderPieData = (demo?.gender ?? []).map((g, i) => ({
    name: g.label,
    value: g.count,
    percentage: g.percentage,
    color: GENDER_COLORS[i % GENDER_COLORS.length],
  }));

  const ageChartData = (demo?.ageBrackets ?? []).map((b) => ({
    bracket: b.label,
    count: b.count,
  }));

  const genderConfig = Object.fromEntries(
    genderPieData.map((g) => [g.name, { label: g.name }])
  ) satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Demographics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="flex items-end gap-2 h-36">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="flex-1" style={{ height: `${30 + i * 10}px` }} />
              ))}
            </div>
          </div>
        ) : !demo ? (
          <EmptyState message="No data yet" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Gender — donut */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
                Gender
              </p>
              {genderPieData.length > 0 ? (
                <div className="flex flex-col items-center gap-3">
                  <ChartContainer config={genderConfig} className="h-[150px] w-[150px]">
                    <PieChart>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                              <p className="font-medium">{d.name}</p>
                              <p className="text-muted-foreground">{d.value} · {d.percentage}%</p>
                            </div>
                          );
                        }}
                      />
                      <Pie
                        data={genderPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={68}
                        strokeWidth={2}
                      >
                        {genderPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                    {genderPieData.map((g) => (
                      <div key={g.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: g.color }} />
                        {g.name} ({g.percentage}%)
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </div>

            {/* Age — vertical bar */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
                Age Brackets
              </p>
              {ageChartData.length > 0 ? (
                <ChartContainer config={ageChartConfig} className="h-[180px] w-full">
                  <BarChart data={ageChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="bracket"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                      tickMargin={6}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                            <p className="font-medium">{payload[0].payload.bracket}</p>
                            <p className="text-muted-foreground">{payload[0].value} members</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]}>
                        <LabelList
                          dataKey="count"
                          position="top"
                          style={{ fontSize: 10, fill: 'hsl(var(--foreground))', fontWeight: 500 }}
                        />
                      </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Trainer Performance ───────────────────────────────────────────────────────

function TrainerPerformanceCard() {
  const { data: trainersRes, isLoading } = useTrainerPerformance();
  const trainers = trainersRes?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-muted-foreground" />
          Trainer Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : trainers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-muted-foreground">No trainer data yet</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trainer</TableHead>
                    <TableHead className="text-center">Active Clients</TableHead>
                    <TableHead className="text-center">Total Clients</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Avg Plan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainers.map((t) => (
                    <TableRow key={t.trainerId}>
                      <TableCell className="font-medium">{t.trainerName}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-xs font-medium">
                          {t.activeClients}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {t.totalClients}
                      </TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center justify-end">
                          <IndianRupee className="h-3 w-3" />
                          {formatCurrency(t.totalRevenue)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                        <span className="inline-flex items-center justify-end">
                          <IndianRupee className="h-3 w-3" />
                          {formatCurrency(t.avgPlanPrice)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y">
              {trainers.map((t) => (
                <div key={t.trainerId} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{t.trainerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.activeClients} active · {t.totalClients} total clients
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm inline-flex items-center">
                      <IndianRupee className="h-3 w-3" />
                      {formatCurrency(t.totalRevenue)}
                    </p>
                    <p className="text-xs text-muted-foreground inline-flex items-center">
                      avg <IndianRupee className="h-2.5 w-2.5 mx-0.5" />
                      {formatCurrency(t.avgPlanPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Membership Duration Preference Card ──────────────────────────────────────

const DURATION_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
];

function MembershipDurationCard() {
  const { data: res, isLoading } = useMembershipDurationPreference();
  const avgMonths = res?.data?.avgMonths ?? 0;
  const buckets = res?.data?.buckets ?? [];

  const avgLabel =
    avgMonths === 0
      ? '—'
      : avgMonths < 1
      ? `${Math.round(avgMonths * 30)}d`
      : `${avgMonths}mo`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Avg Membership Duration
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-28" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : buckets.length === 0 ? (
          <EmptyState message="No membership data yet" />
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold tracking-tight font-display">{avgLabel}</p>
              <p className="text-xs text-muted-foreground mt-0.5">weighted average across all memberships</p>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-3">
              {buckets.map((d, i) => {
                const color = DURATION_COLORS[i % DURATION_COLORS.length];
                return (
                  <div key={d.durationLabel}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
                        <span className="text-sm">{d.durationLabel}</span>
                        <span className="text-xs text-muted-foreground">({d.count})</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{d.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${color}`}
                        style={{ width: `${d.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Unit Economics Card ───────────────────────────────────────────────────────

function UnitEconomicsCard() {
  const [window, setWindow] = useState<TimeWindow>(3);
  const { data: res, isLoading } = useUnitEconomics(window);
  const ue = res?.data;

  const metrics = ue
    ? [
        { label: 'ARPU', value: `₹${formatCurrency(ue.arpu)}`, sub: 'per member/month', color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Monthly Churn', value: `${ue.churnPercent.toFixed(1)}%`, sub: ue.churnPercent < 5 ? 'Excellent' : ue.churnPercent < 8 ? 'Acceptable' : 'High — needs attention', color: ue.churnPercent < 5 ? 'text-emerald-600 dark:text-emerald-400' : ue.churnPercent < 8 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400' },
        { label: 'LTV', value: ue.ltv ? `₹${formatCurrency(ue.ltv)}` : '—', sub: 'avg lifetime value', color: 'text-violet-600 dark:text-violet-400' },
        { label: 'Avg New Joins', value: `${ue.avgNewJoinsPerMonth.toFixed(1)}`, sub: 'per month', color: 'text-blue-600 dark:text-blue-400' },
      ]
    : [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-violet-500" />
            Unit Economics
          </CardTitle>
          <TimeToggle value={window} onChange={setWindow} options={[3, 6, 12]} />
        </div>
        {ue && ue.dataPoints < window && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-1">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            Only {ue.dataPoints} month{ue.dataPoints !== 1 ? 's' : ''} of data — confidence is low
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {metrics.map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className={`text-lg font-bold font-display ${color}`}>{value}</p>
                <p className="text-[11px] text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Projection Card ───────────────────────────────────────────────────────────

function ProjectionCard() {
  const [window, setWindow] = useState<TimeWindow>(3);
  const [horizon, setHorizon] = useState<TimeWindow>(12);
  const [scenario, setScenario] = useState<'base' | 'worst' | 'best'>('base');
  const { data: res, isLoading } = useProjection(window, horizon);
  const proj = res?.data;

  const scenarioData = proj?.[scenario];
  const inp = proj?.inputs;

  const scenarioConfig = {
    worst: { label: 'Worst', color: 'text-red-600 dark:text-red-400', desc: '−20% joins, +20% churn' },
    base:  { label: 'Base',  color: 'text-blue-600 dark:text-blue-400', desc: 'Current pace' },
    best:  { label: 'Best',  color: 'text-emerald-600 dark:text-emerald-400', desc: '+30% joins, −20% churn' },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <PiggyBank className="h-4 w-4 text-amber-500" />
            Projection
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-0.5 rounded-md border bg-muted/50 p-0.5">
              {(['worst', 'base', 'best'] as const).map((s) => (
                <button key={s} onClick={() => setScenario(s)}
                  className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${scenario === s ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  {scenarioConfig[s].label}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Learn from</span>
            <TimeToggle value={window} onChange={setWindow} options={[3, 6, 12]} />
            <span className="text-xs text-muted-foreground">Project</span>
            <TimeToggle value={horizon} onChange={setHorizon} options={[12, 24, 36]} />
          </div>
        </div>
        {inp && (
          <p className="text-xs text-muted-foreground mt-1">
            {scenarioConfig[scenario].desc} · Based on {inp.activeMembers} active members, ₹{formatCurrency(inp.arpu)} ARPU, {inp.churnPercent.toFixed(1)}% churn
          </p>
        )}
        {inp && inp.dataPoints < window && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            Only {inp.dataPoints} month{inp.dataPoints !== 1 ? 's' : ''} of data — projection confidence is low
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
        ) : scenarioData ? (
          <div className="space-y-4">
            {/* Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Payback Period</p>
                <p className="text-lg font-bold font-display text-amber-600 dark:text-amber-400">
                  {scenarioData.paybackMonth ? `${scenarioData.paybackMonth} mo` : '> horizon'}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-0.5">ROI at {horizon}M</p>
                <p className={`text-lg font-bold font-display ${(scenarioData.roiAtHorizon ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {scenarioData.roiAtHorizon != null ? `${scenarioData.roiAtHorizon.toFixed(1)}%` : '—'}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Members at {horizon}M</p>
                <p className="text-lg font-bold font-display text-blue-600 dark:text-blue-400">
                  {scenarioData.months[scenarioData.months.length - 1]?.members ?? '—'}
                </p>
              </div>
            </div>

            {/* Month table — desktop only */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Month</TableHead>
                    <TableHead className="text-xs text-right">Members</TableHead>
                    <TableHead className="text-xs text-right">Revenue</TableHead>
                    <TableHead className="text-xs text-right">Profit</TableHead>
                    <TableHead className="text-xs text-right">Cumulative</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarioData.months.map((m) => (
                    <TableRow key={m.month} className={m.month === scenarioData.paybackMonth ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''}>
                      <TableCell className="text-xs font-medium">M{m.month}{m.month === scenarioData.paybackMonth ? ' ✓' : ''}</TableCell>
                      <TableCell className="text-xs text-right">{m.members}</TableCell>
                      <TableCell className="text-xs text-right">₹{formatCurrency(m.revenue)}</TableCell>
                      <TableCell className={`text-xs text-right font-medium ${m.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {m.profit >= 0 ? <TrendingUp className="inline h-3 w-3 mr-0.5" /> : <TrendingDown className="inline h-3 w-3 mr-0.5" />}
                        ₹{formatCurrency(Math.abs(m.profit))}
                      </TableCell>
                      <TableCell className={`text-xs text-right ${m.cumulativeProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                        ₹{formatCurrency(Math.abs(m.cumulativeProfit))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: just summary rows */}
            <div className="sm:hidden space-y-2">
              {scenarioData.months.filter((_, i) => i % 3 === 2).map((m) => (
                <div key={m.month} className={`flex items-center justify-between rounded-lg border p-3 ${m.month === scenarioData.paybackMonth ? 'border-emerald-500' : ''}`}>
                  <span className="text-xs font-medium">Month {m.month}</span>
                  <div className="text-right">
                    <p className="text-xs font-semibold">₹{formatCurrency(m.revenue)} rev</p>
                    <p className={`text-[11px] ${m.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      ₹{formatCurrency(Math.abs(m.profit))} profit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date());

  const refreshLabel = lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Analytics"
        description="Member trends, plan performance, and revenue insights"
        actions={
          <button
            onClick={() => setLastRefreshed(new Date())}
            className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Updated {refreshLabel}
          </button>
        }
      />

      {/* Overview */}
      <AnalyticsStatCards />
      <LifetimeEarningsPieCard />

      {/* Growth */}
      <SectionLabel>Growth</SectionLabel>
      <div className="grid gap-4 md:grid-cols-2">
        <MemberGrowthCard />
        <RevenueBreakdownCard />
      </div>
      <DiscountsCard />

      {/* Unit Economics & Projection */}
      <SectionLabel>Unit Economics & Projection</SectionLabel>
      <UnitEconomicsCard />
      <ProjectionCard />

      {/* Products & Retention */}
      <SectionLabel>Products & Retention</SectionLabel>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <TopPlansCard />
        <RetentionCard />
      </div>

      {/* Operations */}
      <SectionLabel>Operations</SectionLabel>
      <TrainerPerformanceCard />
      <div className="grid gap-4 md:grid-cols-2">
        <PaymentMethodsCard />
        <DemographicsCard />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <MembershipDurationCard />
      </div>
    </div>
  );
}

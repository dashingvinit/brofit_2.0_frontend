import {
  Users,
  UserCheck,
  TrendingUp,
  IndianRupee,
  BarChart3,
  RefreshCw,
  UserX,
  UserMinus,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { PageHeader } from '@/shared/components/page-header';
import {
  useRetention,
  useRevenueBreakdown,
  useTopPlans,
  usePaymentMethods,
  useTrainerPerformance,
  useMemberGrowth,
  useDemographics,
} from '../hooks/use-analytics';
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

const METHOD_COLORS: Record<PaymentMethod, string> = {
  cash: 'bg-emerald-500',
  card: 'bg-blue-500',
  upi: 'bg-violet-500',
  bank_transfer: 'bg-amber-500',
  other: 'bg-zinc-400',
};

// ─── Stat Cards ───────────────────────────────────────────────────────────────

function AnalyticsStatCards() {
  const { data: retentionRes, isLoading: retLoading } = useRetention();
  const { data: revenueRes, isLoading: revLoading } = useRevenueBreakdown(6);

  const retention = retentionRes?.data;
  const revenuePoints = revenueRes?.data ?? [];
  const totalRevenue = revenuePoints.reduce((sum, p) => sum + p.total, 0);
  const avgRevPerMember =
    retention && retention.totalMembers > 0
      ? Math.round(totalRevenue / retention.totalMembers)
      : 0;

  const isLoading = retLoading || revLoading;

  const cards = [
    {
      label: 'Total Members',
      shortLabel: 'Members',
      value: retention ? String(retention.totalMembers) : '—',
      icon: Users,
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      label: 'Active Members',
      shortLabel: 'Active',
      value: retention ? String(retention.activeCount) : '—',
      icon: UserCheck,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      label: 'Retention Rate',
      shortLabel: 'Retention',
      value: retention ? `${retention.retentionRate}%` : '—',
      icon: TrendingUp,
      colorClass: 'text-violet-600 dark:text-violet-400',
      bgClass: 'bg-violet-50 dark:bg-violet-950/50',
    },
    {
      label: 'Avg Rev / Member',
      shortLabel: 'Avg Rev',
      value: retention ? `₹${formatCurrency(avgRevPerMember)}` : '—',
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
                <p className="text-base font-bold leading-tight tracking-tight truncate">
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
              <div className="text-2xl font-bold tracking-tight">{value}</div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Member Growth Chart ───────────────────────────────────────────────────────

function MemberGrowthCard() {
  const { data: growthRes, isLoading } = useMemberGrowth(12);
  const allPoints = growthRes?.data ?? [];
  // Show last 6 months on mobile (narrow screens can't fit 12 readable bars)
  const points = allPoints;
  const maxVal = Math.max(...points.map((p) => p.newMembers), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Member Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-end gap-2 h-28">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                <Skeleton className="w-full" style={{ height: `${20 + i * 4}px` }} />
                <Skeleton className="h-2.5 w-5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-x-auto -mx-1 px-1">
              <div className="flex items-end gap-1 h-28 min-w-[280px]">
                {points.map((p) => {
                  const barH = Math.round((p.newMembers / maxVal) * 100);
                  const shortLabel = new Date(p.year, p.month - 1, 1).toLocaleString('default', {
                    month: 'short',
                  });
                  return (
                    <div
                      key={`${p.year}-${p.month}`}
                      className="group relative flex-1 flex flex-col items-center gap-1"
                    >
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-10 hidden group-hover:flex flex-col items-center">
                        <div className="rounded bg-foreground px-2 py-1 text-[10px] font-medium text-background whitespace-nowrap shadow-md">
                          {p.newMembers} joined
                        </div>
                        <div className="h-1.5 w-px bg-foreground/40" />
                      </div>
                      <div className="w-full flex items-end h-24">
                        <div
                          className="w-full rounded-t bg-blue-500/80 transition-all group-hover:bg-blue-500"
                          style={{ height: `${barH}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{shortLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500/80" />
              New members joined
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Revenue Breakdown Chart ───────────────────────────────────────────────────

function RevenueBreakdownCard() {
  const { data: revenueRes, isLoading } = useRevenueBreakdown(6);
  const points = revenueRes?.data ?? [];
  const maxVal = Math.max(...points.map((p) => p.total), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Revenue by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-end gap-2 h-28">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                <Skeleton className="w-full" style={{ height: `${30 + i * 6}px` }} />
                <Skeleton className="h-2.5 w-6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-x-auto -mx-1 px-1">
              <div className="flex items-end gap-1.5 h-28 min-w-[200px]">
                {points.map((p) => {
                  const totalH = Math.round((p.total / maxVal) * 100);
                  const membershipRatio = p.total > 0 ? p.membership / p.total : 0;
                  const shortLabel = new Date(p.year, p.month - 1, 1).toLocaleString('default', {
                    month: 'short',
                  });
                  return (
                    <div
                      key={`${p.year}-${p.month}`}
                      className="group relative flex-1 flex flex-col items-center gap-1"
                    >
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-10 hidden group-hover:flex flex-col items-center">
                        <div className="rounded bg-foreground px-2 py-1 text-[10px] font-medium text-background whitespace-nowrap shadow-md space-y-0.5">
                          <div>M: ₹{formatCurrency(p.membership)}</div>
                          <div>T: ₹{formatCurrency(p.training)}</div>
                        </div>
                        <div className="h-1.5 w-px bg-foreground/40" />
                      </div>
                      <div
                        className="w-full flex flex-col justify-end h-24 overflow-hidden rounded-t"
                      >
                        <div
                          className="w-full flex flex-col"
                          style={{ height: `${totalH}%` }}
                        >
                          <div
                            className="w-full bg-blue-500/80 group-hover:bg-blue-500 transition-colors"
                            style={{ flex: membershipRatio }}
                          />
                          <div
                            className="w-full bg-violet-500/80 group-hover:bg-violet-500 transition-colors"
                            style={{ flex: 1 - membershipRatio }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{shortLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500/80" />
                Membership
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-violet-500/80" />
                Training
              </span>
            </div>
          </div>
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
          <p className="text-sm text-muted-foreground text-center py-6">No plan data yet</p>
        ) : (
          <div className="space-y-3">
            {plans.map((plan, rank) => {
              const barWidth = (plan.totalCount / maxCount) * 100;
              const isMembership = plan.category === 'membership';
              const barColor = isMembership ? 'bg-blue-500' : 'bg-violet-500';
              const badgeColor = isMembership
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                : 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300';

              return (
                <div key={plan.planName} className="group">
                  {/* Main row */}
                  <div className="flex items-center gap-3 py-2">
                    <span className="w-5 text-xs text-muted-foreground shrink-0 text-right">
                      {rank + 1}
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

                  {/* Variants — compact pill row */}
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

function RetentionCard() {
  const { data: retentionRes, isLoading } = useRetention();
  const r = retentionRes?.data;

  const total = r ? r.repeatCount + r.oneTimeCount + r.churnedCount : 0;
  const repeatPct = total > 0 && r ? (r.repeatCount / total) * 100 : 0;
  const oneTimePct = total > 0 && r ? (r.oneTimeCount / total) * 100 : 0;
  const churnedPct = total > 0 && r ? (r.churnedCount / total) * 100 : 0;

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
          <div className="space-y-4">
            <Skeleton className="h-2 w-full rounded-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : r ? (
          <div className="space-y-4">
            {/* Segmented bar */}
            <div className="h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${repeatPct}%` }}
                title={`Repeat: ${r.repeatCount}`}
              />
              <div
                className="bg-amber-400 transition-all"
                style={{ width: `${oneTimePct}%` }}
                title={`One-time: ${r.oneTimeCount}`}
              />
              <div
                className="bg-red-400 transition-all"
                style={{ width: `${churnedPct}%` }}
                title={`Churned: ${r.churnedCount}`}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm text-muted-foreground">Repeat members</span>
                </div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {r.repeatCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserMinus className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm text-muted-foreground">One-time members</span>
                </div>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {r.oneTimeCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-muted-foreground">Churned</span>
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {r.churnedCount}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Retention rate</span>
                <span className="font-bold text-violet-600 dark:text-violet-400">
                  {r.retentionRate}%
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ─── Payment Methods Card ──────────────────────────────────────────────────────

function PaymentMethodsCard() {
  const { data: methodsRes, isLoading } = usePaymentMethods();
  const methods = methodsRes?.data ?? [];

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
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : methods.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No payment data yet</p>
        ) : (
          <div className="space-y-4">
            {methods.map((m) => (
              <div key={m.method}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${METHOD_COLORS[m.method]}`}
                    />
                    <span className="text-sm">{METHOD_LABELS[m.method]}</span>
                    <span className="text-xs text-muted-foreground">({m.count})</span>
                  </div>
                  <span className="text-sm font-semibold inline-flex items-center">
                    <IndianRupee className="h-3 w-3" />
                    {formatCurrency(m.amount)}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${METHOD_COLORS[m.method]}`}
                    style={{ width: `${m.percentage}%` }}
                  />
                </div>
              </div>
            ))}
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

// ─── Demographics Card ─────────────────────────────────────────────────────────

function DemographicsCard() {
  const { data: demoRes, isLoading } = useDemographics();
  const demo = demoRes?.data;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Gender */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Gender Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : demo && demo.gender.length > 0 ? (
            <div className="space-y-3">
              {demo.gender.map((g) => (
                <div key={g.label}>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="text-muted-foreground">{g.label}</span>
                    <span className="font-medium">
                      {g.count}{' '}
                      <span className="text-muted-foreground font-normal">({g.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${g.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Age */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Age Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : demo && demo.ageBrackets.length > 0 ? (
            <div className="space-y-3">
              {demo.ageBrackets.map((b) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="text-muted-foreground">{b.label}</span>
                    <span className="font-medium">
                      {b.count}{' '}
                      <span className="text-muted-foreground font-normal">({b.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-violet-500"
                      style={{ width: `${b.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Analytics"
        description="Member trends, plan performance, and revenue insights"
      />

      <AnalyticsStatCards />

      <div className="grid gap-4 md:grid-cols-2">
        <MemberGrowthCard />
        <RevenueBreakdownCard />
      </div>

      <TopPlansCard />

      <div className="grid gap-4 md:grid-cols-2">
        <RetentionCard />
        <PaymentMethodsCard />
      </div>

      <TrainerPerformanceCard />

      <DemographicsCard />
    </div>
  );
}

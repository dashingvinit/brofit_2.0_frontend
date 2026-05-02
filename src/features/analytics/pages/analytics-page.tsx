import { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { usePrivacy } from '@/shared/hooks/use-privacy';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { PageHeader } from '@/shared/components/page-header';
import { useMemberStats } from '@/features/members/hooks/use-members';
import { useMembershipStats } from '@/features/memberships/hooks/use-memberships';
import { useTrainingStats } from '@/features/training/hooks/use-training';
import { useProjection, useMemberGrowth, useRevenueBreakdown } from '../hooks/use-analytics';
import { formatCurrency } from '@/shared/lib/utils';
import {
  MemberGrowthCard,
  RevenueBreakdownCard,
  DiscountsCard,
  TopPlansCard,
  RetentionCard,
  PaymentMethodsCard,
  DemographicsCard,
  TrainerPerformanceCard,
  MembershipDurationCard,
  UnitEconomicsCard,
  LifetimeEarningsPieCard,
  SectionLabel,
  TimeToggle,
} from './analytics-cards';

// ─── Stat Strip ───────────────────────────────────────────────────────────────

function StatStrip() {
  const { data: mRes, isLoading: mLoading } = useMemberStats();
  const { data: msRes, isLoading: msLoading } = useMembershipStats();
  const { data: tRes, isLoading: tLoading } = useTrainingStats();
  const { isPrivate } = usePrivacy();
  const { data: growthRes } = useMemberGrowth(12);
  const { data: revRes } = useRevenueBreakdown(6);

  const members = mRes?.data;
  const ms = msRes?.data;
  const ts = tRes?.data;
  const revenue = (ms?.collectedThisMonth ?? 0) + (ts?.collectedThisMonth ?? 0);

  // Member trend — compare newThisMonth vs previous full month
  const growthPoints = (growthRes?.data ?? []).slice(-3);
  const newThisMonth = members?.newThisMonth ?? 0;
  const prevNewMembers = growthPoints[growthPoints.length - 2]?.newMembers ?? null;
  const memberTrend = prevNewMembers !== null ? newThisMonth - prevNewMembers : null;

  // Revenue trend — compare this month vs last month
  const revPoints = (revRes?.data ?? []).slice(-3);
  const prevRev = revPoints[revPoints.length - 2];
  const prevRevTotal = prevRev ? (prevRev.membership ?? 0) + (prevRev.training ?? 0) : null;
  const revTrend = prevRevTotal !== null ? revenue - prevRevTotal : null;
  const revChartData = revPoints.map(p => ({ membership: p.membership, training: p.training }));

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">

          {/* Total Members */}
          <div className="p-4 lg:p-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Total Members</p>
              {mLoading ? <Skeleton className="h-8 w-20 mt-1.5" /> : (
                <>
                  <p className="text-2xl font-bold font-display tracking-tight mt-1 text-blue-600 dark:text-blue-400">
                    {isPrivate ? <span className="tracking-widest text-muted-foreground">••••</span> : (members?.total ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isPrivate ? "••••" : `${members?.active ?? 0} active · ${members?.inactive ?? 0} inactive`}
                  </p>
                  {!isPrivate && memberTrend !== null && prevNewMembers !== null && (
                    <p className={`text-xs mt-1 flex items-center gap-0.5 font-medium ${memberTrend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {memberTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {memberTrend >= 0 ? '+' : ''}{memberTrend} new vs {prevNewMembers} last month
                    </p>
                  )}
                </>
              )}
            </div>
            {growthPoints.length > 0 && (
              <div className="shrink-0 self-end">
                <ResponsiveContainer width={72} height={40}>
                  <BarChart data={growthPoints} barSize={16} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                    <Bar dataKey="newMembers" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Active Members */}
          <div className="p-4 lg:p-5">
            <p className="text-xs text-muted-foreground font-medium">Active Members</p>
            {mLoading ? <Skeleton className="h-8 w-16 mt-1.5" /> : (
              <>
                <p className="text-2xl font-bold font-display tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
                  {isPrivate ? <span className="tracking-widest text-muted-foreground">••••</span> : (members?.active ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isPrivate ? "••••" : `out of ${members?.total ?? 0} total members`}
                </p>
                {!isPrivate && members && members.total > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((members.active / members.total) * 100)}% active rate
                  </p>
                )}
              </>
            )}
          </div>

          {/* Revenue */}
          <div className="p-4 lg:p-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Revenue This Month</p>
              {msLoading || tLoading ? <Skeleton className="h-8 w-24 mt-1.5" /> : (
                <>
                  <p className="text-2xl font-bold font-display tracking-tight mt-1 text-amber-600 dark:text-amber-400">
                    {isPrivate ? <span className="tracking-widest text-muted-foreground">••••</span> : `₹${formatCurrency(revenue)}`}
                  </p>
                  {!isPrivate && ms && ts && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ₹{formatCurrency(ms.collectedThisMonth)} memberships · ₹{formatCurrency(ts.collectedThisMonth)} training
                    </p>
                  )}
                  {!isPrivate && revTrend !== null && prevRevTotal !== null && (
                    <p className={`text-xs mt-1 flex items-center gap-0.5 font-medium ${revTrend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {revTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {revTrend >= 0 ? '+' : '-'}₹{formatCurrency(Math.abs(revTrend))} vs ₹{formatCurrency(prevRevTotal)} last month
                    </p>
                  )}
                </>
              )}
            </div>
            {revChartData.length > 0 && (
              <div className="shrink-0 self-end">
                <ResponsiveContainer width={72} height={40}>
                  <BarChart data={revChartData} barSize={12} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                    <Bar dataKey="membership" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="training" stackId="a" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}

// ─── Forecast Banner ──────────────────────────────────────────────────────────

type TimeWindow = 3 | 6 | 12 | 24 | 36;

function ForecastBanner() {
  const [dataWindow, setDataWindow] = useState<TimeWindow>(3);
  const [horizon, setHorizon] = useState<TimeWindow>(12);
  const [scenario, setScenario] = useState<'worst' | 'base' | 'best'>('base');
  const { data: res, isLoading } = useProjection(dataWindow, horizon);
  const proj = res?.data;
  const scenarioData = proj?.[scenario];
  const inp = proj?.inputs;

  const scenarioConfig = {
    worst: { label: 'Worst case',   color: 'text-red-600 dark:text-red-400',      activeBg: 'bg-red-50 dark:bg-red-950/30',      desc: '−20% joins · +20% churn' },
    base:  { label: 'Most likely',  color: 'text-violet-600 dark:text-violet-400', activeBg: 'bg-violet-50 dark:bg-violet-950/30', desc: 'Current pace' },
    best:  { label: 'Best case',    color: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-50 dark:bg-emerald-950/30', desc: '+30% joins · −20% churn' },
  };

  const sc = scenarioConfig[scenario];

  return (
    <Card className="overflow-hidden border-t-2 border-violet-500">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold">Where you're headed</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Based on last {dataWindow} months of data · projecting {horizon} months ahead
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-muted-foreground">Learn from</span>
            <TimeToggle value={dataWindow} onChange={setDataWindow} options={[3, 6, 12]} />
            <span className="text-muted-foreground">Project</span>
            <TimeToggle value={horizon} onChange={setHorizon} options={[12, 24, 36]} />
          </div>
        </div>

        {/* Scenario selector */}
        <div className="flex gap-2 mt-4">
          {(['worst', 'base', 'best'] as const).map((s) => (
            <button key={s} onClick={() => setScenario(s)}
              className={`flex-1 rounded-lg border px-3 py-2.5 text-left transition-all ${scenario === s ? `${scenarioConfig[s].activeBg} ${scenarioConfig[s].color}` : 'text-muted-foreground hover:bg-muted/40'}`}>
              <p className="text-xs font-semibold">{scenarioConfig[s].label}</p>
              <p className="text-[11px] opacity-70 mt-0.5">{scenarioConfig[s].desc}</p>
            </button>
          ))}
        </div>
      </div>

      <CardContent className="p-5">
        {/* Warnings */}
        {inp?.fixedCostSource === 'actual_avg' && inp.fixedCostPerMonth === 0 && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2 mb-4">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            No expenses logged — projection treats costs as zero. Add expenses in Financials for accuracy.
          </div>
        )}
        {inp && inp.dataPoints < dataWindow && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2 mb-4">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Only {inp.dataPoints} month{inp.dataPoints !== 1 ? 's' : ''} of data — low confidence.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ) : scenarioData ? (
          <div className="space-y-5">
            {/* 3 KPI tiles */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Payback period', value: scenarioData.paybackMonth ? `${scenarioData.paybackMonth} mo` : '> horizon', sub: 'to recover investment', color: sc.color },
                { label: `ROI at ${horizon}M`, value: scenarioData.roiAtHorizon != null ? `${scenarioData.roiAtHorizon.toFixed(0)}%` : '—', sub: 'return on investment', color: (scenarioData.roiAtHorizon ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500' },
                { label: `Members at ${horizon}M`, value: String(scenarioData.months[scenarioData.months.length - 1]?.members ?? '—'), sub: 'projected headcount', color: 'text-blue-600 dark:text-blue-400' },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="rounded-xl border bg-muted/20 p-4 text-center">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                  <p className={`text-2xl font-bold font-display mt-1.5 ${color}`}>{value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Assumptions */}
            {inp && (
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'ARPU', value: `₹${formatCurrency(inp.arpu)}/mo` },
                  { label: 'Churn', value: `${inp.churnPercent.toFixed(1)}%/mo` },
                  { label: 'Fixed cost', value: `₹${formatCurrency(inp.fixedCostPerMonth)}/mo${inp.fixedCostSource === 'actual_avg' ? ' · actual avg' : ''}` },
                  { label: 'Starting members', value: String(inp.activeMembers) },
                ].map(({ label, value }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 rounded-full border bg-muted/30 px-3 py-1 text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Month table */}
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {['Month', 'Members', 'Revenue', 'Cost', 'Profit', 'Cumulative'].map((h, i) => (
                      <th key={h} className={`px-3 py-2.5 font-medium text-muted-foreground ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scenarioData.months.map((m, i) => {
                    const isPayback = m.month === scenarioData.paybackMonth;
                    return (
                      <tr key={m.month} className={`border-b last:border-0 ${isPayback ? 'bg-emerald-50 dark:bg-emerald-950/20' : i % 2 === 1 ? 'bg-muted/10' : ''}`}>
                        <td className="px-3 py-2 font-medium">
                          M{m.month}
                          {isPayback && <span className="ml-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded-full">Payback</span>}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{m.members}</td>
                        <td className="px-3 py-2 text-right tabular-nums">₹{formatCurrency(m.revenue)}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">₹{formatCurrency(m.cost)}</td>
                        <td className={`px-3 py-2 text-right tabular-nums font-medium ${m.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                          {m.profit >= 0 ? '+' : '−'}₹{formatCurrency(Math.abs(m.profit))}
                        </td>
                        <td className={`px-3 py-2 text-right tabular-nums ${m.cumulativeProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                          {m.cumulativeProfit < 0 ? '−' : ''}₹{formatCurrency(Math.abs(m.cumulativeProfit))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Analytics"
        description="Your gym at a glance"
      />

      {/* Pulse — the four numbers every gym owner checks first */}
      <StatStrip />

      {/* Growth */}
      <SectionLabel>Growth</SectionLabel>
      <div className="grid gap-4 md:grid-cols-2">
        <MemberGrowthCard />
        <RetentionCard />
      </div>

      {/* Business health */}
      <SectionLabel>Business Health</SectionLabel>
      <div className="grid gap-4 md:grid-cols-2">
        <LifetimeEarningsPieCard />
        <UnitEconomicsCard />
      </div>

      {/* Revenue */}
      <SectionLabel>Revenue</SectionLabel>
      <div className="grid gap-4 md:grid-cols-2">
        <RevenueBreakdownCard />
        <TopPlansCard />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <DiscountsCard />
        <PaymentMethodsCard />
      </div>

      {/* Members */}
      <SectionLabel>Members</SectionLabel>
      <div className="grid gap-4 md:grid-cols-2">
        <DemographicsCard />
        <MembershipDurationCard />
      </div>

      {/* Trainers */}
      <SectionLabel>Trainers</SectionLabel>
      <TrainerPerformanceCard />

      {/* Forecast — full width, intentionally last */}
      <ForecastBanner />
    </div>
  );
}

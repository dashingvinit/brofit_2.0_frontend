import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  Users,
  UserCheck,
  Dumbbell,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  CalendarDays,
  UserX,
  Activity,
  LogIn,
  Plus,
  AlertTriangle,
  Clock,
  Bell,
  BellRing,
  Loader2,
  Snowflake,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useMemberStats } from "@/features/members/hooks/use-members";
import { useExpiringMemberships, useMemberships } from "@/features/memberships/hooks/use-memberships";
import {
  useTrainingStats,
  useExpiringTrainings,
} from "@/features/training/hooks/use-training";
import {
  useDuesReport,
  useInactiveCandidates,
} from "@/features/members/hooks/use-member-detail";
import {
  useAttendanceTodayStats,
  useAttendanceInside,
} from "@/features/attendance/hooks/use-attendance";
import { usePingMember } from "@/features/settings/hooks/use-notification-settings";
import { useMonthlySummaryWithDelta } from "@/features/financials/hooks/use-financials";
import { ROUTES } from "@/shared/lib/constants";
import { useFromState } from "@/shared/hooks/use-return-to";
import { usePrivacy } from "@/shared/hooks/use-privacy";
import { formatCurrency, daysUntil } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";
import type { Membership, Training } from "@/shared/types/common.types";

// ─── Inline StatCard ────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  shortLabel: string;
  value: number | undefined;
  subtext?: string;
  icon: React.ElementType;
  accentClass: string;
  valueClass: string;
  isLoading: boolean;
  isCurrency?: boolean;
  hidden?: boolean;
  animationDelay?: number;
}

function StatCard({
  label,
  shortLabel,
  value,
  subtext,
  icon: Icon,
  accentClass,
  valueClass,
  isLoading,
  isCurrency,
  hidden = false,
  animationDelay = 0,
}: StatCardProps) {
  const delayClass =
    animationDelay === 0 ? "delay-0" :
    animationDelay <= 75 ? "delay-75" :
    animationDelay <= 150 ? "delay-150" : "delay-300";

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden border-l-[3px]", accentClass)}>
        {/* Mobile */}
        <div className="p-3 lg:hidden flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
        {/* Desktop */}
        <div className="hidden lg:flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </Card>
    );
  }

  const displayValue = hidden ? (
    <span className="tracking-widest text-muted-foreground/60 font-normal">••••</span>
  ) : isCurrency ? (
    <span className="inline-flex items-baseline gap-0.5">
      <IndianRupee className="h-4 w-4 lg:h-5 lg:w-5 self-center" />
      {formatCurrency(value ?? 0)}
    </span>
  ) : (
    value ?? 0
  );

  return (
    <Card
      className={cn(
        "overflow-hidden border-l-[3px] transition-all duration-200 hover:shadow-md",
        "animate-in fade-in zoom-in-95 duration-300 fill-mode-both",
        accentClass,
        delayClass,
      )}
    >
      {/* Mobile compact */}
      <div className="p-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className={cn("rounded-md p-1.5 shrink-0 bg-muted/60")}>
            <Icon className={cn("h-3.5 w-3.5", valueClass)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-muted-foreground truncate">{shortLabel}</p>
            <p className={cn("text-lg font-bold leading-tight tracking-tight font-display", valueClass)}>
              {displayValue}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop full */}
      <div className="hidden lg:flex flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <div className="rounded-md p-1.5 bg-muted/60 shrink-0 mt-0.5">
            <Icon className={cn("h-3.5 w-3.5", valueClass)} />
          </div>
        </div>
        <p className={cn("text-[28px] font-bold tracking-tight font-display leading-none mt-2", valueClass)}>
          {displayValue}
        </p>
        {!hidden && subtext && (
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        )}
      </div>
    </Card>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  iconClass,
  title,
  badge,
  action,
}: {
  icon: React.ElementType;
  iconClass: string;
  title: string;
  badge?: number | string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", iconClass)} />
        <h3 className="text-sm font-semibold">{title}</h3>
        {badge !== undefined && badge !== 0 && (
          <span className="inline-flex items-center justify-center h-4.5 min-w-[1.125rem] px-1 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground leading-none">
            {badge}
          </span>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs font-medium text-primary/80 hover:text-primary inline-flex items-center gap-1 transition-colors"
        >
          {action.label}
          <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const fromState = useFromState();
  const { isPrivate } = usePrivacy();
  // memberId → "sending" | "sent" | "error"
  const [pingState, setPingState] = useState<Record<string, "sending" | "sent" | "error">>({});
  const { mutate: pingMember } = usePingMember();

  const handlePing = useCallback((memberId: string, type: "dues" | "no-subscription", e: React.MouseEvent) => {
    e.stopPropagation();
    if (pingState[memberId] === "sending" || pingState[memberId] === "sent") return;
    setPingState((s) => ({ ...s, [memberId]: "sending" }));
    pingMember(
      { memberId, type },
      {
        onSuccess: () => setPingState((s) => ({ ...s, [memberId]: "sent" })),
        onError: () => setPingState((s) => ({ ...s, [memberId]: "error" })),
      },
    );
  }, [pingMember, pingState]);

  const { data: memberStatsRes, isLoading: isLoadingMembers } = useMemberStats();
  const { data: trainingStatsRes, isLoading: isLoadingTrainings } = useTrainingStats();
  const { data: expiringMembershipsRes } = useExpiringMemberships(7);
  const { data: expiringTrainingsRes } = useExpiringTrainings(7);
  const { data: inactiveSubRes } = useInactiveCandidates(1, 5);
  const { data: duesReportRes, isLoading: isLoadingDues } = useDuesReport(1, 10);
  const { data: attendanceStatsRes, isLoading: isLoadingAttendance } = useAttendanceTodayStats();
  const { data: attendanceInsideRes } = useAttendanceInside();
  const { data: summaryDeltaRes, isLoading: isLoadingSummaryDelta } = useMonthlySummaryWithDelta();
  // Frozen and upcoming memberships — always need visibility even though they're excluded from "no membership"
  const { data: frozenMembershipsRes } = useMemberships(1, 50, 'frozen');
  const { data: upcomingMembershipsRes } = useMemberships(1, 50, 'upcoming');

  const memberStats = memberStatsRes?.data;
  const trainingStats = trainingStatsRes?.data;

  const summaryDelta = summaryDeltaRes?.data;
  const netThisMonth = summaryDelta?.thisMonth.netProfit ?? 0;

  // Delta: prefer YoY (same month last year) when available, otherwise MoM,
  // otherwise none (new gyms with <1 month of data).
  const deltaSubtext = (() => {
    if (!summaryDelta) return undefined;
    const pickBaseline = () => {
      const yoy = summaryDelta.sameMonthLastYear;
      if (yoy && (yoy.revenue > 0 || yoy.expenses > 0)) {
        const d = new Date(yoy.from);
        const label = d.toLocaleString("en-US", { month: "short", year: "numeric" });
        return { net: yoy.netProfit, label: `vs ${label}` };
      }
      const mom = summaryDelta.lastMonth;
      if (mom && (mom.revenue > 0 || mom.expenses > 0)) {
        const d = new Date(mom.from);
        const label = d.toLocaleString("en-US", { month: "short" });
        return { net: mom.netProfit, label: `vs ${label}` };
      }
      return null;
    };
    const baseline = pickBaseline();
    if (!baseline) return undefined;
    const diff = netThisMonth - baseline.net;
    const sign = diff >= 0 ? "+" : "−";
    return `${sign}₹${formatCurrency(Math.abs(diff))} ${baseline.label}`;
  })();

  const inactiveSubMembers = inactiveSubRes?.data ?? [];
  const inactiveTotalCount = inactiveSubRes?.pagination?.total ?? 0;
  const duesMembers = duesReportRes?.data ?? [];
  const duesSummary = duesReportRes?.summary ?? { totalMembersWithDues: 0, grandTotal: 0 };
  const frozenMemberships = frozenMembershipsRes?.data ?? [];
  const upcomingMemberships = upcomingMembershipsRes?.data ?? [];
  const pausedItems = [
    ...frozenMemberships.map((m) => ({ ...m, _tag: 'frozen' as const })),
    ...upcomingMemberships.map((m) => ({ ...m, _tag: 'upcoming' as const })),
  ];
  const pausedCount = frozenMemberships.length + upcomingMemberships.length;

  const attendanceStats = attendanceStatsRes?.data;
  const currentlyInside = attendanceInsideRes?.data?.records ?? [];
  const todayTotal = attendanceStats?.totalToday ?? 0;
  const insideCount = attendanceStats?.currentlyInside ?? currentlyInside.length;

  const expiringItems = [
    ...(expiringMembershipsRes?.data ?? [] as Membership[]).map((m) => ({
      id: m.id,
      name: m.member ? `${m.member.firstName} ${m.member.lastName}` : "Unknown",
      plan: m.planVariant?.planType?.name ?? "N/A",
      endDate: m.endDate,
      type: "membership" as const,
      path: `/memberships/${m.id}`,
    })),
    ...(expiringTrainingsRes?.data ?? [] as Training[]).map((t) => ({
      id: t.id,
      name: t.member ? `${t.member.firstName} ${t.member.lastName}` : "Unknown",
      plan: `${t.planVariant?.planType?.name ?? "N/A"} (${t.trainer?.name ?? "—"})`,
      endDate: t.endDate,
      type: "training" as const,
      path: `/trainings/${t.id}`,
    })),
  ].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight font-display">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {greeting}, {user?.firstName || "there"}.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            size="sm"
            className="gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-white border-0 text-xs"
            onClick={() => navigate(ROUTES.REGISTER_MEMBER)}
          >
            <UserCheck className="h-3.5 w-3.5" />
            Add Member
          </Button>
          <Button
            size="sm"
            className="gap-1.5 h-8 bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-xs"
            onClick={() => navigate(ROUTES.CREATE_MEMBERSHIP, fromState)}
          >
            <Plus className="h-3.5 w-3.5" />
            Membership
          </Button>
          <Button
            size="sm"
            className="gap-1.5 h-8 bg-violet-600 hover:bg-violet-700 text-white border-0 text-xs"
            onClick={() => navigate(ROUTES.CREATE_TRAINING, fromState)}
          >
            <Plus className="h-3.5 w-3.5" />
            Training
          </Button>
        </div>
      </div>

      {/* ── Key Stats ── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Members" shortLabel="Members"
          value={memberStats?.total}
          subtext={memberStats ? `${memberStats.total - memberStats.active} inactive` : undefined}
          icon={Users}
          accentClass="border-l-blue-500"
          valueClass="text-blue-600 dark:text-blue-400"
          isLoading={isLoadingMembers} animationDelay={0} hidden={isPrivate}
        />
        <StatCard
          label="Active Members" shortLabel="Active"
          value={memberStats?.active}
          subtext={memberStats ? `of ${memberStats.total} total` : undefined}
          icon={UserCheck}
          accentClass="border-l-emerald-500"
          valueClass="text-emerald-600 dark:text-emerald-400"
          isLoading={isLoadingMembers} animationDelay={75} hidden={isPrivate}
        />
        <StatCard
          label="Active Trainings" shortLabel="Trainings"
          value={trainingStats?.active}
          subtext={trainingStats ? `${trainingStats.newThisMonth} new this month` : undefined}
          icon={Dumbbell}
          accentClass="border-l-violet-500"
          valueClass="text-violet-600 dark:text-violet-400"
          isLoading={isLoadingTrainings} animationDelay={150} hidden={isPrivate}
        />
        <StatCard
          label="Net This Month" shortLabel="Net"
          value={netThisMonth}
          subtext={deltaSubtext}
          icon={TrendingUp}
          accentClass={netThisMonth < 0 ? "border-l-red-500" : "border-l-amber-500"}
          valueClass={netThisMonth < 0 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}
          isLoading={isLoadingSummaryDelta} isCurrency animationDelay={225} hidden={isPrivate}
        />
      </div>

      {/* ── Three-column row ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Today's Attendance */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <SectionHeader
              icon={Activity}
              iconClass="text-emerald-600 dark:text-emerald-400"
              title="Today's Attendance"
              action={{ label: "View all", onClick: () => navigate(ROUTES.ATTENDANCE) }}
            />

            {isLoadingAttendance ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
                <Skeleton className="h-24 rounded-xl" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Inside Now */}
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 flex flex-col items-center justify-center gap-1 min-h-[76px]">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                        Inside
                      </p>
                    </div>
                    <p className="text-3xl font-bold font-display text-emerald-700 dark:text-emerald-400 leading-none">
                      {insideCount}
                    </p>
                  </div>

                  {/* Total Today */}
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 flex flex-col items-center justify-center gap-1 min-h-[76px]">
                    <div className="flex items-center gap-1.5">
                      <LogIn className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                        Today
                      </p>
                    </div>
                    <p className="text-3xl font-bold font-display text-blue-700 dark:text-blue-400 leading-none">
                      {todayTotal}
                    </p>
                  </div>
                </div>

                {/* Currently inside list */}
                {currentlyInside.length > 0 ? (
                  <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Currently inside
                    </p>
                    {currentlyInside.slice(0, 3).map((r) => (
                      <div key={r.id} className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                          {r.member ? `${r.member.firstName[0]}${r.member.lastName[0]}` : "?"}
                        </div>
                        <span className="text-sm font-medium truncate">
                          {r.member ? `${r.member.firstName} ${r.member.lastName}` : "—"}
                        </span>
                      </div>
                    ))}
                    {currentlyInside.length > 3 && (
                      <p className="text-xs text-muted-foreground pl-8.5">
                        +{currentlyInside.length - 3} more
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed flex items-center justify-center min-h-[60px]">
                    <p className="text-xs text-muted-foreground">No check-ins yet today</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <SectionHeader
              icon={CalendarDays}
              iconClass="text-amber-600 dark:text-amber-400"
              title="Expiring in 7 Days"
              badge={expiringItems.length}
              action={expiringItems.length > 5 ? { label: `View all ${expiringItems.length}`, onClick: () => navigate(`${ROUTES.MEMBERSHIPS}?expiring=true`) } : undefined}
            />

            {expiringItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[120px] gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  No expirations in the next 7 days
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {expiringItems.slice(0, 5).map((item) => {
                  const days = daysUntil(item.endDate);
                  const urgent = days <= 2;
                  const UrgencyIcon = urgent ? AlertTriangle : Clock;
                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      role="button"
                      tabIndex={0}
                      className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => navigate(item.path, fromState)}
                      onKeyDown={(e) => e.key === "Enter" && navigate(item.path, fromState)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn(
                          "rounded-full p-1.5 shrink-0",
                          urgent ? "bg-red-100 dark:bg-red-950/50" : "bg-amber-100 dark:bg-amber-950/50"
                        )}>
                          <UrgencyIcon className={cn(
                            "h-3 w-3",
                            urgent ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                          )} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.plan}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className={cn(
                          "text-xs font-semibold tabular-nums whitespace-nowrap",
                          urgent ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                        )}>
                          {days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attention Required — Frozen/Upcoming + No Active Membership */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 space-y-4">

            {/* ── Sub-section 1: Frozen & Upcoming ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Snowflake className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <h3 className="text-sm font-semibold">Frozen / Upcoming</h3>
                  {pausedCount > 0 && (
                    <span className="inline-flex items-center justify-center h-4.5 min-w-[1.125rem] px-1 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground leading-none">
                      {pausedCount}
                    </span>
                  )}
                </div>
                {pausedCount > 0 && (
                  <button
                    onClick={() => navigate(`${ROUTES.MEMBERSHIPS}`)}
                    className="text-xs font-medium text-primary/80 hover:text-primary inline-flex items-center gap-1 transition-colors"
                  >
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>

              {pausedCount === 0 ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Snowflake className="h-3 w-3 text-muted-foreground" />
                  </div>
                  No frozen or upcoming memberships
                </div>
              ) : (
                <div className="divide-y">
                  {pausedItems.slice(0, 4).map((m) => {
                    const memberName = m.member
                      ? `${m.member.firstName} ${m.member.lastName}`
                      : 'Unknown';
                    const planName = m.planVariant?.planType?.name ?? 'N/A';
                    const isFrozen = m._tag === 'frozen';
                    const dateLabel = isFrozen
                      ? (m.freezeEndDate ? `Until ${new Date(m.freezeEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Frozen')
                      : `Starts ${new Date(m.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between py-2 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                        onClick={() => navigate(`/memberships/${m.id}`, fromState)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                            isFrozen
                              ? "bg-blue-100 dark:bg-blue-950/50"
                              : "bg-violet-100 dark:bg-violet-950/50"
                          )}>
                            {isFrozen
                              ? <Snowflake className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              : <CalendarClock className="h-3 w-3 text-violet-600 dark:text-violet-400" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{memberName}</p>
                            <p className="text-xs text-muted-foreground truncate">{planName}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs font-semibold whitespace-nowrap tabular-nums shrink-0 ml-2",
                          isFrozen
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-violet-600 dark:text-violet-400"
                        )}>
                          {dateLabel}
                        </span>
                      </div>
                    );
                  })}
                  {pausedCount > 4 && (
                    <p className="text-xs text-muted-foreground pt-2 text-center">
                      +{pausedCount - 4} more —{" "}
                      <button
                        className="text-primary/80 hover:text-primary font-medium"
                        onClick={() => navigate(ROUTES.MEMBERSHIPS)}
                      >
                        view all
                      </button>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="border-t" />

            {/* ── Sub-section 2: No Active Membership ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <h3 className="text-sm font-semibold">No Membership</h3>
                  {inactiveTotalCount > 0 && (
                    <span className="inline-flex items-center justify-center h-4.5 min-w-[1.125rem] px-1 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground leading-none">
                      {inactiveTotalCount}
                    </span>
                  )}
                </div>
                {inactiveTotalCount > 4 && (
                  <button
                    onClick={() => navigate(`${ROUTES.MEMBERS}?noMembership=true`)}
                    className="text-xs font-medium text-primary/80 hover:text-primary inline-flex items-center gap-1 transition-colors"
                  >
                    View all {inactiveTotalCount}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>

              {inactiveSubMembers.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <UserCheck className="h-3 w-3 text-muted-foreground" />
                  </div>
                  All active members have a membership
                </div>
              ) : (
                <div className="divide-y">
                  {inactiveSubMembers.map((member) => {
                    const daysDiff = member.lastSubscriptionEnd ? daysUntil(member.lastSubscriptionEnd) : null;
                    const expiredAgo = daysDiff !== null && daysDiff < 0 ? Math.abs(daysDiff) : null;
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between py-2 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors group"
                        onClick={() => navigate(`/members/${member.id}`)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center justify-center text-[10px] font-bold text-red-700 dark:text-red-400 shrink-0">
                            {member.firstName[0]}{member.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{member.firstName} {member.lastName}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-xs font-medium text-red-600 dark:text-red-400 whitespace-nowrap tabular-nums">
                            {expiredAgo !== null ? `${expiredAgo}d ago` : "Never"}
                          </span>
                          <button
                            className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline whitespace-nowrap"
                            onClick={(e) => { e.stopPropagation(); navigate(`${ROUTES.CREATE_MEMBERSHIP}?memberId=${member.id}`, fromState); }}
                          >
                            + Add
                          </button>
                          {member.phone && (
                            <button
                              className={cn(
                                "opacity-0 group-hover:opacity-100 transition-all p-1 rounded-md",
                                pingState[member.id] === "sent"
                                  ? "opacity-100 text-green-600 dark:text-green-400"
                                  : pingState[member.id] === "error"
                                  ? "opacity-100 text-destructive"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              )}
                              title={pingState[member.id] === "sent" ? "Reminder sent" : pingState[member.id] === "error" ? "Failed to send" : "Send WhatsApp reminder"}
                              onClick={(e) => handlePing(member.id, "no-subscription", e)}
                              disabled={pingState[member.id] === "sending" || pingState[member.id] === "sent"}
                            >
                              {pingState[member.id] === "sending"
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : pingState[member.id] === "sent"
                                ? <BellRing className="h-3.5 w-3.5" />
                                : <Bell className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>

      {/* ── Outstanding Dues ── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold">Outstanding Dues</h3>
              {!isLoadingDues && duesSummary.totalMembersWithDues > 0 && (
                <span className="inline-flex items-center justify-center h-4.5 min-w-[1.125rem] px-1 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground leading-none">
                  {duesSummary.totalMembersWithDues}
                </span>
              )}
            </div>
            {!isLoadingDues && duesSummary.grandTotal > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                <IndianRupee className="h-3 w-3" />
                {formatCurrency(duesSummary.grandTotal)}
              </span>
            )}
          </div>

          {isLoadingDues ? (
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          ) : duesMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[80px] gap-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">All payments are up to date</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Member</th>
                      <th className="text-right py-2.5 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Membership</th>
                      <th className="text-right py-2.5 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Training</th>
                      <th className="text-right py-2.5 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Due</th>
                      <th className="w-10 py-2.5 px-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {duesMembers.map((m) => (
                      <tr
                        key={m.memberId}
                        className="cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => navigate(`/members/${m.memberId}`)}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0">
                              {m.firstName[0]}{m.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{m.firstName} {m.lastName}</p>
                              <p className="text-xs text-muted-foreground">{isPrivate ? "••••••••" : m.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {m.membershipDuesTotal > 0
                            ? <span className="inline-flex items-center font-medium text-foreground tabular-nums"><IndianRupee className="h-3 w-3" />{formatCurrency(m.membershipDuesTotal)}</span>
                            : <span className="text-muted-foreground/50">—</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {m.trainingDuesTotal > 0
                            ? <span className="inline-flex items-center font-medium text-foreground tabular-nums"><IndianRupee className="h-3 w-3" />{formatCurrency(m.trainingDuesTotal)}</span>
                            : <span className="text-muted-foreground/50">—</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="font-bold text-amber-600 dark:text-amber-400 inline-flex items-center tabular-nums">
                            <IndianRupee className="h-3 w-3" />{formatCurrency(m.totalDue)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            className={cn(
                              "p-1 rounded-md transition-all",
                              pingState[m.memberId] === "sent"
                                ? "text-green-600 dark:text-green-400"
                                : pingState[m.memberId] === "error"
                                ? "text-destructive"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                            title={pingState[m.memberId] === "sent" ? "Reminder sent" : pingState[m.memberId] === "error" ? "Failed to send" : "Send dues reminder"}
                            onClick={(e) => handlePing(m.memberId, "dues", e)}
                            disabled={pingState[m.memberId] === "sending" || pingState[m.memberId] === "sent"}
                          >
                            {pingState[m.memberId] === "sending"
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : pingState[m.memberId] === "sent"
                              ? <BellRing className="h-3.5 w-3.5" />
                              : <Bell className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-2.5 sm:hidden">
                {duesMembers.map((m) => (
                  <div
                    key={m.memberId}
                    className="rounded-xl border p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => navigate(`/members/${m.memberId}`)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0">
                          {m.firstName[0]}{m.lastName[0]}
                        </div>
                        <p className="font-medium text-sm">{m.firstName} {m.lastName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-600 dark:text-amber-400 inline-flex items-center text-sm tabular-nums">
                          <IndianRupee className="h-3 w-3" />{formatCurrency(m.totalDue)}
                        </span>
                        <button
                          className={cn(
                            "p-1 rounded-md transition-all",
                            pingState[m.memberId] === "sent"
                              ? "text-green-600 dark:text-green-400"
                              : pingState[m.memberId] === "error"
                              ? "text-destructive"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          title={pingState[m.memberId] === "sent" ? "Reminder sent" : "Send dues reminder"}
                          onClick={(e) => handlePing(m.memberId, "dues", e)}
                          disabled={pingState[m.memberId] === "sending" || pingState[m.memberId] === "sent"}
                        >
                          {pingState[m.memberId] === "sending"
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : pingState[m.memberId] === "sent"
                            ? <BellRing className="h-3.5 w-3.5" />
                            : <Bell className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pl-8">
                      <span>{isPrivate ? "••••••••" : m.phone}</span>
                      <span className="tabular-nums">
                        {m.membershipDuesTotal > 0 && `M: ₹${formatCurrency(m.membershipDuesTotal)}`}
                        {m.membershipDuesTotal > 0 && m.trainingDuesTotal > 0 && " · "}
                        {m.trainingDuesTotal > 0 && `T: ₹${formatCurrency(m.trainingDuesTotal)}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {duesSummary.totalMembersWithDues > duesMembers.length && (
                <div className="mt-3 pt-3 border-t text-center">
                  <button
                    className="text-xs font-medium text-primary/80 hover:text-primary inline-flex items-center gap-1 transition-colors"
                    onClick={() => navigate(`${ROUTES.MEMBERS}?dues=true`)}
                  >
                    View all {duesSummary.totalMembersWithDues} members with dues
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

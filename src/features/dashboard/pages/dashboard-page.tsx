import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  Users,
  UserCheck,
  CreditCard,
  Dumbbell,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
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
import { PageHeader } from "@/shared/components/page-header";
import { useMemberStats } from "@/features/members/hooks/use-members";
import {
  useMembershipStats,
  useExpiringMemberships,
} from "@/features/memberships/hooks/use-memberships";
import {
  useTrainingStats,
  useExpiringTrainings,
} from "@/features/training/hooks/use-training";
import { useDuesReport } from "@/features/members/hooks/use-member-detail";
import { ROUTES } from "@/shared/lib/constants";
import type { Membership, Training } from "@/shared/types/common.types";

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-IN");
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function StatCard({
  label,
  shortLabel,
  value,
  subtext,
  icon: Icon,
  colorClass,
  bgClass,
  isLoading,
  isCurrency,
}: {
  label: string;
  shortLabel: string;
  value: number | undefined;
  subtext?: string;
  icon: typeof Users;
  colorClass: string;
  bgClass: string;
  isLoading: boolean;
  isCurrency?: boolean;
}) {
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
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      {/* Compact layout on mobile */}
      <div className="p-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className={`rounded-lg p-2 shrink-0 ${bgClass}`}>
            <Icon className={`h-4 w-4 ${colorClass}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground leading-tight truncate">
              {shortLabel}
            </p>
            <p className="text-lg font-bold leading-tight tracking-tight">
              {isCurrency ? (
                <span className="inline-flex items-center">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {formatCurrency(value ?? 0)}
                </span>
              ) : (
                (value ?? 0)
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
          <div className={`rounded-lg p-2 ${bgClass}`}>
            <Icon className={`h-4 w-4 ${colorClass}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {isCurrency ? (
              <span className="inline-flex items-center">
                <IndianRupee className="h-5 w-5" />
                {formatCurrency(value ?? 0)}
              </span>
            ) : (
              (value ?? 0)
            )}
          </div>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

function ExpiringItem({
  name,
  plan,
  endDate,
  type,
  onClick,
}: {
  name: string;
  plan: string;
  endDate: string;
  type: "membership" | "training";
  onClick: () => void;
}) {
  const days = daysUntil(endDate);
  const urgent = days <= 2;

  return (
    <div
      className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`rounded-full p-1.5 shrink-0 ${
            urgent
              ? "bg-red-100 dark:bg-red-950/50"
              : "bg-amber-100 dark:bg-amber-950/50"
          }`}
        >
          <AlertTriangle
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

export function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const { data: memberStatsRes, isLoading: isLoadingMembers } =
    useMemberStats();
  const { data: membershipStatsRes, isLoading: isLoadingMemberships } =
    useMembershipStats();
  const { data: trainingStatsRes, isLoading: isLoadingTrainings } =
    useTrainingStats();
  const { data: expiringMembershipsRes } = useExpiringMemberships(7);
  const { data: expiringTrainingsRes } = useExpiringTrainings(7);
  const { data: duesReportRes, isLoading: isLoadingDues } = useDuesReport(
    1,
    10,
  );

  const memberStats = memberStatsRes?.data;
  const membershipStats = membershipStatsRes?.data;
  const trainingStats = trainingStatsRes?.data;

  const expiringMemberships: Membership[] = expiringMembershipsRes?.data ?? [];
  const expiringTrainings: Training[] = expiringTrainingsRes?.data ?? [];

  const totalRevenue =
    (membershipStats?.totalCollected ?? 0) +
    (trainingStats?.totalCollected ?? 0);
  const revenueThisMonth =
    (membershipStats?.collectedThisMonth ?? 0) +
    (trainingStats?.collectedThisMonth ?? 0);

  const duesMembers = duesReportRes?.data ?? [];
  const duesSummary = duesReportRes?.summary ?? {
    totalMembersWithDues: 0,
    grandTotal: 0,
  };

  const expiringItems = [
    ...expiringMemberships.map((m) => ({
      id: m.id,
      name: m.member ? `${m.member.firstName} ${m.member.lastName}` : "Unknown",
      plan: m.planVariant?.planType?.name ?? "N/A",
      endDate: m.endDate,
      type: "membership" as const,
      path: `/memberships/${m.id}`,
    })),
    ...expiringTrainings.map((t) => ({
      id: t.id,
      name: t.member ? `${t.member.firstName} ${t.member.lastName}` : "Unknown",
      plan: `${t.planVariant?.planType?.name ?? "N/A"} (${t.trainer?.name ?? "—"})`,
      endDate: t.endDate,
      type: "training" as const,
      path: `/trainings/${t.id}`,
    })),
  ].sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.firstName || "User"}!`}
        actions={
          <>
            <Button
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
              onClick={() => navigate(ROUTES.REGISTER_MEMBER)}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Member</span>
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
              onClick={() => navigate(ROUTES.CREATE_MEMBERSHIP)}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Membership</span>
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-violet-600 hover:bg-violet-700 text-white border-0"
              onClick={() => navigate(ROUTES.CREATE_TRAINING)}
            >
              <Dumbbell className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Training</span>
            </Button>
          </>
        }
      />

      {/* Key Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Members"
          shortLabel="Members"
          value={memberStats?.total}
          subtext={memberStats ? `${memberStats.active} active` : undefined}
          icon={Users}
          colorClass="text-blue-600 dark:text-blue-400"
          bgClass="bg-blue-50 dark:bg-blue-950/50"
          isLoading={isLoadingMembers}
        />
        <StatCard
          label="Active Memberships"
          shortLabel="Memberships"
          value={membershipStats?.active}
          subtext={
            membershipStats
              ? `${membershipStats.newThisMonth} new this month`
              : undefined
          }
          icon={CreditCard}
          colorClass="text-emerald-600 dark:text-emerald-400"
          bgClass="bg-emerald-50 dark:bg-emerald-950/50"
          isLoading={isLoadingMemberships}
        />
        <StatCard
          label="Active Trainings"
          shortLabel="Trainings"
          value={trainingStats?.active}
          subtext={
            trainingStats
              ? `${trainingStats.newThisMonth} new this month`
              : undefined
          }
          icon={Dumbbell}
          colorClass="text-violet-600 dark:text-violet-400"
          bgClass="bg-violet-50 dark:bg-violet-950/50"
          isLoading={isLoadingTrainings}
        />
        <StatCard
          label="Total Revenue"
          shortLabel="Revenue"
          value={totalRevenue}
          subtext={
            revenueThisMonth > 0
              ? `₹${formatCurrency(revenueThisMonth)} this month`
              : undefined
          }
          icon={TrendingUp}
          colorClass="text-amber-600 dark:text-amber-400"
          bgClass="bg-amber-50 dark:bg-amber-950/50"
          isLoading={isLoadingMemberships || isLoadingTrainings}
          isCurrency
        />
      </div>

      {/* Revenue Breakdown + Expiring */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingMemberships || isLoadingTrainings ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium">Memberships</span>
                  </div>
                  <span className="text-sm font-semibold inline-flex items-center">
                    <IndianRupee className="h-3 w-3" />
                    {formatCurrency(membershipStats?.totalCollected ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-violet-600" />
                    <span className="text-sm font-medium">Trainings</span>
                  </div>
                  <span className="text-sm font-semibold inline-flex items-center">
                    <IndianRupee className="h-3 w-3" />
                    {formatCurrency(trainingStats?.totalCollected ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-semibold">Total</span>
                  <p className="text-lg font-bold inline-flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Expiring in 7 Days
            </CardTitle>
            {expiringItems.length > 0 && (
              <Badge variant="secondary">{expiringItems.length}</Badge>
            )}
          </CardHeader>
          <CardContent>
            {expiringItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No memberships or trainings expiring in the next 7 days.
              </p>
            ) : (
              <div className="divide-y max-h-[280px] overflow-y-auto">
                {expiringItems.slice(0, 10).map((item) => (
                  <ExpiringItem
                    key={`${item.type}-${item.id}`}
                    name={item.name}
                    plan={item.plan}
                    endDate={item.endDate}
                    type={item.type}
                    onClick={() => navigate(item.path)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Dues */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Outstanding Dues
          </CardTitle>
          <div className="flex items-center gap-3">
            {!isLoadingDues && duesSummary.grandTotal > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Grand Total</p>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400 inline-flex items-center">
                  <IndianRupee className="h-3 w-3" />
                  {formatCurrency(duesSummary.grandTotal)}
                </p>
              </div>
            )}
            {!isLoadingDues && duesSummary.totalMembersWithDues > 0 && (
              <Badge variant="secondary">
                {duesSummary.totalMembersWithDues} member
                {duesSummary.totalMembersWithDues !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingDues ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : duesMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No outstanding dues. All payments are up to date!
            </p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <div className="rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">
                          Member
                        </th>
                        <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">
                          Membership Dues
                        </th>
                        <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">
                          Training Dues
                        </th>
                        <th className="text-right py-2.5 px-3 font-medium text-muted-foreground">
                          Total Due
                        </th>
                        <th className="w-8 py-2.5 px-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {duesMembers.map((m) => (
                        <tr
                          key={m.memberId}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => navigate(`/members/${m.memberId}`)}
                        >
                          <td className="py-2.5 px-3">
                            <div>
                              <p className="font-medium">
                                {m.firstName} {m.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {m.phone}
                              </p>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {m.membershipDuesTotal > 0 ? (
                              <span className="inline-flex items-center">
                                <IndianRupee className="h-3 w-3" />
                                {formatCurrency(m.membershipDuesTotal)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {m.trainingDuesTotal > 0 ? (
                              <span className="inline-flex items-center">
                                <IndianRupee className="h-3 w-3" />
                                {formatCurrency(m.trainingDuesTotal)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center">
                              <IndianRupee className="h-3 w-3" />
                              {formatCurrency(m.totalDue)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 sm:hidden">
                {duesMembers.map((m) => (
                  <div
                    key={m.memberId}
                    className="rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/members/${m.memberId}`)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-medium text-sm">
                        {m.firstName} {m.lastName}
                      </p>
                      <span className="font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center text-sm">
                        <IndianRupee className="h-3 w-3" />
                        {formatCurrency(m.totalDue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{m.phone}</span>
                      <span>
                        {m.membershipDuesTotal > 0 &&
                          `Membership: ₹${formatCurrency(m.membershipDuesTotal)}`}
                        {m.membershipDuesTotal > 0 &&
                          m.trainingDuesTotal > 0 &&
                          " · "}
                        {m.trainingDuesTotal > 0 &&
                          `Training: ₹${formatCurrency(m.trainingDuesTotal)}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {duesSummary.totalMembersWithDues > duesMembers.length && (
                <div className="mt-3 pt-3 border-t text-center">
                  <button
                    className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
                    onClick={() => navigate(`${ROUTES.MEMBERS}?dues=true`)}
                  >
                    View all {duesSummary.totalMembersWithDues} members with
                    dues
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

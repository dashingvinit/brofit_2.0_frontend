import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  CalendarDays,
  UserX,
  IndianRupee,
  ArrowRight,
  UserPlus,
  CreditCard,
  Dumbbell,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PageHeader } from "@/shared/components/page-header";
import { ExpiringItem } from "@/shared/components/expiring-item";
import { useFromState } from "@/shared/hooks/use-return-to";
import { EmptyState } from "@/shared/components/empty-state";
import { useExpiringMemberships } from "@/features/memberships/hooks/use-memberships";
import { useExpiringTrainings } from "@/features/training/hooks/use-training";
import {
  useDuesReport,
  useInactiveCandidates,
} from "@/features/members/hooks/use-member-detail";
import { formatCurrency, daysUntil } from "@/shared/lib/utils";
import { useStaffPermissions } from "@/features/settings/hooks/use-staff-permissions";
import { Button } from "@/shared/components/ui/button";
import type { Membership, Training } from "@/shared/types/common.types";

export function ReceptionPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const fromState = useFromState();
  const { resolvedPermissions: perms } = useStaffPermissions();

  const { data: expiringMembershipsRes } = useExpiringMemberships(7);
  const { data: expiringTrainingsRes } = useExpiringTrainings(7);
  const { data: inactiveSubRes } = useInactiveCandidates(1, 10);
  const { data: duesReportRes, isLoading: isLoadingDues } = useDuesReport(
    1,
    10,
  );

  const expiringMemberships: Membership[] = expiringMembershipsRes?.data ?? [];
  const expiringTrainings: Training[] = expiringTrainingsRes?.data ?? [];

  const inactiveSubMembers = inactiveSubRes?.data ?? [];
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
        title="Reception"
        description={`Welcome, ${user?.firstName || "Staff"}!`}
      />

      {/* Quick Actions — one button per enabled permission */}
      {(perms.canRegisterMember ||
        perms.canCreateMembership ||
        perms.canCreateTraining) && (
        <div className="flex flex-wrap gap-2">
          {perms.canRegisterMember && (
            <Button onClick={() => navigate("/members/register")}>
              <UserPlus className="h-4 w-4 mr-2" />
              Register Member
            </Button>
          )}
          {perms.canCreateMembership && (
            <Button
              variant="outline"
              onClick={() => navigate("/memberships/create")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              New Membership
            </Button>
          )}
          {perms.canCreateTraining && (
            <Button
              variant="outline"
              onClick={() => navigate("/trainings/create")}
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              New Training
            </Button>
          )}
        </div>
      )}

      {/* Expiring Soon + No Active Membership */}
      <div className="grid gap-4 lg:grid-cols-2">
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
              <EmptyState message="No memberships or trainings expiring in the next 7 days." />
            ) : (
              <div className="divide-y">
                {expiringItems.slice(0, 10).map((item) => (
                  <ExpiringItem
                    key={`${item.type}-${item.id}`}
                    name={item.name}
                    plan={item.plan}
                    endDate={item.endDate}
                    type={item.type}
                    onClick={() => navigate(item.path, fromState)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* No Active Membership */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <UserX className="h-4 w-4" />
              No Active Membership
            </CardTitle>
            {inactiveSubMembers.length > 0 && (
              <Badge variant="secondary">{inactiveSubMembers.length}</Badge>
            )}
          </CardHeader>
          <CardContent>
            {inactiveSubMembers.length === 0 ? (
              <EmptyState message="All active members have a membership." />
            ) : (
              <div className="divide-y">
                {inactiveSubMembers.map((member) => {
                  const expiredAgo = member.lastSubscriptionEnd
                    ? Math.abs(daysUntil(member.lastSubscriptionEnd))
                    : null;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-full p-1.5 shrink-0 bg-red-100 dark:bg-red-950/50">
                          <UserX className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.phone}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-red-600 dark:text-red-400 whitespace-nowrap shrink-0 ml-2">
                        {expiredAgo !== null
                          ? `Expired ${expiredAgo}d ago`
                          : "Never subscribed"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Dues — amounts visible but no grand total revenue context */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Outstanding Dues
          </CardTitle>
          {!isLoadingDues && duesSummary.totalMembersWithDues > 0 && (
            <Badge variant="secondary">
              {duesSummary.totalMembersWithDues} member
              {duesSummary.totalMembersWithDues !== 1 ? "s" : ""}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingDues ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : duesMembers.length === 0 ? (
            <EmptyState message="No outstanding dues. All payments are up to date!" />
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

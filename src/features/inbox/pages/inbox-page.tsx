import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  XCircle,
  CreditCard,
  Loader2,
  CheckCircle2,
  Bell,
  ChevronRight,
  Clock,
  IndianRupee,
} from "lucide-react";
import { apiClient } from "@/shared/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/page-header";
import { ROUTES } from "@/shared/lib/constants";
import { useDuesReport } from "@/features/members/hooks/use-member-detail";

type MemberSnippet = { firstName: string; lastName: string; phone: string };

type ExpiringMembership = {
  id: string;
  memberId: string;
  endDate: string;
  member: MemberSnippet;
  planVariant: { planType: { name: string } };
};

type InboxData = {
  expiringSoon: ExpiringMembership[];
  expiredRecently: ExpiringMembership[];
};

function useInbox() {
  return useQuery<InboxData>({
    queryKey: ["inbox"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications/inbox");
      // Only consume expiringSoon and expiredRecently; dues come from /reports/dues
      return { expiringSoon: res.data.data.expiringSoon, expiredRecently: res.data.data.expiredRecently };
    },
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function Avatar({ firstName, lastName, color }: { firstName: string; lastName: string; color: string }) {
  return (
    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${color}`}>
      {getInitials(firstName, lastName)}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
  accentClass,
  emptyMessage,
  isEmpty,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  accentClass: string;
  emptyMessage: string;
  isEmpty: boolean;
}) {
  return (
    <CardHeader className="pb-2 pt-4 px-4">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {icon}
          {title}
        </CardTitle>
        {isEmpty ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="size-3.5" />
            {emptyMessage}
          </span>
        ) : (
          <Badge className={`text-xs px-2 py-0.5 rounded-full font-semibold ${accentClass}`}>
            {count}
          </Badge>
        )}
      </div>
    </CardHeader>
  );
}

export function InboxPage() {
  const { data, isLoading } = useInbox();
  const { data: duesRes, isLoading: isLoadingDues } = useDuesReport(1, 50);
  const navigate = useNavigate();

  if (isLoading || isLoadingDues) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { expiringSoon = [], expiredRecently = [] } = data ?? {};
  const duesMembers = duesRes?.data ?? [];
  const total = expiringSoon.length + expiredRecently.length + duesMembers.length;
  const allClear = total === 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inbox"
        description="Action items that need your attention."
      />

      {/* Summary bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {allClear ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
            <CheckCircle2 className="size-4" />
            You're all caught up — nothing needs attention right now.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/60 rounded-lg px-3 py-2 border">
              <Bell className="size-4" />
              <span><span className="font-semibold text-foreground">{total}</span> item{total !== 1 ? "s" : ""} need your attention</span>
            </div>
            {expiringSoon.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-2.5 py-1.5">
                <AlertTriangle className="size-3.5" />
                {expiringSoon.length} expiring soon
              </div>
            )}
            {expiredRecently.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-2.5 py-1.5">
                <XCircle className="size-3.5" />
                {expiredRecently.length} expired
              </div>
            )}
            {duesMembers.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-1.5">
                <CreditCard className="size-3.5" />
                {duesMembers.length} pending dues
              </div>
            )}
          </>
        )}
      </div>

      {/* Expiring Soon */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-amber-400" />
        <SectionHeader
          icon={<AlertTriangle className="size-3.5 text-amber-500" />}
          title="Expiring Soon"
          count={expiringSoon.length}
          accentClass="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-0"
          emptyMessage="All clear"
          isEmpty={expiringSoon.length === 0}
        />
        <CardContent className="px-4 pt-0 pb-2">
          {expiringSoon.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3">
              No memberships expiring in the next 7 days.
            </p>
          ) : (
            <div className="divide-y">
              {expiringSoon.map((m) => {
                const days = daysUntil(m.endDate);
                const urgent = days <= 2;
                return (
                  <div key={m.id} className="flex items-center gap-3 py-3 group">
                    <Avatar
                      firstName={m.member.firstName}
                      lastName={m.member.lastName}
                      color="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`${ROUTES.MEMBER_DETAIL}/${m.memberId}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {m.member.firstName} {m.member.lastName}
                        </Link>
                        <span className="text-xs text-muted-foreground hidden sm:inline">{m.member.phone}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {m.planVariant.planType.name} · expires {formatDate(m.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                        urgent
                          ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                      }`}>
                        {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigate(`${ROUTES.MEMBER_DETAIL}/${m.memberId}`)}
                      >
                        View
                        <ChevronRight className="size-3 ml-0.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expired This Week */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-red-500" />
        <SectionHeader
          icon={<XCircle className="size-3.5 text-red-500" />}
          title="Expired This Week"
          count={expiredRecently.length}
          accentClass="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0"
          emptyMessage="All clear"
          isEmpty={expiredRecently.length === 0}
        />
        <CardContent className="px-4 pt-0 pb-2">
          {expiredRecently.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3">
              No memberships expired in the last 7 days.
            </p>
          ) : (
            <div className="divide-y">
              {expiredRecently.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-3 group">
                  <Avatar
                    firstName={m.member.firstName}
                    lastName={m.member.lastName}
                    color="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`${ROUTES.MEMBER_DETAIL}/${m.memberId}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {m.member.firstName} {m.member.lastName}
                      </Link>
                      <span className="text-xs text-muted-foreground hidden sm:inline">{m.member.phone}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {m.planVariant.planType.name} · expired {formatDate(m.endDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 flex items-center gap-1">
                      <Clock className="size-3" />
                      Expired
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => navigate(`${ROUTES.MEMBER_DETAIL}/${m.memberId}`)}
                    >
                      View
                      <ChevronRight className="size-3 ml-0.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Dues */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-blue-500" />
        <SectionHeader
          icon={<CreditCard className="size-3.5 text-blue-500" />}
          title="Outstanding Dues"
          count={duesMembers.length}
          accentClass="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-0"
          emptyMessage="All settled"
          isEmpty={duesMembers.length === 0}
        />
        <CardContent className="px-4 pt-0 pb-2">
          {duesMembers.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3">
              No outstanding dues. All payments are up to date.
            </p>
          ) : (
            <div className="divide-y">
              {duesMembers.map((p) => (
                <div key={p.memberId} className="flex items-center gap-3 py-3 group">
                  <Avatar
                    firstName={p.firstName}
                    lastName={p.lastName}
                    color="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`${ROUTES.MEMBER_DETAIL}/${p.memberId}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {p.firstName} {p.lastName}
                      </Link>
                      <span className="text-xs text-muted-foreground hidden sm:inline">{p.phone}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[
                        p.membershipDuesTotal > 0 && `Membership ₹${p.membershipDuesTotal.toLocaleString("en-IN")}`,
                        p.trainingDuesTotal > 0 && `Training ₹${p.trainingDuesTotal.toLocaleString("en-IN")}`,
                      ].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-foreground flex items-center">
                      <IndianRupee className="size-3.5" />
                      {p.totalDue.toLocaleString("en-IN")}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => navigate(`${ROUTES.MEMBER_DETAIL}/${p.memberId}`)}
                    >
                      View
                      <ChevronRight className="size-3 ml-0.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

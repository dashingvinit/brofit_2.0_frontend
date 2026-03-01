import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PageHeader } from "@/shared/components/page-header";
import { MembersList } from "../components/members-list";
import {
  useMembers,
  useMemberStats,
  useSearchMembers,
} from "../hooks/use-members";
import { useDuesReport } from "../hooks/use-member-detail";
import { ROUTES } from "@/shared/lib/constants";

type StatusFilter = "all" | "active" | "inactive";

const PAGE_SIZE = 10;

const statusOptions: {
  value: StatusFilter;
  label: string;
  icon: typeof Users;
}[] = [
  { value: "all", label: "All Members", icon: Users },
  { value: "active", label: "Active", icon: UserCheck },
  { value: "inactive", label: "Inactive", icon: UserX },
];

const statCards = [
  {
    key: "total",
    label: "Total Members",
    shortLabel: "Total",
    icon: Users,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-950/50",
  },
  {
    key: "active",
    label: "Active Members",
    shortLabel: "Active",
    icon: UserCheck,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  {
    key: "inactive",
    label: "Inactive Members",
    shortLabel: "Inactive",
    icon: UserX,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-950/50",
  },
  {
    key: "newThisMonth",
    label: "New This Month",
    shortLabel: "New",
    icon: TrendingUp,
    colorClass: "text-violet-600 dark:text-violet-400",
    bgClass: "bg-violet-50 dark:bg-violet-950/50",
  },
] as const;

export function MembersListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showDues = searchParams.get("dues") === "true";

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [duesPage, setDuesPage] = useState(1);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isActiveParam =
    statusFilter === "active"
      ? true
      : statusFilter === "inactive"
        ? false
        : null;

  const { data: membersResponse, isLoading: isLoadingMembers } = useMembers(
    page,
    PAGE_SIZE,
    isActiveParam,
  );
  const { data: searchResponse, isLoading: isSearching } = useSearchMembers({
    q: debouncedSearch,
    page: 1,
    limit: 50,
  });

  const { data: statsResponse, isLoading: isLoadingStats } = useMemberStats();
  const { data: duesReportRes, isLoading: isLoadingDues } = useDuesReport(
    duesPage,
    PAGE_SIZE,
  );

  const isSearchMode = !!debouncedSearch;
  const members = isSearchMode ? searchResponse?.data : membersResponse?.data;
  const isLoading = isSearchMode ? isSearching : isLoadingMembers;
  const pagination = isSearchMode ? null : membersResponse?.pagination;

  const stats = statsResponse?.data;
  const hasActiveFilters = statusFilter !== "all" || !!debouncedSearch;
  const filterLabel =
    statusOptions.find((o) => o.value === statusFilter)?.label ?? "Filter";

  return (
    <div className="space-y-4">
      <PageHeader
        title="Members"
        description="Manage your gym members"
        actions={
          <Button
            onClick={() =>
              navigate(ROUTES.REGISTER_MEMBER || "/members/register")
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {isLoadingStats
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                {/* Compact skeleton on mobile */}
                <div className="p-3 lg:hidden">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3 w-14" />
                      <Skeleton className="h-5 w-10" />
                    </div>
                  </div>
                </div>
                {/* Full skeleton on desktop */}
                <div className="hidden lg:block">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </div>
              </Card>
            ))
          : stats
            ? statCards.map(
                ({
                  key,
                  label,
                  shortLabel,
                  icon: Icon,
                  colorClass,
                  bgClass,
                }) => {
                  const value = stats[key];
                  const percentage =
                    stats.total > 0 && key !== "total" && key !== "newThisMonth"
                      ? Math.round((value / stats.total) * 100)
                      : null;

                  return (
                    <Card
                      key={key}
                      className="overflow-hidden transition-shadow hover:shadow-md"
                    >
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
                              {value}
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
                            {value}
                          </div>
                          {percentage !== null && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {percentage}% of total members
                            </p>
                          )}
                          {key === "newThisMonth" && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Joined this month
                            </p>
                          )}
                        </CardContent>
                      </div>
                    </Card>
                  );
                },
              )
            : null}
      </div>

      {showDues ? (
        /* Dues Mode */
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 py-1">
                <IndianRupee className="h-3 w-3" />
                Members with Dues
              </Badge>
              {!isLoadingDues && duesReportRes?.summary && (
                <span className="text-sm text-muted-foreground">
                  {duesReportRes.summary.totalMembersWithDues} member
                  {duesReportRes.summary.totalMembersWithDues !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs text-muted-foreground"
              onClick={() => setSearchParams({})}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear filter
            </Button>
          </div>

          {isLoadingDues ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !duesReportRes?.data?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No outstanding dues. All payments are up to date!
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block rounded-lg border">
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
                    {duesReportRes.data.map((m) => (
                      <tr
                        key={m.memberId}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/members/${m.memberId}`)}
                      >
                        <td className="py-2.5 px-3">
                          <p className="font-medium">
                            {m.firstName} {m.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {m.phone}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {m.membershipDuesTotal > 0 ? (
                            <span className="inline-flex items-center">
                              <IndianRupee className="h-3 w-3" />
                              {m.membershipDuesTotal.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {m.trainingDuesTotal > 0 ? (
                            <span className="inline-flex items-center">
                              <IndianRupee className="h-3 w-3" />
                              {m.trainingDuesTotal.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center">
                            <IndianRupee className="h-3 w-3" />
                            {m.totalDue.toLocaleString("en-IN")}
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

              {/* Mobile Cards */}
              <div className="space-y-3 sm:hidden">
                {duesReportRes.data.map((m) => (
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
                        {m.totalDue.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{m.phone}</span>
                      <span>
                        {m.membershipDuesTotal > 0 &&
                          `Membership: ₹${m.membershipDuesTotal.toLocaleString("en-IN")}`}
                        {m.membershipDuesTotal > 0 &&
                          m.trainingDuesTotal > 0 &&
                          " · "}
                        {m.trainingDuesTotal > 0 &&
                          `Training: ₹${m.trainingDuesTotal.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {duesReportRes.pagination && duesReportRes.pagination.pages > 1 && (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDuesPage((p) => p - 1)}
                    disabled={!duesReportRes.pagination.hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground tabular-nums px-1">
                    {duesReportRes.pagination.page} /{" "}
                    {duesReportRes.pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDuesPage((p) => p + 1)}
                    disabled={!duesReportRes.pagination.hasNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* Regular Members Mode */
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 shrink-0">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {statusFilter === "all" ? "Filter" : filterLabel}
                  </span>
                  {statusFilter !== "all" && (
                    <Badge
                      variant="secondary"
                      className="h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold"
                    >
                      1
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                >
                  {statusOptions.map(({ value, label, icon: Icon }) => (
                    <DropdownMenuRadioItem
                      key={value}
                      value={value}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs text-muted-foreground shrink-0"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearch("");
                  setStatusFilter("all");
                }}
              >
                Reset
              </Button>
            )}

            {!isLoading && pagination && (
              <p className="text-sm text-muted-foreground ml-auto tabular-nums">
                <span className="font-medium text-foreground">
                  {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {pagination.total}
                </span>{" "}
                members
              </p>
            )}
            {!isLoading && isSearchMode && members && (
              <p className="text-sm text-muted-foreground ml-auto tabular-nums">
                <span className="font-medium text-foreground">
                  {members.length}
                </span>{" "}
                {members.length === 1 ? "result" : "results"}
              </p>
            )}
          </div>

          {/* Members List */}
          <MembersList members={members} isLoading={isLoading} />

          {/* Pagination */}
          {!isSearchMode && pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums px-1">
                {pagination.page} / {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

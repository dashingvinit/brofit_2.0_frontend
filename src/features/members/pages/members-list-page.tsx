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
  Upload,
  RefreshCw,
  Trash2,
  UserMinus,
  AlertTriangle,
  History,
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { PageHeader } from "@/shared/components/page-header";
import { StatCard } from "@/shared/components/stat-card";
import { MembersList } from "../components/members-list";
import { DuplicateScanDialog } from "../components/duplicate-scan-dialog";
import {
  useMembers,
  useMemberStats,
  useSearchMembers,
  useBatchUpdateMembers,
  useBatchDeleteMembers,
  useDuplicates,
} from "../hooks/use-members";
import { usePlanTypes } from "@/features/plans/hooks/use-plan-types";
import { useDuesReport } from "../hooks/use-member-detail";
import { useRecentlyViewed, type RecentMember } from "../hooks/use-recently-viewed";
import { ROUTES } from "@/shared/lib/constants";
import { getThisMonthDateRange } from "@/shared/lib/utils";
import { ImportCsvDialog } from "@/shared/components/import-csv-dialog";
import { ExportDropdown } from "@/shared/components/export-dropdown";
import { QuickPaymentDialog } from "../components/quick-payment-dialog";
import { membersApi } from "../api/members-api";
import { reportsApi } from "../api/reports-api";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/shared/hooks/use-role";
import { usePrivacy } from "@/shared/hooks/use-privacy";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

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
    filter: "all" as StatusFilter,
  },
  {
    key: "active",
    label: "Active Members",
    shortLabel: "Active",
    icon: UserCheck,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/50",
    filter: "active" as StatusFilter,
  },
  {
    key: "inactive",
    label: "Inactive Members",
    shortLabel: "Inactive",
    icon: UserX,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-950/50",
    filter: "inactive" as StatusFilter,
  },
  {
    key: "newThisMonth",
    label: "New This Month",
    shortLabel: "New",
    icon: TrendingUp,
    colorClass: "text-violet-600 dark:text-violet-400",
    bgClass: "bg-violet-50 dark:bg-violet-950/50",
    filter: "newThisMonth" as const,
  },
] as const;

const MEMBER_CSV_HEADERS = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "gender", label: "Gender" },
  { key: "dateOfBirth", label: "Date of Birth" },
  { key: "joinDate", label: "Join Date" },
  { key: "isActive", label: "Is Active" },
  { key: "notes", label: "Notes" },
];

const MEMBER_CSV_SAMPLE: Record<string, string> = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "9876543210",
  gender: "Male",
  dateOfBirth: "1995-06-15",
  joinDate: "2024-01-01",
  isActive: "true",
  notes: "",
};

export function MembersListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useRole();
  const { isPrivate } = usePrivacy();
  const [searchParams, setSearchParams] = useSearchParams();
  const showDues = searchParams.get("dues") === "true";
  const hasDiscountParam = searchParams.get("hasDiscount") === "true";
  const noMembershipParam = searchParams.get("noMembership") === "true";
  const planTypeIdParam = searchParams.get("planTypeId");
  const statusParam = searchParams.get("status") as StatusFilter | null;
  const { getRecent } = useRecentlyViewed();
  const [recentMembers] = useState<RecentMember[]>(() => getRecent());

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    statusParam && ["all", "active", "inactive"].includes(statusParam) ? statusParam : "all"
  );
  const [dateRange, setDateRange] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [duesPage, setDuesPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [duplicateScanOpen, setDuplicateScanOpen] = useState(false);
  const [quickPayTarget, setQuickPayTarget] = useState<{ memberId: string; memberName: string } | null>(null);

  const batchUpdate = useBatchUpdateMembers();
  const batchDelete = useBatchDeleteMembers();

  const clearSelection = () => setSelectedIds(new Set());

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && members) {
      setSelectedIds(new Set(members.map((m) => m.id)));
    } else {
      clearSelection();
    }
  };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateRange, planTypeIdParam, hasDiscountParam, noMembershipParam]);

  const { data: planTypes } = usePlanTypes();
  const membershipPlanTypes = planTypes?.filter((p) => p.category === "membership");
  const selectedPlanType = planTypes?.find((p) => p.id === planTypeIdParam);

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
    dateRange?.from ?? null,
    dateRange?.to ?? null,
    planTypeIdParam,
    hasDiscountParam,
    noMembershipParam,
  );
  const { data: searchResponse, isLoading: isSearching } = useSearchMembers({
    q: debouncedSearch,
    page: 1,
    limit: 50,
  });

  const { data: statsResponse, isLoading: isLoadingStats } = useMemberStats();
  const { data: duplicatesResponse } = useDuplicates();
  const { data: duesReportRes, isLoading: isLoadingDues } = useDuesReport(
    duesPage,
    PAGE_SIZE,
  );

  const isSearchMode = !!debouncedSearch;
  const members = isSearchMode ? searchResponse?.data : membersResponse?.data;
  const isLoading = isSearchMode ? isSearching : isLoadingMembers;
  const pagination = isSearchMode ? null : membersResponse?.pagination;

  const stats = statsResponse?.data;
  const hasActiveFilters =
    statusFilter !== "all" ||
    !!debouncedSearch ||
    !!dateRange ||
    !!planTypeIdParam ||
    hasDiscountParam ||
    noMembershipParam;

  const updateSearchParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };
  const filterLabel =
    statusOptions.find((o) => o.value === statusFilter)?.label ?? "Filter";

  async function getMembersForExport() {
    const res = await membersApi.getAllMembers(1, 10000, null);
    return (res.data ?? []).map((m) => ({
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email ?? "",
      phone: m.phone ?? "",
      gender: m.gender ?? "",
      dateOfBirth: m.dateOfBirth
        ? new Date(m.dateOfBirth).toISOString().slice(0, 10)
        : "",
      joinDate: m.joinDate
        ? new Date(m.joinDate).toISOString().slice(0, 10)
        : "",
      isActive: String(m.isActive),
      notes: m.notes ?? "",
    }));
  }

  async function handleSyncExpirations() {
    setIsSyncing(true);
    try {
      await reportsApi.syncExpirations();
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({ queryKey: ["member-stats"] });
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleImportMembers(rows: Record<string, string>[]) {
    const res = await membersApi.importMembers(rows);
    queryClient.invalidateQueries({ queryKey: ["members"] });
    return { imported: res.imported, errors: res.errors };
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Members"
        description="Manage your gym members"
        actions={
          isAdmin ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncExpirations}
                disabled={isSyncing}
                title="Sync expirations"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline ml-2">Sync</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportOpen(true)}
                title="Import members"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Import</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDuplicateScanOpen(true)}
                className="relative"
                title="Scan for duplicate members"
              >
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="hidden sm:inline ml-2">Scan</span>
                {duplicatesResponse?.data && duplicatesResponse.data.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white border-2 border-background animate-pulse">
                    {duplicatesResponse.data.length}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.RECYCLE_BIN)}
                title="View archived members"
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Recycle Bin</span>
              </Button>
              <ExportDropdown
                title="Members"
                filename={`members_${new Date().toISOString().slice(0, 10)}`}
                headers={MEMBER_CSV_HEADERS}
                getData={getMembersForExport}
              />
              <Button
                onClick={() =>
                  navigate(ROUTES.REGISTER_MEMBER || "/members/register")
                }
                title="Add member"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Add Member</span>
              </Button>
            </div>
          ) : undefined
        }
      />

      <ImportCsvDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        entityName="members"
        templateHeaders={MEMBER_CSV_HEADERS}
        templateSample={MEMBER_CSV_SAMPLE}
        onImport={handleImportMembers}
      />

      {/* Statistics Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {statCards.map(({ key, label, shortLabel, icon, colorClass, bgClass, filter }) => {
          const value = stats?.[key];
          const percentage =
            stats && stats.total > 0 && key !== "total" && key !== "newThisMonth"
              ? Math.round((value! / stats.total) * 100)
              : null;
          const isSelected =
            filter === "newThisMonth"
              ? !!dateRange
              : filter !== null && statusFilter === filter && !dateRange;

          const handleClick =
            filter === "newThisMonth"
              ? () => {
                  setDateRange(getThisMonthDateRange());
                  setStatusFilter("all");
                  setSearchQuery("");
                  setDebouncedSearch("");
                }
              : filter !== null
                ? () => {
                    setStatusFilter(filter);
                    setDateRange(null);
                    setSearchQuery("");
                    setDebouncedSearch("");
                  }
                : undefined;

          const subtext = percentage !== null
            ? `${percentage}% of total members`
            : key === "newThisMonth"
              ? "Joined this month"
              : undefined;

          return (
            <StatCard
              key={key}
              label={label}
              shortLabel={shortLabel}
              value={value}
              subtext={subtext}
              icon={icon}
              colorClass={colorClass}
              bgClass={bgClass}
              isLoading={isLoadingStats}
              isSelected={isSelected}
              onClick={handleClick}
              hidden={isPrivate}
            />
          );
        })}
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
                      <th className="w-16 py-2.5 px-3" />
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
                            {isPrivate ? "••••••••" : m.phone}
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
                        <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-1.5 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            onClick={() => setQuickPayTarget({ memberId: m.memberId, memberName: `${m.firstName} ${m.lastName}` })}
                          >
                            Pay
                          </button>
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
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center text-sm">
                          <IndianRupee className="h-3 w-3" />
                          {m.totalDue.toLocaleString("en-IN")}
                        </span>
                        <button
                          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-1.5 py-0.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          onClick={(e) => { e.stopPropagation(); setQuickPayTarget({ memberId: m.memberId, memberName: `${m.firstName} ${m.lastName}` }); }}
                        >
                          Pay
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{isPrivate ? "••••••••" : m.phone}</span>
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

              {duesReportRes.pagination &&
                duesReportRes.pagination.pages > 1 && (
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
          {/* Recently Viewed */}
          {recentMembers.length > 0 && !debouncedSearch && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Recently Viewed</p>
              <div className="flex flex-wrap gap-2">
                {recentMembers.slice(0, 8).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => navigate(`/members/${m.id}`)}
                    className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                      {m.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium">{m.name}</span>
                    {m.phone && !isPrivate && (
                      <span className="text-muted-foreground text-xs hidden sm:inline">{m.phone}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by name, email, phone, or plan..."
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
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 shrink-0"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {noMembershipParam
                      ? "No Membership"
                      : dateRange
                        ? "Date Range"
                        : statusFilter === "all"
                          ? "Filter"
                          : filterLabel}
                  </span>
                  {(statusFilter !== "all" || !!dateRange || noMembershipParam) && (
                    <Badge
                      variant="secondary"
                      className="h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold"
                    >
                      {[statusFilter !== "all" || !!dateRange, noMembershipParam].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v as StatusFilter);
                    setDateRange(null);
                  }}
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
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={noMembershipParam}
                  onCheckedChange={(checked) =>
                    updateSearchParam("noMembership", checked ? "true" : null)
                  }
                  className="gap-2"
                >
                  <UserMinus className="h-4 w-4 text-muted-foreground" />
                  No Membership
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Plan type filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 shrink-0"
                >
                  <span className="hidden sm:inline">
                    {selectedPlanType ? selectedPlanType.name : "Plan"}
                  </span>
                  <span className="sm:hidden">Plan</span>
                  {planTypeIdParam && (
                    <Badge
                      variant="secondary"
                      className="h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold"
                    >
                      1
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by plan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={planTypeIdParam ?? ""}
                  onValueChange={(v) =>
                    updateSearchParam("planTypeId", v || null)
                  }
                >
                  <DropdownMenuRadioItem value="">
                    All plans
                  </DropdownMenuRadioItem>
                  {membershipPlanTypes?.map((p) => (
                    <DropdownMenuRadioItem key={p.id} value={p.id}>
                      {p.name}
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
                  setDateRange(null);
                  const next = new URLSearchParams(searchParams);
                  next.delete("planTypeId");
                  next.delete("hasDiscount");
                  next.delete("noMembership");
                  setSearchParams(next);
                }}
              >
                Reset
              </Button>
            )}

            {!isLoading && pagination && (
              <p className="text-sm text-muted-foreground ml-auto tabular-nums">
                <span className="font-medium text-foreground">
                  {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}
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

          {/* No Membership filter banner */}
          {noMembershipParam && (
            <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <UserMinus className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                <span className="font-medium text-red-900 dark:text-red-100">
                  Showing active members with no membership
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => updateSearchParam("noMembership", null)}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            </div>
          )}

          {/* Discount filter banner */}
          {hasDiscountParam && (
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <IndianRupee className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-900 dark:text-amber-100">
                  Showing members on discounted memberships
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => updateSearchParam("hasDiscount", null)}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            </div>
          )}

          {/* Bulk Action Toolbar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
              <span className="text-sm font-medium">
                {selectedIds.size} selected
              </span>
              <div className="h-4 w-px bg-border mx-1" />
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs"
                onClick={() =>
                  batchUpdate.mutate(
                    { ids: Array.from(selectedIds), data: { isActive: true } },
                    { onSuccess: clearSelection }
                  )
                }
                disabled={batchUpdate.isPending || batchDelete.isPending}
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs"
                onClick={() =>
                  batchUpdate.mutate(
                    { ids: Array.from(selectedIds), data: { isArchived: true } },
                    { onSuccess: clearSelection }
                  )
                }
                disabled={batchUpdate.isPending || batchDelete.isPending}
              >
                <UserX className="h-3.5 w-3.5 text-amber-500" />
                Archive
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
                onClick={() => setBatchDeleteOpen(true)}
                disabled={batchDelete.isPending || batchUpdate.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Purge
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground ml-auto"
                onClick={clearSelection}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            </div>
          )}

          {/* Members List */}
          <MembersList
            members={members}
            isLoading={isLoading}
            isAdmin={isAdmin}
            selectedIds={selectedIds}
            onSelectOne={handleSelectOne}
            onSelectAll={handleSelectAll}
          />

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
      {/* Batch Delete Confirmation */}
      <AlertDialog open={batchDeleteOpen} onOpenChange={setBatchDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Members Permanently?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This action <span className="font-bold text-destructive">cannot</span> be undone. 
                You are about to permanently delete <strong>{selectedIds.size}</strong> selected members and ALL their associated data.
              </p>
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                <p className="font-semibold mb-1">For each member, the following will be removed:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All memberships and trainings</li>
                  <li>All payment records and history</li>
                  <li>Analytics and revenue data</li>
                  <li>Attendance records</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={batchDelete.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                batchDelete.mutate(Array.from(selectedIds), {
                  onSuccess: () => {
                    clearSelection();
                    setBatchDeleteOpen(false);
                  },
                });
              }}
              disabled={batchDelete.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {batchDelete.isPending ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DuplicateScanDialog
        open={duplicateScanOpen}
        onOpenChange={setDuplicateScanOpen}
      />

      {quickPayTarget && (
        <QuickPaymentDialog
          memberId={quickPayTarget.memberId}
          memberName={quickPayTarget.memberName}
          open={!!quickPayTarget}
          onOpenChange={(v) => { if (!v) setQuickPayTarget(null); }}
        />
      )}
    </div>
  );
}

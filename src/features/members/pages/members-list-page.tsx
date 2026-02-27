import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  X,
  SlidersHorizontal,
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
import { ROUTES } from "@/shared/lib/constants";

type StatusFilter = "all" | "active" | "inactive";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: allMembersResponse, isLoading: isLoadingMembers } = useMembers(
    1,
    100,
  );
  const { data: searchResponse, isLoading: isSearching } = useSearchMembers({
    q: debouncedSearch,
    page: 1,
    limit: 100,
  });

  const { data: statsResponse, isLoading: isLoadingStats } = useMemberStats();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const baseMembers = debouncedSearch
    ? searchResponse?.data
    : allMembersResponse?.data;
  const isLoading = debouncedSearch ? isSearching : isLoadingMembers;

  const members = baseMembers?.filter((member) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return member.isActive;
    if (statusFilter === "inactive") return !member.isActive;
    return true;
  });

  const stats = statsResponse?.data;
  const hasActiveFilters = statusFilter !== "all" || !!debouncedSearch;
  const filterLabel =
    statusOptions.find((o) => o.value === statusFilter)?.label ?? "Filter";

  return (
    <div className="space-y-6">
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
                    stats.total > 0 &&
                    key !== "total" &&
                    key !== "newThisMonth"
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

      {/* Toolbar: search + filter dropdown on one line */}
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
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 shrink-0"
            >
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

        {!isLoading && members && (
          <p className="text-sm text-muted-foreground ml-auto hidden sm:block tabular-nums">
            <span className="font-medium text-foreground">
              {members.length}
            </span>{" "}
            {members.length === 1 ? "member" : "members"}
          </p>
        )}
      </div>

      {/* Members List */}
      <MembersList members={members} isLoading={isLoading} />
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Snowflake,
  IndianRupee,
  CalendarDays,
  SlidersHorizontal,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { PageHeader } from '@/shared/components/page-header';
import { useMemberships, useMembershipStats } from '../hooks/use-memberships';
import { ROUTES } from '@/shared/lib/constants';
import type { Membership, MembershipStatus } from '@/shared/types/common.types';

type StatusFilter = 'all' | MembershipStatus;

const statusConfig: Record<
  MembershipStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  active: { label: 'Active', variant: 'default' },
  expired: { label: 'Expired', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  frozen: { label: 'Frozen', variant: 'outline' },
};

const statusOptions: {
  value: StatusFilter;
  label: string;
  icon: typeof CreditCard;
}[] = [
  { value: 'all', label: 'All Memberships', icon: CreditCard },
  { value: 'active', label: 'Active', icon: CheckCircle2 },
  { value: 'expired', label: 'Expired', icon: Clock },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
  { value: 'frozen', label: 'Frozen', icon: Snowflake },
];

const statCards = [
  {
    key: 'total' as const,
    label: 'Total Memberships',
    shortLabel: 'Total',
    icon: CreditCard,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/50',
  },
  {
    key: 'active' as const,
    label: 'Active Memberships',
    shortLabel: 'Active',
    icon: CheckCircle2,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    key: 'expired' as const,
    label: 'Expired',
    shortLabel: 'Expired',
    icon: Clock,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/50',
  },
  {
    key: 'newThisMonth' as const,
    label: 'New This Month',
    shortLabel: 'New',
    icon: TrendingUp,
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-50 dark:bg-violet-950/50',
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function MembershipRow({
  membership,
  onClick,
}: {
  membership: Membership;
  onClick: () => void;
}) {
  const status = statusConfig[membership.status];
  const memberName = membership.member
    ? `${membership.member.firstName} ${membership.member.lastName}`
    : 'Unknown';
  const planName = membership.planVariant?.planType?.name ?? 'N/A';
  const durationLabel = membership.planVariant?.durationLabel ?? '';

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={onClick}
    >
      <TableCell className="font-medium">{memberName}</TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{planName}</p>
          <p className="text-xs text-muted-foreground">{durationLabel}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={status.variant}>{status.label}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">{formatDate(membership.startDate)}</TableCell>
      <TableCell className="hidden md:table-cell">{formatDate(membership.endDate)}</TableCell>
      <TableCell className="text-right">
        <span className="inline-flex items-center font-medium">
          <IndianRupee className="h-3 w-3" />
          {membership.finalPrice.toLocaleString()}
        </span>
      </TableCell>
    </TableRow>
  );
}

function MembershipCard({
  membership,
  onClick,
}: {
  membership: Membership;
  onClick: () => void;
}) {
  const status = statusConfig[membership.status];
  const memberName = membership.member
    ? `${membership.member.firstName} ${membership.member.lastName}`
    : 'Unknown';
  const planName = membership.planVariant?.planType?.name ?? 'N/A';
  const durationLabel = membership.planVariant?.durationLabel ?? '';

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-semibold">{memberName}</p>
            <p className="text-sm text-muted-foreground">
              {planName} - {durationLabel}
            </p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(membership.startDate)} - {formatDate(membership.endDate)}
          </div>
          <span className="inline-flex items-center font-semibold">
            <IndianRupee className="h-3 w-3" />
            {membership.finalPrice.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function MembershipsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: membershipsResponse, isLoading } = useMemberships();
  const { data: statsResponse, isLoading: isLoadingStats } = useMembershipStats();

  const allMemberships = membershipsResponse?.data ?? [];
  const stats = statsResponse?.data;

  const searchLower = searchQuery.toLowerCase();
  const memberships = allMemberships.filter((m) => {
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    if (!matchesStatus) return false;
    if (!searchQuery) return true;
    const memberName = m.member
      ? `${m.member.firstName} ${m.member.lastName}`.toLowerCase()
      : '';
    const planName = (m.planVariant?.planType?.name ?? '').toLowerCase();
    return memberName.includes(searchLower) || planName.includes(searchLower);
  });

  const hasActiveFilters = statusFilter !== 'all' || !!searchQuery;
  const filterLabel =
    statusOptions.find((o) => o.value === statusFilter)?.label ?? 'Filter';

  return (
    <div className="space-y-4">
      <PageHeader
        title="Memberships"
        description="Manage gym memberships"
        actions={
          <Button onClick={() => navigate(ROUTES.CREATE_MEMBERSHIP)}>
            <Plus className="h-4 w-4 mr-2" />
            New Membership
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {isLoadingStats
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
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
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </div>
              </Card>
            ))
          : stats
            ? statCards.map(
                ({ key, label, shortLabel, icon: Icon, colorClass, bgClass }) => {
                  const value = stats[key];
                  const percentage =
                    stats.total > 0 && key !== 'total' && key !== 'newThisMonth'
                      ? Math.round((value / stats.total) * 100)
                      : null;

                  return (
                    <Card
                      key={key}
                      className="overflow-hidden transition-shadow hover:shadow-md"
                    >
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
                              {percentage}% of total
                            </p>
                          )}
                          {key === 'newThisMonth' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Created this month
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

      {/* Toolbar: search + filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by member or plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
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
                {statusFilter === 'all' ? 'Filter' : filterLabel}
              </span>
              {statusFilter !== 'all' && (
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
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            Reset
          </Button>
        )}

        {!isLoading && (
          <p className="text-sm text-muted-foreground ml-auto hidden sm:block tabular-nums">
            <span className="font-medium text-foreground">{memberships.length}</span>{' '}
            {memberships.length === 1 ? 'membership' : 'memberships'}
          </p>
        )}
      </div>

      {/* Memberships List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : memberships.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {hasActiveFilters ? 'No memberships match your filters' : 'No memberships yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {hasActiveFilters
                ? 'Try adjusting your search or filter criteria.'
                : 'Create a membership to assign a plan to a member.'}
            </p>
            {hasActiveFilters ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => navigate(ROUTES.CREATE_MEMBERSHIP)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Membership
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberships.map((membership) => (
                    <MembershipRow
                      key={membership.id}
                      membership={membership}
                      onClick={() =>
                        navigate(`/memberships/${membership.id}`)
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {memberships.map((membership) => (
              <MembershipCard
                key={membership.id}
                membership={membership}
                onClick={() =>
                  navigate(`/memberships/${membership.id}`)
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

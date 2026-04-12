import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/shared/components/empty-state';
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
  CalendarClock,
  SlidersHorizontal,
  Search,
  X,
  RefreshCw,
  Ban,
  Flame,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
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
import {
  useMemberships,
  useMembershipStats,
  useBatchCancelMemberships,
  useBatchUnfreezeMemberships,
} from '../hooks/use-memberships';
import { RenewMembershipDialog } from '../components/renew-membership-dialog';
import { BulkFreezeDialog } from '../components/bulk-freeze-dialog';
import { ROUTES } from '@/shared/lib/constants';
import { useFromState } from '@/shared/hooks/use-return-to';
import { getThisMonthDateRange } from '@/shared/lib/utils';
import type { Membership, MembershipStatus } from '@/shared/types/common.types';
import { SUBSCRIPTION_STATUS_CONFIG } from '@/shared/lib/constants';

type StatusFilter = 'all' | MembershipStatus;

const statusConfig = SUBSCRIPTION_STATUS_CONFIG;

const statusOptions: {
  value: StatusFilter;
  label: string;
  icon: typeof CreditCard;
}[] = [
  { value: 'all', label: 'All Memberships', icon: CreditCard },
  { value: 'scheduled', label: 'Scheduled', icon: CalendarClock },
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
    filter: 'all' as StatusFilter,
  },
  {
    key: 'active' as const,
    label: 'Active Memberships',
    shortLabel: 'Active',
    icon: CheckCircle2,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
    filter: 'active' as StatusFilter,
  },
  {
    key: 'expired' as const,
    label: 'Expired',
    shortLabel: 'Expired',
    icon: Clock,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/50',
    filter: 'expired' as StatusFilter,
  },
  {
    key: 'newThisMonth' as const,
    label: 'New This Month',
    shortLabel: 'New',
    icon: TrendingUp,
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-50 dark:bg-violet-950/50',
    filter: 'newThisMonth' as const,
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
  onRenew,
  selected,
  onSelect,
}: {
  membership: Membership;
  onClick: () => void;
  onRenew: (m: Membership) => void;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
}) {
  const status = statusConfig[membership.status];
  const memberName = membership.member
    ? `${membership.member.firstName} ${membership.member.lastName}`
    : 'Unknown';
  const planName = membership.planVariant?.planType?.name ?? 'N/A';
  const durationLabel = membership.planVariant?.durationLabel ?? '';
  const canRenew = membership.status === 'expired' || membership.status === 'cancelled';

  return (
    <TableRow className={`hover:bg-muted/50 ${selected ? 'bg-muted/30' : ''}`}>
      <TableCell className="w-10 pr-0">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(membership.id, !!checked)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${memberName}`}
        />
      </TableCell>
      <TableCell className="font-medium cursor-pointer" onClick={onClick}>{memberName}</TableCell>
      <TableCell className="cursor-pointer" onClick={onClick}>
        <div>
          <p className="font-medium">{planName}</p>
          <p className="text-xs text-muted-foreground">{durationLabel}</p>
        </div>
      </TableCell>
      <TableCell className="cursor-pointer" onClick={onClick}>
        <Badge variant={status.variant}>{status.label}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell cursor-pointer" onClick={onClick}>{formatDate(membership.startDate)}</TableCell>
      <TableCell className="hidden md:table-cell cursor-pointer" onClick={onClick}>{formatDate(membership.endDate)}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="inline-flex items-center font-medium">
            <IndianRupee className="h-3 w-3" />
            {membership.finalPrice.toLocaleString()}
          </span>
          {canRenew && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={(e) => { e.stopPropagation(); onRenew(membership); }}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Renew
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function MembershipCard({
  membership,
  onClick,
  onRenew,
  selected,
  onSelect,
}: {
  membership: Membership;
  onClick: () => void;
  onRenew: (m: Membership) => void;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
}) {
  const status = statusConfig[membership.status];
  const memberName = membership.member
    ? `${membership.member.firstName} ${membership.member.lastName}`
    : 'Unknown';
  const planName = membership.planVariant?.planType?.name ?? 'N/A';
  const durationLabel = membership.planVariant?.durationLabel ?? '';
  const canRenew = membership.status === 'expired' || membership.status === 'cancelled';

  return (
    <Card className={`transition-shadow hover:shadow-md ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(membership.id, !!checked)}
            className="mt-0.5 shrink-0"
            aria-label={`Select ${memberName}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between cursor-pointer" onClick={onClick}>
              <div className="space-y-1">
                <p className="font-semibold">{memberName}</p>
                <p className="text-sm text-muted-foreground">
                  {planName} - {durationLabel}
                </p>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground cursor-pointer" onClick={onClick}>
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(membership.startDate)} - {formatDate(membership.endDate)}
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center font-semibold">
                  <IndianRupee className="h-3 w-3" />
                  {membership.finalPrice.toLocaleString()}
                </span>
                {canRenew && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => onRenew(membership)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Renew
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MembershipsPage() {
  const navigate = useNavigate();
  const fromState = useFromState();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [renewMembership, setRenewMembership] = useState<Membership | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkFreezeOpen, setBulkFreezeOpen] = useState(false);

  const { data: membershipsResponse, isLoading } = useMemberships(
    1,
    100,
    statusFilter !== 'all' ? statusFilter : null,
    dateRange?.from ?? null,
    dateRange?.to ?? null,
  );
  const { data: statsResponse, isLoading: isLoadingStats } = useMembershipStats();
  const batchCancel = useBatchCancelMemberships();
  const batchUnfreeze = useBatchUnfreezeMemberships();

  const allMemberships = membershipsResponse?.data ?? [];
  const stats = statsResponse?.data;

  const searchLower = searchQuery.toLowerCase();
  const memberships = allMemberships.filter((m) => {
    if (!searchQuery) return true;
    const memberName = m.member
      ? `${m.member.firstName} ${m.member.lastName}`.toLowerCase()
      : '';
    const planName = (m.planVariant?.planType?.name ?? '').toLowerCase();
    return memberName.includes(searchLower) || planName.includes(searchLower);
  });

  const hasActiveFilters = statusFilter !== 'all' || !!searchQuery || !!dateRange;
  const filterLabel =
    statusOptions.find((o) => o.value === statusFilter)?.label ?? 'Filter';

  // Selection helpers
  const allVisibleIds = memberships.map((m) => m.id);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id));
  const someSelected = allVisibleIds.some((id) => selectedIds.has(id)) && !allSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(allVisibleIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedArray = Array.from(selectedIds);
  const selectedMemberships = memberships.filter((m) => selectedIds.has(m.id));

  // Determine which bulk actions are valid for the selection
  const canBulkCancel = selectedMemberships.some(
    (m) => m.status === 'active' || m.status === 'expired' || m.status === 'scheduled'
  );
  const canBulkFreeze = selectedMemberships.some((m) => m.status === 'active');
  const canBulkUnfreeze = selectedMemberships.some((m) => m.status === 'frozen');

  const handleBulkCancel = () => {
    const ids = selectedMemberships
      .filter((m) => m.status === 'active' || m.status === 'expired')
      .map((m) => m.id);
    batchCancel.mutate(ids, { onSuccess: clearSelection });
  };

  const handleBulkUnfreeze = () => {
    const ids = selectedMemberships
      .filter((m) => m.status === 'frozen')
      .map((m) => m.id);
    batchUnfreeze.mutate(ids, { onSuccess: clearSelection });
  };

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
                ({ key, label, shortLabel, icon: Icon, colorClass, bgClass, filter }) => {
                  const value = stats[key];
                  const percentage =
                    stats.total > 0 && key !== 'total' && key !== 'newThisMonth'
                      ? Math.round((value / stats.total) * 100)
                      : null;
                  const isSelected =
                    filter === 'newThisMonth'
                      ? !!dateRange
                      : filter !== null && statusFilter === filter && !dateRange;

                  const handleClick =
                    filter === 'newThisMonth'
                      ? () => {
                          setDateRange(getThisMonthDateRange());
                          setStatusFilter('all');
                          setSearchQuery('');
                        }
                      : filter !== null
                        ? () => {
                            setStatusFilter(filter as StatusFilter);
                            setDateRange(null);
                            setSearchQuery('');
                          }
                        : undefined;

                  return (
                    <Card
                      key={key}
                      onClick={handleClick}
                      className={`overflow-hidden transition-shadow hover:shadow-md ${filter !== null ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}
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
                            <p className="text-lg font-bold leading-tight tracking-tight font-display">
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
                          <div className="text-2xl font-bold tracking-tight font-display">
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
                {dateRange ? 'Date Range' : statusFilter === 'all' ? 'Filter' : filterLabel}
              </span>
              {(statusFilter !== 'all' || !!dateRange) && (
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
              onValueChange={(v) => { setStatusFilter(v as StatusFilter); setDateRange(null); }}
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
              setDateRange(null);
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

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-border mx-1" />
          {canBulkFreeze && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setBulkFreezeOpen(true)}
              disabled={batchCancel.isPending || batchUnfreeze.isPending}
            >
              <Snowflake className="h-3.5 w-3.5 text-blue-500" />
              Freeze
            </Button>
          )}
          {canBulkUnfreeze && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-xs"
              onClick={handleBulkUnfreeze}
              disabled={batchUnfreeze.isPending || batchCancel.isPending}
            >
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              Unfreeze
            </Button>
          )}
          {canBulkCancel && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
              onClick={handleBulkCancel}
              disabled={batchCancel.isPending || batchUnfreeze.isPending}
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel
            </Button>
          )}
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

      {/* Memberships List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : memberships.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<CreditCard className="h-8 w-8 text-muted-foreground" />}
              title={hasActiveFilters ? 'No memberships match your filters' : 'No memberships yet'}
              description={hasActiveFilters ? 'Try adjusting your search or filter criteria.' : 'Create a membership to assign a plan to a member.'}
              action={hasActiveFilters ? (
                <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); setDateRange(null); }}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => navigate(ROUTES.CREATE_MEMBERSHIP)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Membership
                </Button>
              )}
            />
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
                    <TableHead className="w-10 pr-0">
                      <Checkbox
                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
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
                      onClick={() => navigate(`/memberships/${membership.id}`, fromState)}
                      onRenew={setRenewMembership}
                      selected={selectedIds.has(membership.id)}
                      onSelect={handleSelectOne}
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
                onClick={() => navigate(`/memberships/${membership.id}`, fromState)}
                onRenew={setRenewMembership}
                selected={selectedIds.has(membership.id)}
                onSelect={handleSelectOne}
              />
            ))}
          </div>
        </>
      )}

      {/* Renew Dialog (list-level) */}
      {renewMembership && (
        <RenewMembershipDialog
          open={!!renewMembership}
          onOpenChange={(open) => { if (!open) setRenewMembership(null); }}
          membership={renewMembership}
        />
      )}

      {/* Bulk Freeze Dialog */}
      <BulkFreezeDialog
        open={bulkFreezeOpen}
        onOpenChange={setBulkFreezeOpen}
        ids={selectedMemberships.filter((m) => m.status === 'active').map((m) => m.id)}
        onSuccess={clearSelection}
      />
    </div>
  );
}

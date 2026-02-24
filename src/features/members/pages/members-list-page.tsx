import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PageHeader } from '@/shared/components/page-header';
import { MembersList } from '../components/members-list';
import { useMembers, useMemberStats, useSearchMembers } from '../hooks/use-members';
import { ROUTES } from '@/shared/lib/constants';
import { LoadingSpinner } from '@/shared/components/loading-spinner';

type StatusFilter = 'all' | 'active' | 'inactive';

export function MembersListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Fetch all members or search results
  const { data: allMembersResponse, isLoading: isLoadingMembers } = useMembers(1, 100);
  const { data: searchResponse, isLoading: isSearching } = useSearchMembers({
    q: debouncedSearch,
    page: 1,
    limit: 100,
  });

  // Fetch member statistics
  const { data: statsResponse, isLoading: isLoadingStats } = useMemberStats();

  // Debounce search input with proper cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Determine which data to display (search results or all members)
  const baseMembers = debouncedSearch
    ? searchResponse?.data
    : allMembersResponse?.data;
  const isLoading = debouncedSearch ? isSearching : isLoadingMembers;

  // Apply status filter - show all members by default
  const members = baseMembers?.filter((member) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return member.isActive;
    if (statusFilter === 'inactive') return !member.isActive;
    return true;
  });

  const stats = statsResponse?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Manage your gym members"
        actions={
          <Button onClick={() => navigate(ROUTES.REGISTER_MEMBER || '/members/register')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        }
      />

      {/* Statistics Cards */}
      {isLoadingStats ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Members</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newThisMonth}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search members by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {debouncedSearch && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setDebouncedSearch('');
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              <Users className="h-4 w-4 mr-2" />
              All Members
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('active')}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Active
            </Button>
            <Button
              variant={statusFilter === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('inactive')}
            >
              <UserX className="h-4 w-4 mr-2" />
              Inactive
            </Button>
          </div>
          {statusFilter !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Clear Filter
            </Button>
          )}
        </div>
      </div>

      {/* Members List */}
      <MembersList members={members} isLoading={isLoading} />
    </div>
  );
}

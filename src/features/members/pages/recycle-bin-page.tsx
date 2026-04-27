import { useState, useEffect } from "react";
import { 
  Trash2, 
  RefreshCcw, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft,
  XCircle,
  AlertTriangle,
  History,
  MoreHorizontal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { 
  useMembers, 
  useSearchMembers, 
  useRestoreMember, 
  useDeleteMember,
  useBatchDeleteMembers,
  useBatchUpdateMembers
} from "../hooks/use-members";
import { useRole } from "@/shared/hooks/use-role";
import { ROUTES } from "@/shared/lib/constants";
import type { Member } from "@/shared/types/common.types";

const PAGE_SIZE = 10;

export function RecycleBinPage() {
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const restoreMember = useRestoreMember();
  const deleteMember = useDeleteMember();
  const batchDelete = useBatchDeleteMembers();
  const batchRestore = useBatchUpdateMembers();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: membersResponse, isLoading } = useMembers(
    page,
    PAGE_SIZE,
    undefined, // isActive — don't filter (archived members can be active or inactive)
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    true, // isArchived = true (Recycle Bin)
  );

  const { data: searchResponse, isLoading: isSearching } = useSearchMembers({
    q: debouncedSearch,
    page: 1,
    limit: 50,
    archivedOnly: true,
  });

  const isSearchMode = !!debouncedSearch;
  const members = isSearchMode ? searchResponse?.data : membersResponse?.data;
  const pagination = isSearchMode ? null : membersResponse?.pagination;

  const handleRestore = (id: string) => {
    restoreMember.mutate(id);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && members) {
      setSelectedIds(new Set(members.map(m => m.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleBatchRestore = () => {
    batchRestore.mutate({
      ids: Array.from(selectedIds),
      data: { isArchived: false }
    }, {
      onSuccess: () => setSelectedIds(new Set())
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Recycle Bin"
        description="View and manage archived member records"
        icon={History}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.MEMBERS)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Members
          </Button>
        }
      />

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search archived members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <Button 
              size="sm" 
              variant="default" 
              className="h-8 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleBatchRestore}
              disabled={batchRestore.isPending}
            >
              <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
              Restore {selectedIds.size}
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              className="h-8"
              onClick={() => setBatchDeleteOpen(true)}
              disabled={batchDelete.isPending}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Purge {selectedIds.size}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10">
                <Input 
                  type="checkbox" 
                  className="h-4 w-4"
                  checked={members?.length ? selectedIds.size === members.length : false}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Archived On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isSearching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="h-16 animate-pulse bg-muted/20" />
                </TableRow>
              ))
            ) : members?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <EmptyState
                    title="Recycle bin is empty"
                    description="Members you archive will appear here."
                    icon={<Trash2 className="h-8 w-8 text-muted-foreground" />}
                  />
                </TableCell>
              </TableRow>
            ) : (
              members?.map((member) => (
                <TableRow key={member.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <Input 
                      type="checkbox" 
                      className="h-4 w-4"
                      checked={selectedIds.has(member.id)}
                      onChange={(e) => handleSelectOne(member.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-[10px] bg-amber-100 text-amber-700">
                          {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{member.firstName} {member.lastName}</span>
                        <span className="text-xs text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{member.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(member.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                          onClick={() => handleRestore(member.id)}
                          disabled={restoreMember.isPending}
                        >
                          <RefreshCcw className={`h-4 w-4 mr-2 ${restoreMember.isPending && restoreMember.variables === member.id ? 'animate-spin' : ''}`} />
                          Restore Member
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => setMemberToDelete(member)}
                          disabled={deleteMember.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Purge Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {!isSearchMode && pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={!pagination.hasPrev}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
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

      {/* Single Purge Confirmation */}
      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Purge Member?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This action <span className="font-bold text-destructive">cannot</span> be undone. 
                  You are about to permanently delete <strong>{memberToDelete?.firstName} {memberToDelete?.lastName}</strong> and ALL their associated history.
                </p>
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 mb-2" />
                  <p>This includes all memberships, payments, and attendance records. It will be like they never existed.</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (memberToDelete) {
                  deleteMember.mutate(memberToDelete.id, {
                    onSuccess: () => setMemberToDelete(null)
                  });
                }
              }}
            >
              Purge Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Purge Confirmation */}
      <AlertDialog open={batchDeleteOpen} onOpenChange={setBatchDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Purge {selectedIds.size} Members Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all selected members and their entire history. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                batchDelete.mutate(Array.from(selectedIds), {
                  onSuccess: () => {
                    setSelectedIds(new Set());
                    setBatchDeleteOpen(false);
                  }
                });
              }}
            >
              Purge All Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

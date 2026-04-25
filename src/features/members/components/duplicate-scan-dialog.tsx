import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useDuplicates } from '../hooks/use-members';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { AlertTriangle, ExternalLink, GitMerge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/shared/components/ui/badge';
import { useMergeMembers } from '../hooks/use-members';

interface DuplicateScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DuplicateScanDialog({ open, onOpenChange }: DuplicateScanDialogProps) {
  const { data: duplicatesResponse, isLoading } = useDuplicates();
  const mergeMembers = useMergeMembers();
  const navigate = useNavigate();

  const duplicates = duplicatesResponse?.data || [];

  const handleMerge = (group: any) => {
    // The backend array_agg is ordered by join_date ASC.
    // ids[0] is the oldest (original) record. ids[1] is the newer duplicate.
    // We merge the newer record (source) into the older record (target).
    const sourceId = group.ids[1];
    const targetId = group.ids[0];
    const sourceName = group.names[1];
    const targetName = group.names[0];

    if (window.confirm(`Merge newer record (${sourceName}) into older original (${targetName})?\n\nAll memberships, payments, and attendance will be moved to ${targetName}. The newer duplicate will be permanently deleted.`)) {
      mergeMembers.mutate({ sourceId, targetId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Duplicate Member Scan
          </DialogTitle>
          <DialogDescription>
            We've identified potential duplicate records based on matching phone numbers. Review and clean up your database to keep analytics reliable.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : duplicates.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
              <Badge variant="outline" className="border-emerald-200 text-emerald-600 dark:text-emerald-400">Clean</Badge>
            </div>
            <p className="text-sm text-muted-foreground">No duplicate phone numbers found. Great job!</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{duplicates.length} groups of duplicates found</p>
            </div>
            {duplicates.map((group, idx) => (
              <div key={idx} className="rounded-lg border border-amber-200 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/10 overflow-hidden">
                <div className="p-3 border-b border-amber-200 dark:border-amber-900/30 bg-amber-100/50 dark:bg-amber-900/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Phone: {group.phone}</span>
                    <Badge variant="secondary" className="bg-white dark:bg-zinc-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50">{group.count} records</Badge>
                  </div>
                  {group.count === 2 && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 bg-white dark:bg-zinc-900 border-amber-300 text-amber-700 hover:bg-amber-100"
                      onClick={() => handleMerge(group)}
                      disabled={mergeMembers.isPending}
                    >
                      <GitMerge className="h-3.5 w-3.5 mr-1.5" />
                      Merge Records
                    </Button>
                  )}
                </div>
                <div className="divide-y divide-amber-100 dark:divide-amber-900/20">
                  {group.ids.map((id, i) => {
                    const isNameDuplicated = group.names.filter(n => n.toLowerCase() === group.names[i].toLowerCase()).length > 1;
                    
                    return (
                      <div key={id} className={`p-3 flex items-center justify-between hover:bg-amber-100/20 transition-colors ${isNameDuplicated ? 'bg-amber-100/10' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-[10px] font-bold uppercase ${isNameDuplicated ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white dark:bg-zinc-900'}`}>
                            {group.names[i].split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{group.names[i]}</p>
                              {isNameDuplicated ? (
                                <Badge variant="destructive" className="h-4 px-1 text-[8px] uppercase">Exact Match</Badge>
                              ) : (
                                <Badge variant="outline" className="h-4 px-1 text-[8px] uppercase border-amber-300 text-amber-700">Family/Shared</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">Joined: {group.join_dates[i]}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8"
                            onClick={() => {
                              onOpenChange(false);
                              navigate(`/members/${id}`);
                            }}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            View Profile
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

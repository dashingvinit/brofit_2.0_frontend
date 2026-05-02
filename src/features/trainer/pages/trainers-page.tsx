import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, Plus, Loader2, PowerOff, Users, IndianRupee } from 'lucide-react';
import { PageHeader } from '@/shared/components/page-header';
import { EmptyState } from '@/shared/components/empty-state';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import {
  useTrainers,
  useCreateTrainer,
  useDeactivateTrainer,
  useTrainerOutstandingSummary,
} from '../hooks/use-trainers';

function TrainerCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-4 py-2.5">
        <Skeleton className="h-4 w-24" />
      </CardFooter>
    </Card>
  );
}

export function TrainersPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [splitPercent, setSplitPercent] = useState('60');
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: string; name: string } | null>(null);
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  const navigate = useNavigate();

  const { data: trainersResponse, isLoading } = useTrainers();
  const createTrainer = useCreateTrainer();
  const deactivateTrainer = useDeactivateTrainer();
  const { data: summaryResponse } = useTrainerOutstandingSummary();

  const allTrainers = trainersResponse?.data ?? [];
  const outstandingSummary = summaryResponse?.data ?? {};

  const trainers =
    filter === 'active' ? allTrainers.filter((t) => t.isActive) : allTrainers;

  const activeCount = allTrainers.filter((t) => t.isActive).length;
  const inactiveCount = allTrainers.length - activeCount;

  const handleCreate = () => {
    if (!name.trim()) return;
    const split = parseFloat(splitPercent);
    createTrainer.mutate(
      { name: name.trim(), splitPercent: isNaN(split) ? 60 : split },
      {
        onSuccess: () => {
          setName('');
          setSplitPercent('60');
          setOpen(false);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Trainers"
        description="Manage trainers and track payouts."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Trainer
          </Button>
        }
      />

      {!isLoading && inactiveCount > 0 && (
        <div className="flex items-center gap-1">
          {(['active', 'all'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs capitalize"
              onClick={() => setFilter(f)}
            >
              {f === 'active' ? `Active · ${activeCount}` : `All · ${allTrainers.length}`}
            </Button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <TrainerCardSkeleton key={i} />
          ))}
        </div>
      ) : trainers.length === 0 ? (
        <EmptyState
          icon={<UserRound className="h-6 w-6 text-muted-foreground" />}
          title={filter === 'active' ? 'No active trainers' : 'No trainers yet'}
          description={
            filter === 'active'
              ? 'All trainers are currently inactive.'
              : 'Add your first trainer to get started.'
          }
          action={
            filter === 'all' ? (
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Trainer
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer, idx) => {
            const outstanding = outstandingSummary[trainer.id]?.outstanding ?? 0;
            const delayClass = ['delay-0', 'delay-75', 'delay-150', 'delay-225'][idx % 4];
            const showFooter = outstanding > 0 || trainer.isActive;

            return (
              <Card
                key={trainer.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors animate-in fade-in zoom-in-95 duration-300 ${delayClass} overflow-hidden`}
                onClick={() => navigate(`/trainers/${trainer.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/25 text-orange-700 dark:text-orange-400 flex items-center justify-center font-semibold text-sm shrink-0">
                      {trainer.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{trainer.name}</p>
                        {!trainer.isActive && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {trainer._count !== undefined && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {trainer._count.trainings}{' '}
                            {trainer._count.trainings === 1 ? 'client' : 'clients'}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {trainer.splitPercent ?? 60}% share
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {showFooter && (
                  <CardFooter
                    className="border-t px-4 py-2.5 justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {outstanding > 0 && (
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-500 flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {outstanding.toLocaleString('en-IN', { maximumFractionDigits: 0 })} outstanding
                      </span>
                    )}
                    {trainer.isActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1.5 -mr-2 ml-auto"
                        disabled={deactivateTrainer.isPending}
                        onClick={() =>
                          setDeactivateTarget({ id: trainer.id, name: trainer.name })
                        }
                      >
                        <PowerOff className="h-3.5 w-3.5" />
                        Deactivate
                      </Button>
                    )}
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(o) => !o && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Trainer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark{' '}
              <span className="font-semibold">{deactivateTarget?.name}</span> as
              inactive. They won't appear in new training sessions. You can
              reactivate them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateTrainer.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deactivateTrainer.isPending}
              onClick={() => {
                if (deactivateTarget) {
                  deactivateTrainer.mutate(deactivateTarget.id, {
                    onSettled: () => setDeactivateTarget(null),
                  });
                }
              }}
            >
              {deactivateTrainer.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Trainer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="trainerName">Trainer Name</Label>
              <Input
                id="trainerName"
                placeholder="e.g. Pranjal Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="splitPercent">Trainer's Share of Revenue (%)</Label>
              <Input
                id="splitPercent"
                type="number"
                min={0}
                max={100}
                placeholder="60"
                value={splitPercent}
                onChange={(e) => setSplitPercent(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Percentage of training revenue paid to the trainer. Default is 60%.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || createTrainer.isPending}
            >
              {createTrainer.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Trainer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

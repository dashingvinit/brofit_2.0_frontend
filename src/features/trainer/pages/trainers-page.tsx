import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, Plus, Loader2, PowerOff, Dumbbell, IndianRupee } from 'lucide-react';
import { PageHeader } from '@/shared/components/page-header';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
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
import { useTrainers, useCreateTrainer, useDeactivateTrainer, useTrainerOutstandingSummary } from '../hooks/use-trainers';

export function TrainersPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [splitPercent, setSplitPercent] = useState('60');
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();

  const { data: trainersResponse, isLoading } = useTrainers();
  const createTrainer = useCreateTrainer();
  const deactivateTrainer = useDeactivateTrainer();
  const { data: summaryResponse } = useTrainerOutstandingSummary();

  const trainers = trainersResponse?.data ?? [];
  const outstandingSummary = summaryResponse?.data ?? {};

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
        description="Manage trainers in your gym."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Trainer
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : trainers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <UserRound className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">No trainers yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your first trainer to get started.
          </p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Trainer
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer) => (
            <Card
              key={trainer.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(`/trainers/${trainer.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {trainer.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{trainer.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <Badge
                        variant={trainer.isActive ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {trainer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {trainer._count !== undefined && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Dumbbell className="h-3 w-3" />
                          {trainer._count.trainings} active
                        </span>
                      )}
                      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                        {trainer.splitPercent ?? 60}% trainer share
                      </span>
                      {outstandingSummary[trainer.id]?.outstanding > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <IndianRupee className="h-3 w-3" />
                          {outstandingSummary[trainer.id].outstanding.toLocaleString('en-IN', { maximumFractionDigits: 0 })} due
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {trainer.isActive && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive gap-1.5"
                    disabled={deactivateTrainer.isPending}
                    onClick={(e) => { e.stopPropagation(); setDeactivateTarget({ id: trainer.id, name: trainer.name }); }}
                  >
                    <PowerOff className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs">Deactivate</span>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deactivateTarget} onOpenChange={(o) => !o && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Trainer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark <span className="font-semibold">{deactivateTarget?.name}</span> as inactive. They won't appear in new training sessions. You can reactivate them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateTrainer.isPending}>Cancel</AlertDialogCancel>
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
              {deactivateTrainer.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
              {createTrainer.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Add Trainer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

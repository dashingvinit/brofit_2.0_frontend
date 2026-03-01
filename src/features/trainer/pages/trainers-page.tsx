import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, Plus, Loader2, PowerOff, Dumbbell } from 'lucide-react';
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
import { useTrainers, useCreateTrainer, useDeactivateTrainer } from '../hooks/use-trainers';

export function TrainersPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const { data: trainersResponse, isLoading } = useTrainers();
  const createTrainer = useCreateTrainer();
  const deactivateTrainer = useDeactivateTrainer();

  const trainers = trainersResponse?.data ?? [];

  const handleCreate = () => {
    if (!name.trim()) return;
    createTrainer.mutate(name.trim(), {
      onSuccess: () => {
        setName('');
        setOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6">
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
                    <div className="flex items-center gap-1.5 mt-0.5">
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
                    </div>
                  </div>
                </div>
                {trainer.isActive && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={deactivateTrainer.isPending}
                    onClick={(e) => { e.stopPropagation(); deactivateTrainer.mutate(trainer.id); }}
                  >
                    <PowerOff className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Trainer</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
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

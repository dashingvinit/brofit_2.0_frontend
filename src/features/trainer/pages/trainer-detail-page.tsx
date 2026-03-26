import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Users,
  Dumbbell,
  Phone,
  Mail,
  CalendarDays,
  ChevronRight,
  Wallet,
  CheckCircle2,
  Circle,
  IndianRupee,
  Pencil,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { PageHeader } from '@/shared/components/page-header';
import { ROUTES } from '@/shared/lib/constants';
import {
  useTrainerWithClients,
  useTrainerPayoutSchedule,
  useRecordTrainerPayout,
  useUpdateTrainer,
} from '../hooks/use-trainers';
import { ExportDropdown } from '@/shared/components/export-dropdown';
import type { TrainerPayoutMonthSlot, TrainerPayoutRow } from '@/shared/types/common.types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMonthYear(month: number, year: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

function formatRupees(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
  ];
  const index =
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
}

const TRAINER_CLIENTS_CSV_HEADERS = [
  { key: 'memberName', label: 'Member Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'planName', label: 'Plan Name' },
  { key: 'durationLabel', label: 'Duration' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'status', label: 'Status' },
];

// ─── Confirm Payout Dialog ────────────────────────────────────────────────────

interface ConfirmPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: TrainerPayoutRow;
  slot: TrainerPayoutMonthSlot;
  trainerId: string;
}

function ConfirmPayoutDialog({
  open,
  onOpenChange,
  row,
  slot,
  trainerId,
}: ConfirmPayoutDialogProps) {
  const [notes, setNotes] = useState('');
  const recordPayout = useRecordTrainerPayout(trainerId);

  const memberName = `${row.training.member.firstName} ${row.training.member.lastName}`;

  const handleConfirm = () => {
    recordPayout.mutate(
      {
        trainingId: row.training.id,
        month: slot.month,
        year: slot.year,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setNotes('');
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Cash Payout</DialogTitle>
          <DialogDescription>
            Mark this month as paid for {memberName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="rounded-lg border bg-muted/40 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client</span>
              <span className="font-medium">{memberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Month</span>
              <span className="font-medium">{formatMonthYear(slot.month, slot.year)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue share (60%)</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatRupees(slot.amount)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground border-t pt-1.5 mt-1">
              <span>Based on {formatRupees(slot.revenueBase)} / month</span>
              <span>Cash payment</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payoutNotes">Notes (optional)</Label>
            <Textarea
              id="payoutNotes"
              placeholder="e.g. Paid in cash at gym"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={recordPayout.isPending}>
            {recordPayout.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Mark as Paid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Payout Schedule Section ──────────────────────────────────────────────────

function PayoutScheduleSection({
  trainerId,
  trainerName,
  currentSplitPercent,
}: {
  trainerId: string;
  trainerName: string;
  currentSplitPercent: number;
}) {
  const { data: scheduleResponse, isLoading } = useTrainerPayoutSchedule(trainerId);
  const [selectedPayout, setSelectedPayout] = useState<{
    row: TrainerPayoutRow;
    slot: TrainerPayoutMonthSlot;
  } | null>(null);
  const [editSplitOpen, setEditSplitOpen] = useState(false);
  const [splitInput, setSplitInput] = useState(String(currentSplitPercent));
  const updateTrainer = useUpdateTrainer(trainerId);

  const schedule = scheduleResponse?.data;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!schedule || schedule.rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Payout Schedule
          </CardTitle>
          <CardDescription>Track monthly payouts to {trainerName}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8">
            <IndianRupee className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No active clients — no payouts to track.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary, rows } = schedule;

  return (
    <>
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-0.5">Total Owed</p>
            <p className="text-lg font-semibold">{formatRupees(summary.totalOwed)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-0.5">Paid Out</p>
            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {formatRupees(summary.totalPaid)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-0.5">Outstanding</p>
            <p
              className={`text-lg font-semibold ${
                summary.outstanding > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground'
              }`}
            >
              {formatRupees(summary.outstanding)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-client payout grid */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Payout Schedule
              </CardTitle>
              <CardDescription className="mt-1">
                Click an unpaid month to record a cash payout.{' '}
                <button
                  onClick={() => { setSplitInput(String(schedule.splitPercent)); setEditSplitOpen(true); }}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  {schedule.splitPercent}% split
                  <Pencil className="h-3 w-3" />
                </button>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Client</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Per Month</TableHead>
                  <TableHead>Monthly Payouts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const fullName = `${row.training.member.firstName} ${row.training.member.lastName}`;
                  return (
                    <TableRow key={row.training.id} className="align-middle">
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback
                              className={`text-xs font-semibold ${getAvatarColor(fullName)}`}
                            >
                              {row.training.member.firstName[0].toUpperCase()}
                              {row.training.member.lastName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-sm leading-tight">{fullName}</p>
                              {row.training.status === 'expired' && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 font-medium">
                                  Expired
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(row.training.startDate)} –{' '}
                              {formatDate(row.training.endDate)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.training.planVariant?.planType?.name ?? '—'}
                        {row.training.planVariant?.durationLabel
                          ? ` · ${row.training.planVariant.durationLabel}`
                          : ''}
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        {formatRupees(row.months[0]?.amount ?? 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5 py-1">
                          {row.months.map((slot) => (
                            <button
                              key={`${slot.month}-${slot.year}`}
                              onClick={() =>
                                !slot.paid && setSelectedPayout({ row, slot })
                              }
                              title={
                                slot.paid
                                  ? `Paid on ${slot.paidAt ? new Date(slot.paidAt).toLocaleDateString('en-IN') : '—'}`
                                  : `Click to pay ${formatMonthYear(slot.month, slot.year)}`
                              }
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border transition-colors ${
                                slot.paid
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 cursor-default'
                                  : 'bg-muted/50 text-muted-foreground border-border hover:border-primary hover:text-primary cursor-pointer'
                              }`}
                            >
                              {slot.paid ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <Circle className="h-3 w-3" />
                              )}
                              {formatMonthYear(slot.month, slot.year)}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 p-4 sm:hidden">
            {rows.map((row) => {
              const fullName = `${row.training.member.firstName} ${row.training.member.lastName}`;
              return (
                <div key={row.training.id} className="rounded-lg border p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className={`text-xs font-semibold ${getAvatarColor(fullName)}`}
                        >
                          {row.training.member.firstName[0].toUpperCase()}
                          {row.training.member.lastName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-sm">{fullName}</p>
                          {row.training.status === 'expired' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 font-medium">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {row.training.planVariant?.planType?.name ?? '—'}
                          {row.training.planVariant?.durationLabel
                            ? ` · ${row.training.planVariant.durationLabel}`
                            : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Per month</p>
                      <p className="font-semibold text-sm">
                        {formatRupees(row.months[0]?.amount ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {row.months.map((slot) => (
                      <button
                        key={`${slot.month}-${slot.year}`}
                        onClick={() =>
                          !slot.paid && setSelectedPayout({ row, slot })
                        }
                        title={
                          slot.paid
                            ? `Paid on ${slot.paidAt ? new Date(slot.paidAt).toLocaleDateString('en-IN') : '—'}`
                            : `Tap to pay ${formatMonthYear(slot.month, slot.year)}`
                        }
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border transition-colors ${
                          slot.paid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 cursor-default'
                            : 'bg-muted/50 text-muted-foreground border-border hover:border-primary hover:text-primary cursor-pointer'
                        }`}
                      >
                        {slot.paid ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Circle className="h-3 w-3" />
                        )}
                        {formatMonthYear(slot.month, slot.year)}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between text-xs pt-1 border-t">
                    <span className="text-muted-foreground">
                      Paid:{' '}
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatRupees(row.totalPaid)}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      Outstanding:{' '}
                      <span
                        className={
                          row.outstanding > 0
                            ? 'text-amber-600 dark:text-amber-400 font-medium'
                            : 'font-medium'
                        }
                      >
                        {formatRupees(row.outstanding)}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedPayout && (
        <ConfirmPayoutDialog
          open={!!selectedPayout}
          onOpenChange={(open) => !open && setSelectedPayout(null)}
          row={selectedPayout.row}
          slot={selectedPayout.slot}
          trainerId={trainerId}
        />
      )}

      {/* Edit Split % Dialog */}
      <Dialog open={editSplitOpen} onOpenChange={setEditSplitOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Edit Revenue Split</DialogTitle>
            <DialogDescription>
              Change the percentage of training revenue paid to {trainerName}.
              This affects future payouts only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label htmlFor="editSplit">Split Percentage (%)</Label>
            <Input
              id="editSplit"
              type="number"
              min={0}
              max={100}
              value={splitInput}
              onChange={(e) => setSplitInput(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSplitOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={updateTrainer.isPending}
              onClick={() => {
                const val = parseFloat(splitInput);
                if (isNaN(val) || val < 0 || val > 100) return;
                updateTrainer.mutate(
                  { splitPercent: val },
                  { onSuccess: () => setEditSplitOpen(false) },
                );
              }}
            >
              {updateTrainer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Edit Trainer Dialog ──────────────────────────────────────────────────────

interface EditTrainerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer: { id: string; name: string; splitPercent?: number | null };
}

function EditTrainerDialog({ open, onOpenChange, trainer }: EditTrainerDialogProps) {
  const [name, setName] = useState(trainer.name);
  const [splitInput, setSplitInput] = useState(String(trainer.splitPercent ?? 60));
  const updateTrainer = useUpdateTrainer(trainer.id);

  const handleSave = () => {
    const split = parseFloat(splitInput);
    if (!name.trim() || isNaN(split) || split < 0 || split > 100) return;
    updateTrainer.mutate(
      { name: name.trim(), splitPercent: split },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Trainer</DialogTitle>
          <DialogDescription>Update trainer name and revenue split.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="editName">Name</Label>
            <Input
              id="editName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Trainer name"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editSplitPercent">Trainer's Share of Revenue (%)</Label>
            <Input
              id="editSplitPercent"
              type="number"
              min={0}
              max={100}
              value={splitInput}
              onChange={(e) => setSplitInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Percentage of training revenue paid to the trainer.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || updateTrainer.isPending}
            onClick={handleSave}
          >
            {updateTrainer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TrainerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editTrainerOpen, setEditTrainerOpen] = useState(false);

  const { data: trainerResponse, isLoading } = useTrainerWithClients(id!);
  const trainer = trainerResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="space-y-4">
        <PageHeader title="Trainer Not Found" />
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              The trainer you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate(ROUTES.TRAINERS)}>
              Back to Trainers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeClients = trainer.trainings ?? [];

  function getClientsForExport() {
    return activeClients.map((t) => ({
      memberName: `${t.member.firstName} ${t.member.lastName}`,
      phone: t.member.phone ?? '',
      email: t.member.email ?? '',
      planName: t.planVariant?.planType?.name ?? '',
      durationLabel: t.planVariant?.durationLabel ?? '',
      startDate: new Date(t.startDate).toISOString().slice(0, 10),
      endDate: new Date(t.endDate).toISOString().slice(0, 10),
      status: t.status,
    }));
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={trainer.name}
        description="Trainer profile, active clients, and payout tracking."
        actions={
          <div className="flex items-center gap-2">
            {activeClients.length > 0 && (
              <ExportDropdown
                title={`${trainer.name} – Active Clients`}
                filename={`${trainer.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_clients_${new Date().toISOString().slice(0, 10)}`}
                headers={TRAINER_CLIENTS_CSV_HEADERS}
                getData={getClientsForExport}
              />
            )}
            <Button variant="outline" size="sm" onClick={() => setEditTrainerOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => navigate(ROUTES.TRAINERS)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />

      {/* Trainer Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
              {trainer.name[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{trainer.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <Badge
                  variant={trainer.isActive ? 'default' : 'secondary'}
                  className={
                    trainer.isActive
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 border-0'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border-0'
                  }
                >
                  <span
                    className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${
                      trainer.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  />
                  {trainer.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {activeClients.length} active{' '}
                  {activeClients.length === 1 ? 'client' : 'clients'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Schedule */}
      <PayoutScheduleSection
        trainerId={trainer.id}
        trainerName={trainer.name}
        currentSplitPercent={trainer.splitPercent ?? 60}
      />

      {/* Active Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Clients</CardTitle>
          <CardDescription>
            Members currently training with {trainer.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Dumbbell className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No active clients at the moment.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeClients.map((training) => {
                      const fullName = `${training.member.firstName} ${training.member.lastName}`;
                      return (
                        <TableRow
                          key={training.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/members/${training.member.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback
                                  className={`text-xs font-semibold ${getAvatarColor(fullName)}`}
                                >
                                  {training.member.firstName[0].toUpperCase()}
                                  {training.member.lastName[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {training.planVariant?.planType?.name ?? '—'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {training.planVariant?.durationLabel ?? ''}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(training.startDate)} –{' '}
                              {formatDate(training.endDate)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="space-y-0.5">
                              {training.member.phone && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {training.member.phone}
                                </div>
                              )}
                              {training.member.email && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {training.member.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 sm:hidden">
                {activeClients.map((training) => {
                  const fullName = `${training.member.firstName} ${training.member.lastName}`;
                  return (
                    <div
                      key={training.id}
                      className="rounded-lg border p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/members/${training.member.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback
                              className={`text-xs font-semibold ${getAvatarColor(fullName)}`}
                            >
                              {training.member.firstName[0].toUpperCase()}
                              {training.member.lastName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {training.planVariant?.planType?.name ?? '—'}
                              {training.planVariant?.durationLabel
                                ? ` · ${training.planVariant.durationLabel}`
                                : ''}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(training.startDate)} –{' '}
                        {formatDate(training.endDate)}
                      </div>
                      {(training.member.phone || training.member.email) && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {training.member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {training.member.phone}
                            </span>
                          )}
                          {training.member.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {training.member.email}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Trainer Dialog */}
      <EditTrainerDialog
        open={editTrainerOpen}
        onOpenChange={setEditTrainerOpen}
        trainer={trainer}
      />
    </div>
  );
}

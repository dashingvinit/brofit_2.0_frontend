import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Users,
  CalendarDays,
  ChevronRight,
  Wallet,
  CheckCircle2,
  Circle,
  IndianRupee,
  Pencil,
  History,
  TrendingUp,
  Clock,
  Percent,
  Filter,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { PageHeader } from '@/shared/components/page-header';
import { EmptyState } from '@/shared/components/empty-state';
import { StatCard } from '@/shared/components/stat-card';
import { ROUTES } from '@/shared/lib/constants';
import {
  useTrainerWithClients,
  useTrainerPayoutSchedule,
  useRecordTrainerPayout,
  useDeleteTrainerPayout,
  useBackfillTrainerExpenses,
  useUpdateTrainer,
  useTrainerAssignmentHistory,
} from '../hooks/use-trainers';
import type { TrainerPayoutMonthSlot, TrainerPayoutRow } from '@/shared/types/common.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

// ─── Confirm Payout Dialog ───────────────────────────────────────────────────

interface ConfirmPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: TrainerPayoutRow;
  slot: TrainerPayoutMonthSlot;
  trainerId: string;
}

function ConfirmPayoutDialog({ open, onOpenChange, row, slot, trainerId }: ConfirmPayoutDialogProps) {
  const [notes, setNotes] = useState('');
  const recordPayout = useRecordTrainerPayout(trainerId);
  const memberName = `${row.training.member.firstName} ${row.training.member.lastName}`;

  const handleConfirm = () => {
    recordPayout.mutate(
      { trainingId: row.training.id, month: slot.month, year: slot.year, notes: notes.trim() || undefined },
      { onSuccess: () => { setNotes(''); onOpenChange(false); } },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Cash Payout</DialogTitle>
          <DialogDescription>Mark this month as paid for {memberName}.</DialogDescription>
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
              <span className="text-muted-foreground">
                {slot.isFixedPayout ? 'Negotiated payout' : 'Revenue share'}
              </span>
              <span className={`font-semibold ${slot.isFixedPayout ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {formatRupees(slot.amount)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground border-t pt-1.5 mt-1">
              <span>
                {slot.isFixedPayout
                  ? `Fixed total: ${formatRupees(row.training.trainerFixedPayout ?? 0)}`
                  : `Based on ${formatRupees(slot.revenueBase)} / month`}
              </span>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={recordPayout.isPending}>
            {recordPayout.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Mark as Paid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Confirm Unmark Dialog ───────────────────────────────────────────────────

interface ConfirmUnmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: TrainerPayoutRow;
  slot: TrainerPayoutMonthSlot;
  trainerId: string;
}

function ConfirmUnmarkDialog({ open, onOpenChange, row, slot, trainerId }: ConfirmUnmarkDialogProps) {
  const deletePayout = useDeleteTrainerPayout(trainerId);
  const memberName = `${row.training.member.firstName} ${row.training.member.lastName}`;

  const handleConfirm = () => {
    deletePayout.mutate(
      { trainingId: row.training.id, month: slot.month, year: slot.year },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Remove Payout</DialogTitle>
          <DialogDescription>
            This will unmark {formatMonthYear(slot.month, slot.year)} as paid for {memberName} and delete the linked expense record.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Client</span>
            <span className="font-medium">{memberName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Month</span>
            <span className="font-medium">{formatMonthYear(slot.month, slot.year)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium text-red-600 dark:text-red-400">{formatRupees(slot.amount)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deletePayout.isPending}>
            {deletePayout.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Remove Payout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Trainer Dialog ─────────────────────────────────────────────────────

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
            <Input id="editName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Trainer name" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editSplitPercent">Trainer's Share of Revenue (%)</Label>
            <Input id="editSplitPercent" type="number" min={0} max={100} value={splitInput} onChange={(e) => setSplitInput(e.target.value)} />
            <p className="text-xs text-muted-foreground">Percentage of training revenue paid to the trainer.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!name.trim() || updateTrainer.isPending} onClick={handleSave}>
            {updateTrainer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Month Pill Button ───────────────────────────────────────────────────────

function MonthPill({
  slot,
  onClickPaid,
  onClickUnpaid,
}: {
  slot: TrainerPayoutMonthSlot;
  onClickPaid: () => void;
  onClickUnpaid: () => void;
}) {
  return (
    <button
      onClick={slot.paid ? onClickPaid : onClickUnpaid}
      title={
        slot.paid
          ? `Paid on ${slot.paidAt ? new Date(slot.paidAt).toLocaleDateString('en-IN') : '—'} — click to remove`
          : `Click to pay ${formatMonthYear(slot.month, slot.year)}`
      }
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border transition-colors ${
        slot.paid
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/30 dark:hover:text-red-400 dark:hover:border-red-800 cursor-pointer'
          : 'bg-muted/50 text-muted-foreground border-border hover:border-primary hover:text-primary cursor-pointer'
      }`}
    >
      {slot.paid ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
      {formatMonthYear(slot.month, slot.year)}
    </button>
  );
}

// ─── Due This Month Card ─────────────────────────────────────────────────────

function DueThisMonthSection({
  rows,
  trainerId,
  splitPercent,
}: {
  rows: TrainerPayoutRow[];
  trainerId: string;
  splitPercent: number;
}) {
  const [selectedPayout, setSelectedPayout] = useState<{ row: TrainerPayoutRow; slot: TrainerPayoutMonthSlot } | null>(null);

  const { month: curMonth, year: curYear } = getCurrentMonthYear();

  // For each training, find the earliest unpaid month that has already elapsed
  // (≤ current month). This enforces sequential payment — Month N must be marked
  // paid before Month N+1 becomes due.
  const dueItems = useMemo(() => {
    const items: { row: TrainerPayoutRow; slot: TrainerPayoutMonthSlot }[] = [];
    for (const row of rows) {
      if (!['active', 'expired'].includes(row.training.status)) continue;
      const slot = row.months
        .filter((m) => {
          if (m.paid) return false;
          if (m.year > curYear) return false;
          if (m.year === curYear && m.month > curMonth) return false;
          return true;
        })
        .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)[0];
      if (slot) items.push({ row, slot });
    }
    return items;
  }, [rows, curMonth, curYear]);

  const totalDue = dueItems.reduce((sum, item) => sum + item.slot.amount, 0);

  if (dueItems.length === 0) {
    return (
      <Card className="border-t-2 border-t-emerald-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 p-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-sm">All payouts are up to date</p>
              <p className="text-xs text-muted-foreground">No pending payouts through {formatMonthYear(curMonth, curYear)}.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-t-2 border-t-amber-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/50 p-2">
                <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base">Payouts Due</CardTitle>
                <CardDescription>{dueItems.length} {dueItems.length === 1 ? 'client' : 'clients'} pending — pay oldest month first</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{formatRupees(totalDue)}</p>
              <p className="text-xs text-muted-foreground">{splitPercent}% split</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {dueItems.map(({ row, slot }) => {
              const fullName = `${row.training.member.firstName} ${row.training.member.lastName}`;
              return (
                <div
                  key={row.training.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`text-xs font-semibold ${getAvatarColor(fullName)}`}>
                        {row.training.member.firstName[0].toUpperCase()}
                        {row.training.member.lastName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.training.planVariant?.planType?.name ?? '—'}
                        {row.training.planVariant?.durationLabel ? ` · ${row.training.planVariant.durationLabel}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${slot.isFixedPayout ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                        {formatRupees(slot.amount)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatMonthYear(slot.month, slot.year)}
                        {slot.isFixedPayout && ' · negotiated'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => setSelectedPayout({ row, slot })}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Pay
                    </Button>
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
    </>
  );
}

// ─── Payout Schedule Section ─────────────────────────────────────────────────

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
  const [selectedPayout, setSelectedPayout] = useState<{ row: TrainerPayoutRow; slot: TrainerPayoutMonthSlot } | null>(null);
  const [selectedUnmark, setSelectedUnmark] = useState<{ row: TrainerPayoutRow; slot: TrainerPayoutMonthSlot } | null>(null);
  const [editSplitOpen, setEditSplitOpen] = useState(false);
  const [splitInput, setSplitInput] = useState(String(currentSplitPercent));
  const updateTrainer = useUpdateTrainer(trainerId);
  const backfill = useBackfillTrainerExpenses();
  const [backfillDone, setBackfillDone] = useState(false);
  const [payoutFilter, setPayoutFilter] = useState<'outstanding' | 'all'>('outstanding');

  const schedule = scheduleResponse?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Stat cards skeleton */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-7 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Due this month skeleton */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!schedule || schedule.rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-0">
          <EmptyState
            icon={<IndianRupee className="h-6 w-6 text-muted-foreground" />}
            title="No payouts to track"
            description={`${trainerName} has no active clients yet. Payouts will appear here once clients are assigned.`}
          />
        </CardContent>
      </Card>
    );
  }

  const { summary, rows } = schedule;

  // Filter rows: "outstanding" = has at least one unpaid month, "all" = everything
  const filteredRows = payoutFilter === 'outstanding'
    ? rows.filter((r) => r.outstanding > 0)
    : rows;

  const activeRows = rows.filter((r) => r.training.status === 'active');
  const totalRevenueGenerated = rows.reduce(
    (sum, r) => sum + r.months.reduce((ms, m) => ms + m.revenueBase, 0),
    0,
  );

  return (
    <>
      {/* Performance Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue Generated"
          shortLabel="Revenue"
          value={totalRevenueGenerated}
          icon={TrendingUp}
          colorClass="text-blue-600 dark:text-blue-400"
          bgClass="bg-blue-50 dark:bg-blue-950/50"
          isLoading={false}
          isCurrency
          subtext="Total from all clients"
          animationDelay={0}
        />
        <StatCard
          label="Total Owed"
          shortLabel="Owed"
          value={summary.totalOwed}
          icon={IndianRupee}
          colorClass="text-orange-600 dark:text-orange-400"
          bgClass="bg-orange-50 dark:bg-orange-950/50"
          isLoading={false}
          isCurrency
          subtext={`${currentSplitPercent}% split`}
          animationDelay={75}
        />
        <StatCard
          label="Paid Out"
          shortLabel="Paid"
          value={summary.totalPaid}
          icon={CheckCircle2}
          colorClass="text-emerald-600 dark:text-emerald-400"
          bgClass="bg-emerald-50 dark:bg-emerald-950/50"
          isLoading={false}
          isCurrency
          subtext="Completed payments"
          animationDelay={150}
        />
        <StatCard
          label="Outstanding"
          shortLabel="Due"
          value={summary.outstanding}
          icon={Clock}
          colorClass={summary.outstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}
          bgClass={summary.outstanding > 0 ? 'bg-amber-50 dark:bg-amber-950/50' : 'bg-muted'}
          isLoading={false}
          isCurrency
          subtext={summary.outstanding > 0 ? 'Needs attention' : 'All clear'}
          animationDelay={225}
        />
      </div>

      {/* Due This Month — the key actionable section */}
      <DueThisMonthSection rows={rows} trainerId={trainerId} splitPercent={schedule.splitPercent} />

      {/* Full Payout Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Payout Schedule
              </CardTitle>
              <CardDescription className="mt-1">
                Click an unpaid month to pay, or a paid month to remove.{' '}
                <button
                  onClick={() => { setSplitInput(String(schedule.splitPercent)); setEditSplitOpen(true); }}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <Percent className="h-3 w-3" />
                  {schedule.splitPercent}% split
                  <Pencil className="h-3 w-3" />
                </button>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!backfillDone && rows.some((r) => r.months.some((m) => m.paid)) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => backfill.mutate(undefined, { onSuccess: () => setBackfillDone(true) })}
                  disabled={backfill.isPending}
                  title="Create expense records for old payouts that are missing them"
                  className="hidden sm:inline-flex"
                >
                  {backfill.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Backfill Expenses'}
                </Button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mt-3">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Tabs value={payoutFilter} onValueChange={(v) => setPayoutFilter(v as 'outstanding' | 'all')}>
              <TabsList className="h-8">
                <TabsTrigger value="outstanding" className="text-xs px-3 py-1">
                  Outstanding ({rows.filter((r) => r.outstanding > 0).length})
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs px-3 py-1">
                  All Clients ({rows.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <CheckCircle2 className="h-7 w-7 text-emerald-500 mb-2" />
              <p className="text-sm text-muted-foreground">All payouts are settled!</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Client</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Per Month</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                      <TableHead>Monthly Payouts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row) => {
                      const fullName = `${row.training.member.firstName} ${row.training.member.lastName}`;
                      const isExpired = row.training.status === 'expired';
                      return (
                        <TableRow key={row.training.id} className={`align-middle ${isExpired ? 'opacity-60' : ''}`}>
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className={`text-xs font-semibold ${getAvatarColor(fullName)}`}>
                                  {row.training.member.firstName[0].toUpperCase()}
                                  {row.training.member.lastName[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-medium text-sm leading-tight">{fullName}</p>
                                  {isExpired && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Expired</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(row.training.startDate)} – {formatDate(row.training.endDate)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {row.training.planVariant?.planType?.name ?? '—'}
                            {row.training.planVariant?.durationLabel ? ` · ${row.training.planVariant.durationLabel}` : ''}
                          </TableCell>
                          <TableCell className="text-right font-medium text-sm">
                            <span className={row.training.trainerFixedPayout != null ? 'text-orange-600 dark:text-orange-400' : ''}>
                              {formatRupees(row.months[0]?.amount ?? 0)}
                            </span>
                            {row.training.trainerFixedPayout != null && (
                              <span className="block text-xs text-orange-500 dark:text-orange-400 font-normal">negotiated</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-semibold text-sm ${row.outstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {formatRupees(row.outstanding)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1.5 py-1">
                              {row.months.map((slot) => (
                                <MonthPill
                                  key={`${slot.month}-${slot.year}`}
                                  slot={slot}
                                  onClickPaid={() => setSelectedUnmark({ row, slot })}
                                  onClickUnpaid={() => setSelectedPayout({ row, slot })}
                                />
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
                {filteredRows.map((row) => {
                  const fullName = `${row.training.member.firstName} ${row.training.member.lastName}`;
                  const isExpired = row.training.status === 'expired';
                  return (
                    <div key={row.training.id} className={`rounded-lg border p-3 space-y-2.5 ${isExpired ? 'opacity-60' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={`text-xs font-semibold ${getAvatarColor(fullName)}`}>
                              {row.training.member.firstName[0].toUpperCase()}
                              {row.training.member.lastName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-sm">{fullName}</p>
                              {isExpired && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Expired</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {row.training.planVariant?.planType?.name ?? '—'}
                              {row.training.planVariant?.durationLabel ? ` · ${row.training.planVariant.durationLabel}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {row.training.trainerFixedPayout != null ? 'Per month (negotiated)' : 'Per month'}
                          </p>
                          <p className={`font-semibold text-sm ${row.training.trainerFixedPayout != null ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                            {formatRupees(row.months[0]?.amount ?? 0)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {row.months.map((slot) => (
                          <MonthPill
                            key={`${slot.month}-${slot.year}`}
                            slot={slot}
                            onClickPaid={() => setSelectedUnmark({ row, slot })}
                            onClickUnpaid={() => setSelectedPayout({ row, slot })}
                          />
                        ))}
                      </div>

                      <div className="flex justify-between text-xs pt-1 border-t">
                        <span className="text-muted-foreground">
                          Paid: <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatRupees(row.totalPaid)}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Outstanding:{' '}
                          <span className={row.outstanding > 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'font-medium'}>
                            {formatRupees(row.outstanding)}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
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
      {selectedUnmark && (
        <ConfirmUnmarkDialog
          open={!!selectedUnmark}
          onOpenChange={(open) => !open && setSelectedUnmark(null)}
          row={selectedUnmark.row}
          slot={selectedUnmark.slot}
          trainerId={trainerId}
        />
      )}

      {/* Edit Split % Dialog */}
      <Dialog open={editSplitOpen} onOpenChange={setEditSplitOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Edit Revenue Split</DialogTitle>
            <DialogDescription>
              Change the percentage of training revenue paid to {trainerName}. This affects future payouts only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label htmlFor="editSplit">Split Percentage (%)</Label>
            <Input id="editSplit" type="number" min={0} max={100} value={splitInput} onChange={(e) => setSplitInput(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSplitOpen(false)}>Cancel</Button>
            <Button
              disabled={updateTrainer.isPending}
              onClick={() => {
                const val = parseFloat(splitInput);
                if (isNaN(val) || val < 0 || val > 100) return;
                updateTrainer.mutate({ splitPercent: val }, { onSuccess: () => setEditSplitOpen(false) });
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

// ─── Main Page ───────────────────────────────────────────────────────────────

export function TrainerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editTrainerOpen, setEditTrainerOpen] = useState(false);

  const { data: trainerResponse, isLoading } = useTrainerWithClients(id!);
  const { data: historyResponse } = useTrainerAssignmentHistory(id!);
  const trainer = trainerResponse?.data;
  const assignmentHistory = historyResponse?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-3 w-16 mb-2" /><Skeleton className="h-7 w-20" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-4"><Skeleton className="h-40 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="space-y-4">
        <PageHeader title="Trainer Not Found" />
        <Card>
          <CardContent className="py-0">
            <EmptyState
              icon={<AlertCircle className="h-6 w-6 text-muted-foreground" />}
              title="Trainer not found"
              description="The trainer you're looking for doesn't exist or has been removed."
              action={<Button onClick={() => navigate(ROUTES.TRAINERS)}>Back to Trainers</Button>}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeClients = trainer.trainings?.filter((t) => t.status === 'active') ?? [];
  const pastTrainings = assignmentHistory.filter((t) => t.status !== 'active');

  return (
    <div className="space-y-4">
      <PageHeader
        title={trainer.name}
        description="Trainer profile, payout tracking, and client history."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditTrainerOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.TRAINERS)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />

      {/* Trainer Profile Strip */}
      <Card className="animate-in fade-in zoom-in-95 duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 font-bold text-lg shrink-0">
              {trainer.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold truncate">{trainer.name}</h2>
                <Badge
                  variant={trainer.isActive ? 'default' : 'secondary'}
                  className={
                    trainer.isActive
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 border-0'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border-0'
                  }
                >
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${trainer.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {trainer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {activeClients.length} active {activeClients.length === 1 ? 'client' : 'clients'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5" />
                  {trainer.splitPercent ?? 60}% revenue split
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Since {formatDate(trainer.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Schedule (includes stats, due this month, and full schedule) */}
      <PayoutScheduleSection
        trainerId={trainer.id}
        trainerName={trainer.name}
        currentSplitPercent={trainer.splitPercent ?? 60}
      />

      {/* Past Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Past Clients
            {pastTrainings.length > 0 && (
              <Badge variant="secondary" className="text-xs ml-1">{pastTrainings.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>Expired, cancelled, or frozen trainings.</CardDescription>
        </CardHeader>
        <CardContent>
          {pastTrainings.length === 0 ? (
            <EmptyState
              icon={<History className="h-6 w-6 text-muted-foreground" />}
              title="No past assignments"
              description={`${trainer.name} hasn't had any completed or expired trainings yet.`}
              className="py-10"
            />
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
                      <TableHead>Status</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastTrainings.map((training) => {
                      const fullName = training.member
                        ? `${training.member.firstName} ${training.member.lastName}`
                        : '—';
                      const statusVariant =
                        training.status === 'expired' ? 'secondary'
                        : training.status === 'frozen' ? 'outline'
                        : 'destructive';
                      return (
                        <TableRow
                          key={training.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => training.member && navigate(`/members/${training.member.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className={`text-xs font-semibold ${getAvatarColor(fullName)}`}>
                                  {training.member?.firstName?.[0]?.toUpperCase() ?? '?'}
                                  {training.member?.lastName?.[0]?.toUpperCase() ?? ''}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{training.planVariant?.planType?.name ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">{training.planVariant?.durationLabel ?? ''}</p>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(training.startDate)} – {formatDate(training.endDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant} className="capitalize">{training.status}</Badge>
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
                {pastTrainings.map((training) => {
                  const fullName = training.member
                    ? `${training.member.firstName} ${training.member.lastName}`
                    : '—';
                  const statusVariant =
                    training.status === 'expired' ? 'secondary'
                    : training.status === 'frozen' ? 'outline'
                    : 'destructive';
                  return (
                    <div
                      key={training.id}
                      className="rounded-lg border p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => training.member && navigate(`/members/${training.member.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={`text-xs font-semibold ${getAvatarColor(fullName)}`}>
                              {training.member?.firstName?.[0]?.toUpperCase() ?? '?'}
                              {training.member?.lastName?.[0]?.toUpperCase() ?? ''}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {training.planVariant?.planType?.name ?? '—'}
                              {training.planVariant?.durationLabel ? ` · ${training.planVariant.durationLabel}` : ''}
                            </p>
                          </div>
                        </div>
                        <Badge variant={statusVariant} className="capitalize text-xs">{training.status}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(training.startDate)} – {formatDate(training.endDate)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Trainer Dialog */}
      <EditTrainerDialog open={editTrainerOpen} onOpenChange={setEditTrainerOpen} trainer={trainer} />
    </div>
  );
}

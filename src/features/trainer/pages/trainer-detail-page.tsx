import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  IndianRupee,
  Pencil,
  History,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";
import { StatCard } from "@/shared/components/stat-card";
import { ROUTES } from "@/shared/lib/constants";
import {
  useTrainerWithClients,
  useTrainerPayoutSchedule,
  useRecordTrainerPayout,
  useDeleteTrainerPayout,
  useBackfillTrainerExpenses,
  useUpdateTrainer,
  useTrainerAssignmentHistory,
} from "../hooks/use-trainers";
import type {
  TrainerPayoutMonthSlot,
  TrainerPayoutRow,
} from "@/shared/types/common.types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMonthYear(month: number, year: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function formatRupees(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
  ];
  return colors[
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length
  ];
}

interface MonthGroup {
  month: number;
  year: number;
  items: { row: TrainerPayoutRow; slot: TrainerPayoutMonthSlot }[];
}

function groupPayoutsByMonth(rows: TrainerPayoutRow[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();
  for (const row of rows) {
    if (!["active", "expired"].includes(row.training.status)) continue;
    for (const slot of row.months) {
      const key = `${slot.year}-${String(slot.month).padStart(2, "0")}`;
      if (!map.has(key))
        map.set(key, { month: slot.month, year: slot.year, items: [] });
      map.get(key)!.items.push({ row, slot });
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.year !== b.year ? b.year - a.year : b.month - a.month,
  );
}

// ─── Confirm Payout Dialog ────────────────────────────────────────────────────

function ConfirmPayoutDialog({
  open,
  onOpenChange,
  row,
  slot,
  trainerId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: TrainerPayoutRow;
  slot: TrainerPayoutMonthSlot;
  trainerId: string;
}) {
  const [notes, setNotes] = useState("");
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
          setNotes("");
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
            Mark {formatMonthYear(slot.month, slot.year)} as paid for{" "}
            {memberName}.
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
              <span className="font-medium">
                {formatMonthYear(slot.month, slot.year)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {slot.isFixedPayout ? "Negotiated payout" : "Revenue share"}
              </span>
              <span
                className={`font-semibold ${slot.isFixedPayout ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}`}
              >
                {formatRupees(slot.amount)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground border-t pt-1.5 mt-1">
              <span>
                {slot.isFixedPayout
                  ? `Fixed: ${formatRupees(row.training.trainerFixedPayout ?? 0)}`
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

// ─── Confirm Unmark Dialog ────────────────────────────────────────────────────

function ConfirmUnmarkDialog({
  open,
  onOpenChange,
  row,
  slot,
  trainerId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: TrainerPayoutRow;
  slot: TrainerPayoutMonthSlot;
  trainerId: string;
}) {
  const deletePayout = useDeleteTrainerPayout(trainerId);
  const memberName = `${row.training.member.firstName} ${row.training.member.lastName}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Remove Payout</DialogTitle>
          <DialogDescription>
            This will unmark {formatMonthYear(slot.month, slot.year)} as paid
            for {memberName} and delete the linked expense record.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Client</span>
            <span className="font-medium">{memberName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Month</span>
            <span className="font-medium">
              {formatMonthYear(slot.month, slot.year)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {formatRupees(slot.amount)}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              deletePayout.mutate(
                {
                  trainingId: row.training.id,
                  month: slot.month,
                  year: slot.year,
                },
                { onSuccess: () => onOpenChange(false) },
              )
            }
            disabled={deletePayout.isPending}
          >
            {deletePayout.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Remove Payout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Trainer Dialog ──────────────────────────────────────────────────────

function EditTrainerDialog({
  open,
  onOpenChange,
  trainer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer: { id: string; name: string; splitPercent?: number | null };
}) {
  const [name, setName] = useState(trainer.name);
  const [splitInput, setSplitInput] = useState(
    String(trainer.splitPercent ?? 60),
  );
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
          <DialogDescription>
            Update trainer name and revenue split.
          </DialogDescription>
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
            <Label htmlFor="editSplit">Trainer's Share of Revenue (%)</Label>
            <Input
              id="editSplit"
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
            {updateTrainer.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Payout Months Section ────────────────────────────────────────────────────

function PayoutMonthsSection({
  trainerId,
  trainerName,
  splitPercent,
}: {
  trainerId: string;
  trainerName: string;
  splitPercent: number;
}) {
  const { data: scheduleResponse, isLoading } =
    useTrainerPayoutSchedule(trainerId);
  const [selectedPayout, setSelectedPayout] = useState<{
    row: TrainerPayoutRow;
    slot: TrainerPayoutMonthSlot;
  } | null>(null);
  const [selectedUnmark, setSelectedUnmark] = useState<{
    row: TrainerPayoutRow;
    slot: TrainerPayoutMonthSlot;
  } | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const backfill = useBackfillTrainerExpenses();
  const [backfillDone, setBackfillDone] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="p-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-t">
              <Skeleton className="h-4 w-4 rounded-full shrink-0" />
              <Skeleton className="h-4 w-28 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const schedule = scheduleResponse?.data;

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

  const { rows, summary } = schedule;
  const allGroups = groupPayoutsByMonth(rows);
  const totalRevenue = rows.reduce(
    (sum, r) => sum + r.months.reduce((ms, m) => ms + m.revenueBase, 0),
    0,
  );

  const toggleMonth = (key: string) =>
    setExpandedMonth((prev) => (prev === key ? null : key));
  const now = new Date();

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Monthly Payouts</CardTitle>
            {summary.outstanding > 0 ? (
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {formatRupees(summary.outstanding)} outstanding
              </span>
            ) : (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> All settled
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {allGroups.map((group, idx) => {
            const key = `${group.year}-${String(group.month).padStart(2, "0")}`;
            const isPending = group.items.some((i) => !i.slot.paid);
            const unpaid = group.items.filter((i) => !i.slot.paid);
            const paid = group.items.filter((i) => i.slot.paid);
            const totalDue = unpaid.reduce((sum, i) => sum + i.slot.amount, 0);
            const totalPaid = paid.reduce((sum, i) => sum + i.slot.amount, 0);
            const isExpanded = expandedMonth === key;
            const isFuture =
              group.year > now.getFullYear() ||
              (group.year === now.getFullYear() &&
                group.month > now.getMonth() + 1);

            return (
              <div key={key} className={idx > 0 ? "border-t" : ""}>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => toggleMonth(key)}
                >
                  {!isPending ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : isFuture ? (
                    <div className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/40 bg-muted" />
                  ) : (
                    <div className="h-4 w-4 shrink-0 rounded-full border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/50" />
                  )}
                  <span className="font-medium text-sm flex-1">
                    {formatMonthYear(group.month, group.year)}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "client" : "clients"}
                  </span>
                  {!isPending ? (
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 shrink-0">
                      {formatRupees(totalPaid)} paid
                    </span>
                  ) : isFuture ? (
                    <span className="text-sm text-muted-foreground shrink-0">
                      {formatRupees(totalDue)} scheduled
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                      {formatRupees(totalDue)} due
                    </span>
                  )}
                  <ChevronRight
                    className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                  />
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t bg-muted/30">
                      {[...unpaid, ...paid].map(({ row, slot }) => {
                        const name = `${row.training.member.firstName} ${row.training.member.lastName}`;
                        return (
                          <div
                            key={row.training.id}
                            className={`flex items-center justify-between pl-11 pr-4 py-2.5 border-b last:border-b-0 ${slot.paid ? "opacity-60" : ""}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarFallback
                                  className={`text-xs font-semibold ${getAvatarColor(name)}`}
                                >
                                  {row.training.member.firstName[0].toUpperCase()}
                                  {row.training.member.lastName[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-medium truncate">
                                    {name}
                                  </p>
                                  {row.training.status === "expired" && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] px-1.5 py-0 shrink-0"
                                    >
                                      Expired
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {row.training.planVariant?.planType?.name ??
                                    "—"}
                                  {slot.paid && slot.paidAt
                                    ? ` · paid ${new Date(slot.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                                    : slot.isFixedPayout
                                      ? " · negotiated"
                                      : ""}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-2">
                              <span
                                className={`font-semibold text-sm ${slot.isFixedPayout && !slot.paid ? "text-orange-600 dark:text-orange-400" : ""}`}
                              >
                                {formatRupees(slot.amount)}
                              </span>
                              {slot.paid ? (
                                <button
                                  onClick={() =>
                                    setSelectedUnmark({ row, slot })
                                  }
                                  title="Click to undo payment"
                                  className="text-emerald-600 dark:text-emerald-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs px-2.5"
                                  onClick={() =>
                                    setSelectedPayout({ row, slot })
                                  }
                                >
                                  Pay
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Summary stats — at the end */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 pt-1">
        <StatCard
          label="Revenue Generated"
          shortLabel="Revenue"
          value={totalRevenue}
          icon={TrendingUp}
          colorClass="text-blue-600 dark:text-blue-400"
          bgClass="bg-blue-50 dark:bg-blue-950/50"
          isLoading={false}
          isCurrency
          subtext="Total from all clients"
          animationDelay={0}
        />
        <StatCard
          label="Total Paid Out"
          shortLabel="Paid"
          value={summary.totalPaid}
          icon={CheckCircle2}
          colorClass="text-emerald-600 dark:text-emerald-400"
          bgClass="bg-emerald-50 dark:bg-emerald-950/50"
          isLoading={false}
          isCurrency
          subtext="Completed payments"
          animationDelay={75}
        />
        <StatCard
          label="Outstanding"
          shortLabel="Due"
          value={summary.outstanding}
          icon={Clock}
          colorClass={
            summary.outstanding > 0
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground"
          }
          bgClass={
            summary.outstanding > 0
              ? "bg-amber-50 dark:bg-amber-950/50"
              : "bg-muted"
          }
          isLoading={false}
          isCurrency
          subtext={summary.outstanding > 0 ? "Needs attention" : "All clear"}
          animationDelay={150}
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
          subtext={`${splitPercent}% split`}
          animationDelay={225}
        />
      </div>

      {/* Backfill — admin utility, shown only when relevant */}
      {!backfillDone && rows.some((r) => r.months.some((m) => m.paid)) && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={() =>
              backfill.mutate(undefined, {
                onSuccess: () => setBackfillDone(true),
              })
            }
            disabled={backfill.isPending}
          >
            {backfill.isPending && (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            )}
            Backfill expense records
          </Button>
        </div>
      )}

      {selectedPayout && (
        <ConfirmPayoutDialog
          open
          onOpenChange={(open) => !open && setSelectedPayout(null)}
          row={selectedPayout.row}
          slot={selectedPayout.slot}
          trainerId={trainerId}
        />
      )}
      {selectedUnmark && (
        <ConfirmUnmarkDialog
          open
          onOpenChange={(open) => !open && setSelectedUnmark(null)}
          row={selectedUnmark.row}
          slot={selectedUnmark.slot}
          trainerId={trainerId}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
        <Skeleton className="h-4 w-64" />
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
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
              description="This trainer doesn't exist or has been removed."
              action={
                <Button onClick={() => navigate(ROUTES.TRAINERS)}>
                  Back to Trainers
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeClients =
    trainer.trainings?.filter((t) => t.status === "active") ?? [];
  const pastTrainings = assignmentHistory.filter((t) => t.status !== "active");
  const splitPercent = trainer.splitPercent ?? 60;

  return (
    <div className="space-y-4">
      <PageHeader
        title={trainer.name}
        description={`${trainer.isActive ? "Active" : "Inactive"} · ${splitPercent}% revenue split · ${activeClients.length} active ${activeClients.length === 1 ? "client" : "clients"}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditTrainerOpen(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.TRAINERS)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />

      <PayoutMonthsSection
        trainerId={trainer.id}
        trainerName={trainer.name}
        splitPercent={splitPercent}
      />

      {pastTrainings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              Past Clients
              <Badge variant="secondary" className="text-xs ml-1">
                {pastTrainings.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                      : "—";
                    const statusVariant =
                      training.status === "expired"
                        ? "secondary"
                        : training.status === "frozen"
                          ? "outline"
                          : "destructive";
                    return (
                      <TableRow
                        key={training.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          training.member &&
                          navigate(`/members/${training.member.id}`)
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback
                                className={`text-xs font-semibold ${getAvatarColor(fullName)}`}
                              >
                                {training.member?.firstName?.[0]?.toUpperCase() ??
                                  "?"}
                                {training.member?.lastName?.[0]?.toUpperCase() ??
                                  ""}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">
                              {fullName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {training.planVariant?.planType?.name ?? "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {training.planVariant?.durationLabel ?? ""}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(training.startDate)} –{" "}
                            {formatDate(training.endDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant} className="capitalize">
                            {training.status}
                          </Badge>
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

            <div className="space-y-3 sm:hidden">
              {pastTrainings.map((training) => {
                const fullName = training.member
                  ? `${training.member.firstName} ${training.member.lastName}`
                  : "—";
                const statusVariant =
                  training.status === "expired"
                    ? "secondary"
                    : training.status === "frozen"
                      ? "outline"
                      : "destructive";
                return (
                  <div
                    key={training.id}
                    className="rounded-lg border p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() =>
                      training.member &&
                      navigate(`/members/${training.member.id}`)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            className={`text-xs font-semibold ${getAvatarColor(fullName)}`}
                          >
                            {training.member?.firstName?.[0]?.toUpperCase() ??
                              "?"}
                            {training.member?.lastName?.[0]?.toUpperCase() ??
                              ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {training.planVariant?.planType?.name ?? "—"}
                            {training.planVariant?.durationLabel
                              ? ` · ${training.planVariant.durationLabel}`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={statusVariant}
                        className="capitalize text-xs"
                      >
                        {training.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(training.startDate)} –{" "}
                      {formatDate(training.endDate)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <EditTrainerDialog
        open={editTrainerOpen}
        onOpenChange={setEditTrainerOpen}
        trainer={trainer}
      />
    </div>
  );
}

import { useNavigate, Link } from 'react-router-dom';
import { usePrivacy } from '@/shared/hooks/use-privacy';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Plus,
  Pencil,
  Trash2,
  BarChart3,
  Clock,
  Loader2,
  ChevronRight,
  Target,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
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
  useInvestments,
  useRoi,
  useTrends,
  useDeleteInvestment,
  useMonthlySummary,
} from '../hooks/use-financials';
import { ExpenseDialog } from '../components/expense-dialog';
import { InvestmentDialog } from '../components/investment-dialog';
import { formatCurrency } from '@/shared/lib/utils';
import type { Investment } from '@/shared/types/common.types';

// ─── ROI Stat Card ────────────────────────────────────────────────────────────

function RoiCard() {
  const { data: roiRes, isLoading } = useRoi();
  const roi = roiRes?.data;
  const { isPrivate } = usePrivacy();

  const cards = [
    {
      label: 'Total Invested',
      shortLabel: 'Invested',
      value: roi ? `₹${formatCurrency(roi.totalInvested)}` : '—',
      icon: PiggyBank,
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      label: 'Net Profit (All-time)',
      shortLabel: 'Net Profit',
      value: roi ? `₹${formatCurrency(roi.totalNetProfit)}` : '—',
      icon: roi && roi.totalNetProfit >= 0 ? TrendingUp : TrendingDown,
      colorClass:
        roi && roi.totalNetProfit >= 0
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-600 dark:text-red-400',
      bgClass:
        roi && roi.totalNetProfit >= 0
          ? 'bg-emerald-50 dark:bg-emerald-950/50'
          : 'bg-red-50 dark:bg-red-950/50',
    },
    {
      label: 'Projected Annual ROI',
      shortLabel: 'Ann. ROI',
      value:
        roi?.roiPercent != null ? `${roi.roiPercent.toFixed(1)}%` : '—',
      icon: BarChart3,
      colorClass:
        roi && roi.roiPercent != null && roi.roiPercent >= 0
          ? 'text-violet-600 dark:text-violet-400'
          : 'text-red-600 dark:text-red-400',
      bgClass:
        roi && roi.roiPercent != null && roi.roiPercent >= 0
          ? 'bg-violet-50 dark:bg-violet-950/50'
          : 'bg-red-50 dark:bg-red-950/50',
    },
    {
      label: 'Payback Period',
      shortLabel: 'Payback',
      value:
        roi?.paybackMonths != null ? `${roi.paybackMonths} mo` : '—',
      icon: Clock,
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-3 lg:hidden">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-24 mb-1" />
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, shortLabel, value, icon: Icon, colorClass, bgClass }) => (
        <Card key={label} className="overflow-hidden transition-shadow hover:shadow-md">
          {/* Mobile */}
          <div className="p-3 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className={`rounded-lg p-2 shrink-0 ${bgClass}`}>
                <Icon className={`h-4 w-4 ${colorClass}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground leading-tight truncate">
                  {shortLabel}
                </p>
                <p className="text-base font-bold leading-tight tracking-tight truncate">
                  {isPrivate ? <span className="tracking-widest text-muted-foreground">••••</span> : value}
                </p>
              </div>
            </div>
          </div>
          {/* Desktop */}
          <div className="hidden lg:block">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <div className={`rounded-lg p-2 ${bgClass}`}>
                <Icon className={`h-4 w-4 ${colorClass}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight font-display">
                {isPrivate ? <span className="tracking-widest text-muted-foreground">••••</span> : value}
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Current Month Summary ────────────────────────────────────────────────────

const REVENUE_TARGET_KEY = 'brofit_revenue_target';

function CurrentMonthSummary() {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const defaultDate = now.toISOString().split('T')[0];

  const { data: summaryRes, isLoading } = useMonthlySummary(month);
  const summary = summaryRes?.data;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [revenueTarget, setRevenueTarget] = useState<number | null>(() => {
    const stored = localStorage.getItem(REVENUE_TARGET_KEY);
    return stored ? Number(stored) : null;
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const { isPrivate } = usePrivacy();

  const saveTarget = () => {
    const val = parseFloat(targetInput);
    if (!isNaN(val) && val > 0) {
      setRevenueTarget(val);
      localStorage.setItem(REVENUE_TARGET_KEY, String(val));
    }
    setEditingTarget(false);
  };

  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Card className="border-t-2 border-t-amber-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-amber-500" />
            {monthLabel}
          </CardTitle>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="grid gap-3 grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : summary ? (
          <div className="space-y-3">
            <div className="grid gap-3 grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Revenue</p>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center font-display">
                  {isPrivate ? <span className="tracking-widest text-muted-foreground">••••</span> : <><IndianRupee className="h-3.5 w-3.5 mr-0.5" />{formatCurrency(summary.revenue)}</>}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Expenses</p>
                <p className="text-base font-bold text-red-600 dark:text-red-400 inline-flex items-center font-display">
                  {isPrivate ? <span className="tracking-widest text-muted-foreground">••••</span> : <><IndianRupee className="h-3.5 w-3.5 mr-0.5" />{formatCurrency(summary.expenses)}</>}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Net Profit</p>
                <p
                  className={`text-base font-bold inline-flex items-center font-display ${
                    summary.netProfit >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isPrivate ? <span className="tracking-widest text-muted-foreground">••••</span> : (
                    <>
                      {summary.netProfit >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 mr-1" />
                      )}
                      <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
                      {formatCurrency(Math.abs(summary.netProfit))}
                    </>
                  )}
                </p>
              </div>
            </div>
            {/* Revenue target progress */}
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Target className="h-3.5 w-3.5" />
                  Monthly Target
                </div>
                {!editingTarget ? (
                  <button
                    onClick={() => { setTargetInput(revenueTarget ? String(revenueTarget) : ''); setEditingTarget(true); setTimeout(() => inputRef.current?.focus(), 0); }}
                    className="text-xs text-primary hover:underline"
                  >
                    {revenueTarget ? 'Edit' : 'Set target'}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      <IndianRupee className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <input
                        ref={inputRef}
                        type="number"
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveTarget(); if (e.key === 'Escape') setEditingTarget(false); }}
                        className="h-6 w-24 rounded border bg-background pl-5 pr-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="100000"
                      />
                    </div>
                    <button onClick={saveTarget} className="text-xs font-medium text-primary hover:underline">Save</button>
                    <button onClick={() => setEditingTarget(false)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                  </div>
                )}
              </div>
              {revenueTarget && summary && !isPrivate ? (
                <>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${summary.revenue >= revenueTarget ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min((summary.revenue / revenueTarget) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      <IndianRupee className="inline h-3 w-3" />{formatCurrency(summary.revenue)}
                      {' '}<span className="text-muted-foreground/60">of</span>{' '}
                      <IndianRupee className="inline h-3 w-3" />{formatCurrency(revenueTarget)}
                    </span>
                    <span className={`font-semibold tabular-nums ${summary.revenue >= revenueTarget ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {Math.round((summary.revenue / revenueTarget) * 100)}%
                    </span>
                  </div>
                </>
              ) : !revenueTarget ? (
                <p className="text-xs text-muted-foreground">Set a monthly revenue target to track progress.</p>
              ) : null}
            </div>

            <Link
              to={`/financials/month/${month}`}
              className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all expenses
              <ChevronRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>
        ) : null}
      </CardContent>

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultDate={defaultDate}
      />
    </Card>
  );
}

// ─── Monthly Expenses Grid ────────────────────────────────────────────────────

function MonthlyExpensesGrid() {
  const navigate = useNavigate();
  const { data: trendsRes, isLoading } = useTrends(12);
  const trends = trendsRes?.data ?? [];
  const { isPrivate } = usePrivacy();

  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-6 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <BarChart3 className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No expense data yet</p>
      </div>
    );
  }

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Exclude current month (shown in CurrentMonthSummary above), most recent first
  const sorted = [...trends]
    .reverse()
    .filter((t) => `${t.year}-${String(t.month).padStart(2, '0')}` !== currentMonthKey);

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {sorted.map((t) => {
        const monthKey = `${t.year}-${String(t.month).padStart(2, '0')}`;
        const monthLabel = new Date(t.year, t.month - 1, 1).toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        });
        const isProfit = t.netProfit >= 0;

        return (
          <button
            key={monthKey}
            type="button"
            onClick={() => navigate(`/financials/month/${monthKey}`)}
            className="text-left"
          >
            <Card className="transition-shadow hover:shadow-md cursor-pointer h-full">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2 truncate">{monthLabel}</p>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400 inline-flex items-center">
                  {isPrivate ? <span className="tracking-widest text-muted-foreground">••••</span> : <><IndianRupee className="h-3 w-3 mr-0.5" />{formatCurrency(t.expenses)}<span className="ml-1 text-xs font-normal text-muted-foreground">expenses</span></>}
                </p>
                <div className={`mt-1 text-xs font-medium inline-flex items-center ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isPrivate ? <span className="tracking-widest text-muted-foreground">••••</span> : <>{isProfit ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}<IndianRupee className="h-3 w-3 mr-0.5" />{formatCurrency(Math.abs(t.netProfit))} net</>}
                </div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <span>View expenses</span>
                  <ChevronRight className="h-3 w-3 ml-0.5" />
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

// ─── Investments Section ──────────────────────────────────────────────────────

function InvestmentsSection() {
  const { data: investmentsRes, isLoading } = useInvestments();
  const deleteInvestment = useDeleteInvestment();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isPrivate } = usePrivacy();
  const [editing, setEditing] = useState<Investment | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const investments = investmentsRes?.data ?? [];

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (investment: Investment) => {
    setEditing(investment);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Investments</CardTitle>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : investments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <PiggyBank className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No investments recorded</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Add Investment
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="font-medium">{inv.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {inv.notes || '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center">
                          {isPrivate ? <span className="tracking-widest text-muted-foreground">••••</span> : <><IndianRupee className="h-3 w-3" />{formatCurrency(inv.amount)}</>}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(inv)}
                            aria-label="Edit investment"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(inv.id)}
                            aria-label="Delete investment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y">
              {investments.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{inv.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-sm inline-flex items-center">
                      {isPrivate ? <span className="tracking-widest text-muted-foreground">••••</span> : <><IndianRupee className="h-3 w-3" />{formatCurrency(inv.amount)}</>}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(inv)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(inv.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      <InvestmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        investment={editing}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this investment record. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteInvestment.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteInvestment.isPending}
              onClick={() => {
                if (deleteTarget) {
                  deleteInvestment.mutate(deleteTarget, {
                    onSettled: () => setDeleteTarget(null),
                  });
                }
              }}
            >
              {deleteInvestment.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FinancialsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Financials"
        description="Track expenses, investments, and ROI"
      />

      {/* ROI Cards */}
      <RoiCard />

      {/* Current Month */}
      <CurrentMonthSummary />

      {/* Monthly Expenses Grid */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <Wallet className="h-4 w-4" />
          Past Months
        </h2>
      </div>
      <MonthlyExpensesGrid />

      {/* Investments */}
      <InvestmentsSection />
    </div>
  );
}

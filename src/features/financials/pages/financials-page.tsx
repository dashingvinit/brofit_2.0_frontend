import { useState } from 'react';
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
} from 'lucide-react';
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
  useExpenses,
  useInvestments,
  useMonthlySummary,
  useRoi,
  useTrends,
  useDeleteExpense,
  useDeleteInvestment,
} from '../hooks/use-financials';
import { ExpenseDialog } from '../components/expense-dialog';
import { InvestmentDialog } from '../components/investment-dialog';
import type { Expense, Investment, ExpenseCategory } from '@/shared/types/common.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  rent: 'Rent',
  utilities: 'Utilities',
  staff: 'Staff',
  equipment: 'Equipment',
  marketing: 'Marketing',
  maintenance: 'Maintenance',
  other: 'Other',
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  rent: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  utilities: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  staff: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  equipment: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  marketing: 'bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300',
  maintenance: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  other: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
};

function formatCurrency(value: number) {
  return value.toLocaleString('en-IN');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function currentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ─── ROI Stat Card ────────────────────────────────────────────────────────────

function RoiCard() {
  const { data: roiRes, isLoading } = useRoi();
  const roi = roiRes?.data;

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
      label: 'ROI',
      shortLabel: 'ROI',
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
                  {value}
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
              <div className="text-2xl font-bold tracking-tight">{value}</div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Monthly P&L Card ─────────────────────────────────────────────────────────

function MonthlySummaryCard({ month }: { month: string }) {
  const { data: summaryRes, isLoading } = useMonthlySummary(month);
  const summary = summaryRes?.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          Monthly P&amp;L
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : summary ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Revenue</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center">
                <IndianRupee className="h-3 w-3 mr-0.5" />
                {formatCurrency(summary.revenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Expenses</span>
              <span className="font-semibold text-red-600 dark:text-red-400 inline-flex items-center">
                <IndianRupee className="h-3 w-3 mr-0.5" />
                {formatCurrency(summary.expenses)}
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Net Profit</span>
              <span
                className={`font-bold inline-flex items-center ${
                  summary.netProfit >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                <IndianRupee className="h-3 w-3 mr-0.5" />
                {formatCurrency(summary.netProfit)}
              </span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ─── Trends Card ─────────────────────────────────────────────────────────────

function TrendsCard({
  selectedMonth,
  onMonthSelect,
}: {
  selectedMonth: string;
  onMonthSelect: (month: string) => void;
}) {
  const { data: trendsRes, isLoading } = useTrends(6);
  const trends = trendsRes?.data ?? [];

  const maxVal = Math.max(...trends.map((t) => Math.max(t.revenue, t.expenses)), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          6-Month Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-end gap-2 h-24">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                <Skeleton className="w-full" style={{ height: `${40 + i * 8}px` }} />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-end gap-1.5 h-28">
              {trends.map((t) => {
                const monthKey = `${t.year}-${String(t.month).padStart(2, '0')}`;
                const isSelected = monthKey === selectedMonth;
                const revH = Math.round((t.revenue / maxVal) * 100);
                const expH = Math.round((t.expenses / maxVal) * 100);
                const shortLabel = new Date(t.year, t.month - 1, 1).toLocaleString('default', { month: 'short' });
                const fullLabel = new Date(t.year, t.month - 1, 1).toLocaleString('default', { month: 'short', year: 'numeric' });
                return (
                  <button
                    key={monthKey}
                    type="button"
                    onClick={() => onMonthSelect(monthKey)}
                    className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                    title={`${fullLabel} — click to select`}
                  >
                    <div className="w-full flex items-end gap-0.5 h-24 justify-center">
                      <div
                        title={`Revenue: ₹${formatCurrency(t.revenue)}`}
                        className={`flex-1 rounded-t transition-all ${
                          isSelected
                            ? 'bg-emerald-600 dark:bg-emerald-500'
                            : 'bg-emerald-500/80 dark:bg-emerald-500/60'
                        }`}
                        style={{ height: `${revH}%` }}
                      />
                      <div
                        title={`Expenses: ₹${formatCurrency(t.expenses)}`}
                        className={`flex-1 rounded-t transition-all ${
                          isSelected
                            ? 'bg-red-500 dark:bg-red-400'
                            : 'bg-red-400/80 dark:bg-red-400/60'
                        }`}
                        style={{ height: `${expH}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'font-semibold text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500/80" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400/80" />
                Expenses
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Expenses Section ─────────────────────────────────────────────────────────

function ExpensesSection({ month }: { month: string }) {
  const { data: expensesRes, isLoading } = useExpenses(month);
  const deleteExpense = useDeleteExpense();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>(undefined);

  const expenses = expensesRes?.data ?? [];

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Expenses</CardTitle>
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
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <IndianRupee className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No expenses this month</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Add Expense
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
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[expense.category]}`}
                        >
                          {CATEGORY_LABELS[expense.category]}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {expense.description || '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center">
                          <IndianRupee className="h-3 w-3" />
                          {formatCurrency(expense.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(expense)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            disabled={deleteExpense.isPending}
                            onClick={() => deleteExpense.mutate(expense.id)}
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
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[expense.category]}`}
                      >
                        {CATEGORY_LABELS[expense.category]}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(expense.date)}</span>
                    </div>
                    {expense.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{expense.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-sm inline-flex items-center">
                      <IndianRupee className="h-3 w-3" />
                      {formatCurrency(expense.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(expense)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      disabled={deleteExpense.isPending}
                      onClick={() => deleteExpense.mutate(expense.id)}
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

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expense={editing}
      />
    </Card>
  );
}

// ─── Investments Section ──────────────────────────────────────────────────────

function InvestmentsSection() {
  const { data: investmentsRes, isLoading } = useInvestments();
  const deleteInvestment = useDeleteInvestment();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Investment | undefined>(undefined);

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
                        {formatDate(inv.date)}
                      </TableCell>
                      <TableCell className="font-medium">{inv.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {inv.notes || '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center">
                          <IndianRupee className="h-3 w-3" />
                          {formatCurrency(inv.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
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
                            disabled={deleteInvestment.isPending}
                            onClick={() => deleteInvestment.mutate(inv.id)}
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
                    <p className="text-xs text-muted-foreground">{formatDate(inv.date)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-sm inline-flex items-center">
                      <IndianRupee className="h-3 w-3" />
                      {formatCurrency(inv.amount)}
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
                      disabled={deleteInvestment.isPending}
                      onClick={() => deleteInvestment.mutate(inv.id)}
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
    </Card>
  );
}

// ─── Month Picker ─────────────────────────────────────────────────────────────

function MonthPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (month: string) => void;
}) {
  return (
    <input
      type="month"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FinancialsPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Financials"
        description="Track expenses, investments, and ROI"
      />

      {/* ROI Cards */}
      <RoiCard />

      {/* Month picker + Monthly P&L + Trend chart */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Monthly View</h2>
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MonthlySummaryCard month={selectedMonth} />
        <TrendsCard selectedMonth={selectedMonth} onMonthSelect={setSelectedMonth} />
      </div>

      {/* Expenses */}
      <ExpensesSection month={selectedMonth} />

      {/* Investments */}
      <InvestmentsSection />
    </div>
  );
}

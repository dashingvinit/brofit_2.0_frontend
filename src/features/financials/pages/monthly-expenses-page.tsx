import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
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
  useExpenses,
  useMonthlySummary,
  useDeleteExpense,
} from '../hooks/use-financials';
import { ExpenseDialog } from '../components/expense-dialog';
import { formatCurrency } from '@/shared/lib/utils';
import type { Expense, ExpenseCategory } from '@/shared/types/common.types';

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMonthLabel(monthStr: string) {
  const [year, month] = monthStr.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });
}

// ─── Summary Strip ─────────────────────────────────────────────────────────────

function MonthlySummaryStrip({ month }: { month: string }) {
  const { data: summaryRes, isLoading } = useMonthlySummary(month);
  const summary = summaryRes?.data;

  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid gap-3 grid-cols-3">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Revenue</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center">
            <IndianRupee className="h-4 w-4 mr-0.5" />
            {formatCurrency(summary.revenue)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Expenses</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400 inline-flex items-center">
            <IndianRupee className="h-4 w-4 mr-0.5" />
            {formatCurrency(summary.expenses)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Net Profit</p>
          <p
            className={`text-lg font-bold inline-flex items-center ${
              summary.netProfit >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {summary.netProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <IndianRupee className="h-4 w-4 mr-0.5" />
            {formatCurrency(Math.abs(summary.netProfit))}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Expenses Table ────────────────────────────────────────────────────────────

function ExpensesSection({ month }: { month: string }) {
  const { data: expensesRes, isLoading } = useExpenses(month);
  const deleteExpense = useDeleteExpense();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            Expenses
          </CardTitle>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
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
                            onClick={() => setDeleteTarget(expense.id)}
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
                      onClick={() => setDeleteTarget(expense.id)}
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this expense record. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteExpense.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteExpense.isPending}
              onClick={() => {
                if (deleteTarget) {
                  deleteExpense.mutate(deleteTarget, {
                    onSettled: () => setDeleteTarget(null),
                  });
                }
              }}
            >
              {deleteExpense.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function MonthlyExpensesPage() {
  const { month } = useParams<{ month: string }>();
  const navigate = useNavigate();

  if (!month) {
    navigate('/financials');
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => navigate('/financials')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <PageHeader
        title={formatMonthLabel(month)}
        description="Monthly P&L and expenses breakdown"
      />

      <MonthlySummaryStrip month={month} />
      <ExpensesSection month={month} />
    </div>
  );
}

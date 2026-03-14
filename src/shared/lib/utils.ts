import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Returns ISO date strings (YYYY-MM-DD) for the first and last day of the current month. */
export function getThisMonthDateRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { from, to };
}

/** Formats a number as an Indian locale currency string (e.g. 1,23,456). */
export function formatCurrency(value: number): string {
  return value.toLocaleString("en-IN");
}

/** Returns the number of whole days from now until the given ISO date string. Negative = past. */
export function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

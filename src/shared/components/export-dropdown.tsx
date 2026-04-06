import { useState } from 'react';
import { Download, FileText, FileOutput, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { toCsv, downloadCsv, downloadXls, printPdf } from '@/shared/lib/csv';
import type { ExportHeader } from '@/shared/lib/csv';
import { toast } from 'sonner';

export interface ExportDropdownProps {
  /** Human-readable title used in the PDF heading and toast messages */
  title: string;
  /** Base filename without extension, e.g. "members_2024-01-01" */
  filename: string;
  /** Column definitions */
  headers: ExportHeader[];
  /**
   * Async function that returns the rows to export.
   * Called fresh on each export click so data is always up-to-date.
   */
  getData: () => Promise<Record<string, unknown>[]> | Record<string, unknown>[];
  disabled?: boolean;
  size?: 'sm' | 'default';
}

export function ExportDropdown({
  title,
  filename,
  headers,
  getData,
  disabled = false,
  size = 'sm',
}: ExportDropdownProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function run(format: 'csv' | 'xlsx' | 'pdf') {
    setIsExporting(true);
    try {
      const rows = await getData();
      if (rows.length === 0) {
        toast.info('Nothing to export.');
        return;
      }

      if (format === 'csv') {
        const csv = toCsv(rows, headers);
        downloadCsv(csv, `${filename}.csv`);
      } else if (format === 'xlsx') {
        downloadXls(rows, headers, `${filename}.xls`);
      } else {
        printPdf(rows, headers, title);
      }

      if (format !== 'pdf') {
        toast.success(`Exported ${rows.length} record${rows.length !== 1 ? 's' : ''} as ${format.toUpperCase()}`);
      }
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} disabled={disabled || isExporting} title="Export">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">{isExporting ? 'Exporting…' : 'Export'}</span>
          <ChevronDown className="h-3.5 w-3.5 ml-1.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Download as
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => run('csv')} className="gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run('xlsx')} className="gap-2">
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          Excel (.xls)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run('pdf')} className="gap-2">
          <FileOutput className="h-4 w-4 text-muted-foreground" />
          PDF (Print)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

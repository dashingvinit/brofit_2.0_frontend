import { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { parseCsv, downloadCsv, toCsv } from '@/shared/lib/csv';

export interface ImportCsvDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Human-readable entity name, e.g. "members" or "plans" */
  entityName: string;
  /** Template column definitions shown in "Download Template" */
  templateHeaders: { key: string; label: string }[];
  /** Optional sample row for the template */
  templateSample?: Record<string, string>;
  /** Called with parsed rows when user confirms upload */
  onImport: (rows: Record<string, string>[]) => Promise<{ imported: number; errors: string[] }>;
}

type Step = 'select' | 'preview' | 'result';

export function ImportCsvDialog({
  open,
  onOpenChange,
  entityName,
  templateHeaders,
  templateSample,
  onImport,
}: ImportCsvDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('select');
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [parseError, setParseError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

  function handleClose() {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setStep('select');
      setFileName('');
      setRows([]);
      setParseError('');
      setResult(null);
    }, 200);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCsv(text);
      if (parsed.length === 0) {
        setParseError('The file appears to be empty or has only headers.');
        return;
      }
      setRows(parsed);
      setStep('preview');
    };
    reader.readAsText(file, 'UTF-8');

    // Reset input so same file can be re-selected
    e.target.value = '';
  }

  async function handleConfirmImport() {
    setIsImporting(true);
    try {
      const res = await onImport(rows);
      setResult(res);
      setStep('result');
    } finally {
      setIsImporting(false);
    }
  }

  function handleDownloadTemplate() {
    const sampleRow = templateSample ?? {};
    const csv = toCsv([sampleRow], templateHeaders);
    downloadCsv(csv, `${entityName.replace(/\s+/g, '_')}_template.csv`);
  }

  const previewHeaders = rows.length > 0 ? Object.keys(rows[0]) : [];
  const previewRows = rows.slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="capitalize">Import {entityName}</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-import {entityName}. Download the template to see the expected format.
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-4 py-2">
            {/* Template download */}
            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
              <div>
                <p className="text-sm font-medium">CSV Template</p>
                <p className="text-xs text-muted-foreground">
                  Download the template, fill in your data, then upload.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>

            {/* Drop zone */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors py-10 flex flex-col items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Click to select a CSV file</p>
                <p className="text-xs text-muted-foreground mt-1">Only .csv files are supported</p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />

            {parseError && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {parseError}
              </div>
            )}
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate font-medium text-foreground">{fileName}</span>
              <span>·</span>
              <span>{rows.length} row{rows.length !== 1 ? 's' : ''} detected</span>
            </div>

            {/* Preview table */}
            <div className="overflow-auto rounded-lg border max-h-56">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    {previewHeaders.map((h) => (
                      <th key={h} className="text-left py-2 px-3 font-medium text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {previewRows.map((row, i) => (
                    <tr key={i}>
                      {previewHeaders.map((h) => (
                        <td key={h} className="py-2 px-3 whitespace-nowrap">
                          {row[h] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 5 && (
              <p className="text-xs text-muted-foreground">
                Showing first 5 of {rows.length} rows.
              </p>
            )}
          </div>
        )}

        {step === 'result' && result && (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-3 rounded-lg border p-4 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  {result.imported} {entityName} imported successfully
                </p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {result.errors.length} row{result.errors.length !== 1 ? 's' : ''} skipped
                </div>
                <ul className="text-xs text-muted-foreground space-y-0.5 max-h-36 overflow-y-auto pl-6 list-disc">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'select' && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button onClick={handleConfirmImport} disabled={isImporting}>
                {isImporting ? 'Importing…' : `Import ${rows.length} row${rows.length !== 1 ? 's' : ''}`}
              </Button>
            </>
          )}
          {step === 'result' && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

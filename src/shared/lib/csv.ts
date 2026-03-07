/**
 * Lightweight export utilities — no external dependencies.
 */

export type ExportHeader = { key: string; label: string };

/** Convert an array of objects to a CSV string. */
export function toCsv(rows: Record<string, unknown>[], headers: ExportHeader[]): string {
  const headerRow = headers.map((h) => `"${h.label}"`).join(',');
  const dataRows = rows.map((row) =>
    headers
      .map((h) => {
        const val = row[h.key] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(','),
  );
  return [headerRow, ...dataRows].join('\r\n');
}

/** Trigger a browser download of a CSV string. */
export function downloadCsv(csv: string, filename: string): void {
  _downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

/**
 * Download as an Excel-compatible .xls file using an HTML table.
 * Opens natively in Excel, LibreOffice Calc, and Google Sheets.
 */
export function downloadXls(
  rows: Record<string, unknown>[],
  headers: ExportHeader[],
  filename: string,
): void {
  const esc = (v: unknown) =>
    String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const thead = headers.map((h) => `<th>${esc(h.label)}</th>`).join('');
  const tbody = rows
    .map(
      (row) =>
        `<tr>${headers.map((h) => `<td>${esc(row[h.key])}</td>`).join('')}</tr>`,
    )
    .join('');

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:x="urn:schemas-microsoft-com:office:excel"
xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>
<x:ExcelWorksheet><x:Name>Sheet1</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head><body><table>${thead.length ? `<thead><tr>${thead}</tr></thead>` : ''}<tbody>${tbody}</tbody></table></body></html>`;

  _downloadBlob(
    new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' }),
    filename,
  );
}

/**
 * Open a print-ready PDF view in a new tab.
 * The browser's native print dialog lets the user save as PDF.
 */
export function printPdf(
  rows: Record<string, unknown>[],
  headers: ExportHeader[],
  title: string,
): void {
  const esc = (v: unknown) =>
    String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const thead = headers.map((h) => `<th>${esc(h.label)}</th>`).join('');
  const tbody = rows
    .map(
      (row) =>
        `<tr>${headers.map((h) => `<td>${esc(row[h.key])}</td>`).join('')}</tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; font-size: 11px; color: #111; padding: 24px; }
  h1 { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
  p.meta { font-size: 10px; color: #666; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f4f4f5; font-weight: 600; text-align: left; padding: 6px 8px; border: 1px solid #e4e4e7; }
  td { padding: 5px 8px; border: 1px solid #e4e4e7; vertical-align: top; }
  tr:nth-child(even) td { background: #fafafa; }
  @media print {
    body { padding: 0; }
    @page { margin: 16mm; }
  }
</style>
</head><body>
<h1>${esc(title)}</h1>
<p class="meta">Exported ${new Date().toLocaleString('en-IN')} · ${rows.length} record${rows.length !== 1 ? 's' : ''}</p>
<table>
  <thead><tr>${thead}</tr></thead>
  <tbody>${tbody}</tbody>
</table>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;

  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

/** Internal: trigger a Blob download. */
function _downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Parse a CSV string into an array of row-objects keyed by header. */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h.trim()] = (values[i] ?? '').trim();
    });
    return row;
  });
}

/** Parse a single CSV line, respecting quoted fields. */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

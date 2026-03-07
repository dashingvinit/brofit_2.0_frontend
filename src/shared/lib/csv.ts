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

  const exportedAt = new Date().toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const html = `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 11.5px;
    color: #1a1a1a;
    background: #fff;
    padding: 40px 48px;
  }

  /* ── Header ── */
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding-bottom: 16px;
    margin-bottom: 24px;
    border-bottom: 2px solid #18181b;
  }
  .header-left h1 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: #18181b;
    margin-bottom: 4px;
  }
  .header-left .subtitle {
    font-size: 11px;
    color: #71717a;
  }
  .header-right {
    text-align: right;
    font-size: 11px;
    color: #71717a;
    line-height: 1.6;
  }
  .header-right strong {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #3f3f46;
    margin-bottom: 2px;
  }

  /* ── Table ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 4px;
  }
  thead tr {
    background: #18181b;
  }
  th {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #fff;
    text-align: left;
    padding: 9px 12px;
  }
  td {
    padding: 8px 12px;
    border-bottom: 1px solid #e4e4e7;
    vertical-align: top;
    color: #27272a;
    line-height: 1.45;
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody tr:nth-child(even) td {
    background: #f9f9fb;
  }
  tbody tr:hover td {
    background: #f4f4f5;
  }

  /* ── Footer ── */
  .footer {
    margin-top: 28px;
    padding-top: 12px;
    border-top: 1px solid #e4e4e7;
    font-size: 10px;
    color: #a1a1aa;
    display: flex;
    justify-content: space-between;
  }

  /* ── Print overrides ── */
  @page { margin: 12mm; }
  @media print {
    /* Keep the same body padding so content never touches the paper edge */
    body { padding: 24px 28px; background: #fff; }
    thead { display: table-header-group; }
    /* Footer flows naturally at end of content — no fixed positioning */
    .footer { position: static; margin-top: 20px; }
    tbody tr:hover td { background: inherit; }
  }
</style>
</head><body>

<div class="header">
  <div class="header-left">
    <h1>${esc(title)}</h1>
    <span class="subtitle">${rows.length} record${rows.length !== 1 ? 's' : ''}</span>
  </div>
  <div class="header-right">
    <strong>Exported on</strong>
    ${esc(exportedAt)}
  </div>
</div>

<table>
  <thead><tr>${thead}</tr></thead>
  <tbody>${tbody}</tbody>
</table>

<div class="footer">
  <span>${esc(title)}</span>
  <span>Exported ${esc(exportedAt)}</span>
</div>

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

import { Row } from '@tanstack/react-table';

export type ExportFormat = 'csv' | 'json' | 'excel';

interface ExportOptions<T> {
  filename?: string;
  rows: Row<T>[];
  format: ExportFormat;
}

// Convert rows to CSV format
function rowsToCSV<T>(rows: Row<T>[]): string {
  if (rows.length === 0) return '';

  const firstRow = rows[0];
  const headers = firstRow.getVisibleCells().map((cell) => {
    const header = cell.column.columnDef.header;
    if (typeof header === 'string') return header;
    return cell.column.id;
  });

  const csvRows = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .getVisibleCells()
        .map((cell) => {
          const value = cell.getValue();
          const stringValue = value === null || value === undefined ? '' : String(value);
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(','),
    ),
  ];

  return csvRows.join('\n');
}

// Convert rows to JSON format
function rowsToJSON<T>(rows: Row<T>[]): string {
  const data = rows.map((row) => row.original);
  return JSON.stringify(data, null, 2);
}

// Convert rows to Excel-compatible HTML format
function rowsToExcel<T>(rows: Row<T>[]): string {
  if (rows.length === 0) return '';

  const firstRow = rows[0];
  const headers = firstRow.getVisibleCells().map((cell) => {
    const header = cell.column.columnDef.header;
    if (typeof header === 'string') return header;
    return cell.column.id;
  });

  const headerRow = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;
  const dataRows = rows
    .map(
      (row) =>
        `<tr>${row
          .getVisibleCells()
          .map((cell) => {
            const value = cell.getValue();
            const stringValue = value === null || value === undefined ? '' : String(value);
            return `<td>${stringValue}</td>`;
          })
          .join('')}</tr>`,
    )
    .join('');

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
      <x:Name>Sheet1</x:Name>
      <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
      </x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    </head>
    <body>
      <table>${headerRow}${dataRows}</table>
    </body>
    </html>
  `;
}

// Download file helper
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Main export function
export function exportTableData<T>({ filename = 'table-export', rows, format }: ExportOptions<T>): void {
  let content: string;
  let mimeType: string;
  let extension: string;

  switch (format) {
    case 'csv':
      content = rowsToCSV(rows);
      mimeType = 'text/csv;charset=utf-8;';
      extension = 'csv';
      break;
    case 'json':
      content = rowsToJSON(rows);
      mimeType = 'application/json;charset=utf-8;';
      extension = 'json';
      break;
    case 'excel':
      content = rowsToExcel(rows);
      mimeType = 'application/vnd.ms-excel';
      extension = 'xls';
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  downloadFile(content, `${filename}.${extension}`, mimeType);
}

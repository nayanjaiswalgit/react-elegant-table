import { Row, Cell } from '@tanstack/react-table';

/**
 * Copy a single cell value to clipboard
 */
export async function copyCellToClipboard<T>(cell: Cell<T, unknown>): Promise<boolean> {
  try {
    const value = cell.getValue();
    const text = value === null || value === undefined ? '' : String(value);
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy cell to clipboard:', error);
    return false;
  }
}

/**
 * Copy a row to clipboard as tab-separated values
 */
export async function copyRowToClipboard<T>(row: Row<T>): Promise<boolean> {
  try {
    const values = row.getVisibleCells().map((cell) => {
      const value = cell.getValue();
      return value === null || value === undefined ? '' : String(value);
    });
    const text = values.join('\t');
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy row to clipboard:', error);
    return false;
  }
}

/**
 * Copy multiple rows to clipboard as tab-separated values with newlines
 */
export async function copyRowsToClipboard<T>(rows: Row<T>[]): Promise<boolean> {
  try {
    const lines = rows.map((row) => {
      const values = row.getVisibleCells().map((cell) => {
        const value = cell.getValue();
        return value === null || value === undefined ? '' : String(value);
      });
      return values.join('\t');
    });
    const text = lines.join('\n');
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy rows to clipboard:', error);
    return false;
  }
}

/**
 * Copy table data with headers to clipboard
 */
export async function copyTableToClipboard<T>(rows: Row<T>[], includeHeaders = true): Promise<boolean> {
  try {
    const lines: string[] = [];

    if (includeHeaders && rows.length > 0) {
      const headers = rows[0].getVisibleCells().map((cell) => {
        const header = cell.column.columnDef.header;
        return typeof header === 'string' ? header : cell.column.id;
      });
      lines.push(headers.join('\t'));
    }

    rows.forEach((row) => {
      const values = row.getVisibleCells().map((cell) => {
        const value = cell.getValue();
        return value === null || value === undefined ? '' : String(value);
      });
      lines.push(values.join('\t'));
    });

    const text = lines.join('\n');
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy table to clipboard:', error);
    return false;
  }
}

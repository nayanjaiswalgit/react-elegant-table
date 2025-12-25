import { Row } from '@tanstack/react-table';

export type AggregationFn = 'sum' | 'avg' | 'count' | 'min' | 'max';

/**
 * Calculate sum of values in a column
 */
export function sum<T>(rows: Row<T>[], columnId: string): number {
  return rows.reduce((total, row) => {
    const value = row.getValue(columnId);
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
}

/**
 * Calculate average of values in a column
 */
export function avg<T>(rows: Row<T>[], columnId: string): number {
  const total = sum(rows, columnId);
  return rows.length > 0 ? total / rows.length : 0;
}

/**
 * Count non-empty values in a column
 */
export function count<T>(rows: Row<T>[], columnId: string): number {
  return rows.filter((row) => {
    const value = row.getValue(columnId);
    return value !== null && value !== undefined && value !== '';
  }).length;
}

/**
 * Find minimum value in a column
 */
export function min<T>(rows: Row<T>[], columnId: string): number | null {
  const values = rows
    .map((row) => row.getValue(columnId))
    .filter((value): value is number => typeof value === 'number');

  return values.length > 0 ? Math.min(...values) : null;
}

/**
 * Find maximum value in a column
 */
export function max<T>(rows: Row<T>[], columnId: string): number | null {
  const values = rows
    .map((row) => row.getValue(columnId))
    .filter((value): value is number => typeof value === 'number');

  return values.length > 0 ? Math.max(...values) : null;
}

/**
 * Create a footer aggregation function
 */
export function createAggregation<T>(
  type: AggregationFn,
  options?: {
    prefix?: string;
    suffix?: string;
    decimals?: number;
  },
) {
  return (props: { table: { getFilteredRowModel: () => { rows: Row<T>[] } }; column: { id: string } }) => {
    const { table, column } = props;
    const rows = table.getFilteredRowModel().rows;
    let value: number | null = 0;

    switch (type) {
      case 'sum':
        value = sum(rows, column.id);
        break;
      case 'avg':
        value = avg(rows, column.id);
        break;
      case 'count':
        value = count(rows, column.id);
        break;
      case 'min':
        value = min(rows, column.id);
        break;
      case 'max':
        value = max(rows, column.id);
        break;
    }

    if (value === null) return '';

    const formatted =
      options?.decimals !== undefined
        ? value.toFixed(options.decimals)
        : value.toString();

    return `${options?.prefix || ''}${formatted}${options?.suffix || ''}`;
  };
}

import { Row } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';

interface MobileCardProps<T> {
  row: Row<T>;
  onRowClick?: (row: T) => void;
}

export function MobileCard<T>({ row, onRowClick }: MobileCardProps<T>) {
  return (
    <div
      onClick={() => onRowClick?.(row.original)}
      className={`p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${
        onRowClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600' : ''
      } transition-all`}
    >
      {row.getVisibleCells().map((cell) => {
        if (cell.column.id === 'select') return null;

        const header = cell.column.columnDef.header;
        const headerText = typeof header === 'string' ? header : cell.column.id;

        return (
          <div key={cell.id} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              {headerText}
            </span>
            <span className="text-sm text-gray-900 dark:text-gray-100 text-right ml-4">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </span>
          </div>
        );
      })}
    </div>
  );
}

import type { Row } from '@tanstack/react-table';

interface ExpandedRowProps<T> {
  row: Row<T>;
  renderExpandedContent: (row: T) => React.ReactNode;
  colSpan: number;
}

export function ExpandedRow<T>({ row, renderExpandedContent, colSpan }: ExpandedRowProps<T>) {
  if (!row.getIsExpanded()) {
    return null;
  }

  return (
    <tr className="bg-gray-50 dark:bg-gray-800/50">
      <td colSpan={colSpan} className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        {renderExpandedContent(row.original)}
      </td>
    </tr>
  );
}

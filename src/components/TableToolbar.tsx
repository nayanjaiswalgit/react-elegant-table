import type React from 'react';
import type { Table, Row } from '@tanstack/react-table';
import { HStack } from '../ui/Layout';
import { ColumnVisibilityMenu } from './ColumnVisibilityMenu';
import { ExportMenu } from './ExportMenu';

interface TableToolbarProps<T> {
  table: Table<T>;
  toolbar?: React.ReactNode;
  enableExport?: boolean;
  allRows: Row<T>[];
  selectedRows: Row<T>[];
  hasSelection: boolean;
}

export function TableToolbar<T>({
  table,
  toolbar,
  enableExport = true,
  allRows,
  selectedRows,
  hasSelection,
}: TableToolbarProps<T>) {
  return (
    <div className="sticky top-0 z-20 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-900">
      <HStack className="justify-between">
        <HStack gap={3} className="w-full">
          {toolbar}
        </HStack>
        <HStack gap={2}>
          {enableExport && (
            <ExportMenu
              allRows={allRows}
              selectedRows={selectedRows}
              hasSelection={hasSelection}
            />
          )}
          <ColumnVisibilityMenu table={table} />
        </HStack>
      </HStack>
    </div>
  );
}

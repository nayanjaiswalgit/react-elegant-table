import { useEffect, useCallback, useState } from 'react';
import { Table } from '@tanstack/react-table';

interface UseKeyboardNavigationOptions {
  enabled?: boolean;
  onCellFocus?: (rowIndex: number, columnIndex: number) => void;
}

export function useKeyboardNavigation<T>(
  table: Table<T>,
  { enabled = false, onCellFocus }: UseKeyboardNavigationOptions = {},
) {
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; columnIndex: number } | null>(
    null,
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || !focusedCell) return;

      const rows = table.getRowModel().rows;
      const columns = table.getVisibleLeafColumns();

      let { rowIndex, columnIndex } = focusedCell;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (rowIndex > 0) rowIndex--;
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (rowIndex < rows.length - 1) rowIndex++;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (columnIndex > 0) columnIndex--;
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (columnIndex < columns.length - 1) columnIndex++;
          break;
        case 'Home':
          e.preventDefault();
          if (e.ctrlKey) {
            rowIndex = 0;
            columnIndex = 0;
          } else {
            columnIndex = 0;
          }
          break;
        case 'End':
          e.preventDefault();
          if (e.ctrlKey) {
            rowIndex = rows.length - 1;
            columnIndex = columns.length - 1;
          } else {
            columnIndex = columns.length - 1;
          }
          break;
        case 'PageUp':
          e.preventDefault();
          rowIndex = Math.max(0, rowIndex - 10);
          break;
        case 'PageDown':
          e.preventDefault();
          rowIndex = Math.min(rows.length - 1, rowIndex + 10);
          break;
        default:
          return;
      }

      setFocusedCell({ rowIndex, columnIndex });
      onCellFocus?.(rowIndex, columnIndex);
    },
    [enabled, focusedCell, table, onCellFocus],
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return {
    focusedCell,
    setFocusedCell,
  };
}

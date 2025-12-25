import { useState, useCallback, useEffect } from 'react';
import { ColumnOrderState } from '@tanstack/react-table';

interface UseColumnOrderingOptions {
  initialColumnOrder?: ColumnOrderState;
  onColumnOrderChange?: (order: ColumnOrderState) => void;
}

export function useColumnOrdering({ initialColumnOrder, onColumnOrderChange }: UseColumnOrderingOptions) {
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialColumnOrder || []);

  useEffect(() => {
    if (initialColumnOrder) {
      setColumnOrder(initialColumnOrder);
    }
  }, [initialColumnOrder]);

  const onColumnOrderChangeInternal = useCallback(
    (updater: ColumnOrderState | ((old: ColumnOrderState) => ColumnOrderState)) => {
      setColumnOrder((old) => {
        const newOrder = typeof updater === 'function' ? updater(old) : updater;
        onColumnOrderChange?.(newOrder);
        return newOrder;
      });
    },
    [onColumnOrderChange],
  );

  return {
    columnOrder,
    onColumnOrderChange: onColumnOrderChangeInternal,
  };
}

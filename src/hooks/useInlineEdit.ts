import { useState, useCallback } from 'react';

interface EditingCell {
  rowId: string;
  columnId: string;
}

interface UseInlineEditOptions<T> {
  onCellEdit?: (rowId: string, columnId: string, oldValue: unknown, newValue: unknown, rowData: T) => void;
}

export function useInlineEdit<T>({ onCellEdit }: UseInlineEditOptions<T> = {}) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  const startEditing = useCallback((rowId: string, columnId: string) => {
    setEditingCell({ rowId, columnId });
  }, []);

  const stopEditing = useCallback(() => {
    setEditingCell(null);
  }, []);

  const isEditing = useCallback(
    (rowId: string, columnId: string) => {
      return editingCell?.rowId === rowId && editingCell?.columnId === columnId;
    },
    [editingCell],
  );

  const handleCellEdit = useCallback(
    (rowId: string, columnId: string, oldValue: unknown, newValue: unknown, rowData: T) => {
      onCellEdit?.(rowId, columnId, oldValue, newValue, rowData);
      stopEditing();
    },
    [onCellEdit, stopEditing],
  );

  return {
    editingCell,
    startEditing,
    stopEditing,
    isEditing,
    handleCellEdit,
  };
}

import { memo } from 'react';
import type { Row as TanStackRow, Cell } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { MoreHorizontal, ChevronRight, ChevronDown } from 'lucide-react';
import { HStack } from '../ui/Layout';
import type React from 'react';
import { EditableCell, CellEditType } from './EditableCell';

interface TableRowProps<T> {
  row: TanStackRow<T>;
  rowHeight: number;
  hoveredRowId: string | null;
  hasRowActions: boolean;
  onRowClick?: (row: TanStackRow<T>, e: React.MouseEvent) => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
  onPointerCancel?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMenuToggle?: (rowId: string, button: HTMLButtonElement | null) => void;
  menuButtonRef?: (el: HTMLButtonElement | null, rowId: string) => void;
  enableInlineEdit?: boolean;
  isEditingCell?: (rowId: string, columnId: string) => boolean;
  onCellDoubleClick?: (rowId: string, columnId: string) => void;
  onCellEditSave?: (cell: Cell<T, unknown>, newValue: unknown) => void;
  onCellEditCancel?: () => void;
  getCellEditType?: (columnId: string) => CellEditType;
  getCellEditOptions?: (columnId: string) => Array<{ value: unknown; label: string }>;
  enableRowExpansion?: boolean;
  showExpandButton?: boolean;
}

function TableRowComponent<T>({
  row,
  rowHeight,
  hoveredRowId,
  hasRowActions,
  onRowClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onMouseEnter,
  onMouseLeave,
  onMenuToggle,
  menuButtonRef,
  enableInlineEdit = false,
  isEditingCell,
  onCellDoubleClick,
  onCellEditSave,
  onCellEditCancel,
  getCellEditType,
  getCellEditOptions,
  enableRowExpansion = false,
  showExpandButton = true,
}: TableRowProps<T>) {
  const isHovered = hoveredRowId === row.id && !row.getIsSelected();
  const isSelected = row.getIsSelected();
  const isExpanded = row.getIsExpanded();

  const handleCellDoubleClick = (cell: Cell<T, unknown>, e: React.MouseEvent) => {
    if (enableInlineEdit && cell.column.id !== 'select') {
      e.stopPropagation();
      onCellDoubleClick?.(row.id, cell.column.id);
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    row.toggleExpanded();
  };

  return (
    <tr
      onClick={(e) => onRowClick?.(row, e)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ height: `${rowHeight}px`, contain: 'layout' }}
      className={`group border-b border-gray-100 dark:border-gray-800 transition-colors ${
        onRowClick ? 'cursor-pointer' : ''
      } ${isHovered ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''} ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      {row.getVisibleCells().map((cell, cellIndex) => {
        const isEditing = isEditingCell?.(row.id, cell.column.id) ?? false;
        const canEdit = enableInlineEdit && cell.column.id !== 'select';
        const isFirstDataCell = cellIndex === (row.getVisibleCells()[0]?.column.id === 'select' ? 1 : 0);
        const shouldShowExpandButton = enableRowExpansion && showExpandButton && isFirstDataCell && !isEditing;

        return (
          <td
            key={cell.id}
            className="border-r border-gray-100 dark:border-gray-800 last:border-r-0"
            style={{ width: `${cell.column.getSize()}px` }}
            onDoubleClick={(e) => handleCellDoubleClick(cell, e)}
          >
            <div
              className={`${
                cell.column.id === 'select' ? '' : 'px-3 py-2'
              } overflow-hidden text-ellipsis whitespace-nowrap ${
                canEdit && !isEditing ? 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-text' : ''
              } ${shouldShowExpandButton ? 'flex items-center gap-2' : ''}`}
            >
              {shouldShowExpandButton && (
                <button
                  onClick={handleExpandClick}
                  className="flex-shrink-0 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              )}
              <div className={shouldShowExpandButton ? 'flex-1 min-w-0' : ''}>
                {isEditing ? (
                  <EditableCell
                    value={cell.getValue()}
                    onSave={(newValue) => onCellEditSave?.(cell, newValue)}
                    onCancel={() => onCellEditCancel?.()}
                    type={getCellEditType?.(cell.column.id) ?? 'text'}
                    options={getCellEditOptions?.(cell.column.id) ?? []}
                  />
                ) : (
                  flexRender(cell.column.columnDef.cell, cell.getContext())
                )}
              </div>
            </div>
          </td>
        );
      })}
      {hasRowActions && (
        <td className="w-12">
          <HStack className="justify-center h-8">
            <button
              ref={(el) => menuButtonRef?.(el, row.id)}
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle?.(row.id, null);
              }}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Row actions menu"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400 rotate-90" />
            </button>
          </HStack>
        </td>
      )}
    </tr>
  );
}

export const TableRow = memo(TableRowComponent) as typeof TableRowComponent;

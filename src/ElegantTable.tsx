import { useState, useMemo, useCallback, Fragment } from 'react';
import type React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  ExpandedState,
  ColumnPinningState,
  flexRender,
  type OnChangeFn,
  type Row,
} from '@tanstack/react-table';
import { ColumnHeader } from './components/ColumnHeader';
import { checkboxClassName } from './ui/Checkbox';
import { HStack } from './ui/Layout';
import { TableToolbar } from './components/TableToolbar';
import { SelectionBanner } from './components/SelectionBanner';
import { TableRow } from './components/TableRow';
import { LoadingRow } from './components/LoadingRow';
import { ActionMenu } from './components/ActionMenu';
import { ExpandedRow } from './components/ExpandedRow';
import {
  useTableVirtualization,
  useRowSelection,
  useSelectionMode,
  useActionMenu,
  useColumnSizing,
} from './hooks';
import { useColumnOrdering } from './hooks/useColumnOrdering';
import { useInlineEdit } from './hooks/useInlineEdit';
import { CellEditType } from './components/EditableCell';
import { BulkAction } from './components/BulkActionsMenu';
import { GlobalSearch } from './components/GlobalSearch';

interface ElegantTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  onRowClick?: (row: T) => void;
  onRowAction?: (action: string, row: T) => void;
  enableRowSelection?: boolean;
  onSelectionChange?: (state: RowSelectionState) => void;
  rowSelection?: RowSelectionState;
  rowActions?: Array<{ label: string; action: string; icon?: React.ReactNode }>;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  showLoadOlder?: boolean;
  onLoadOlder?: () => void;
  initialColumnSizing?: Record<string, number>;
  onColumnSizingChange?: (sizing: Record<string, number>) => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  // Performance: enable simple row virtualization/windowing
  virtualize?: boolean;
  estimatedRowHeight?: number; // px
  // Performance: debounce selection change notifications to parent
  selectionChangeDebounceMs?: number;
  // Loading state
  isLoading?: boolean;
  loadingRowCount?: number;
  // Export
  enableExport?: boolean;
  // Column Reordering
  enableColumnReordering?: boolean;
  initialColumnOrder?: string[];
  onColumnOrderChange?: (order: string[]) => void;
  // Inline Editing
  enableInlineEdit?: boolean;
  onCellEdit?: (rowId: string, columnId: string, oldValue: unknown, newValue: unknown, rowData: T) => void;
  getCellEditType?: (columnId: string) => CellEditType;
  getCellEditOptions?: (columnId: string) => Array<{ value: unknown; label: string }>;
  // Row Expansion
  enableRowExpansion?: boolean;
  renderExpandedContent?: (row: T) => React.ReactNode;
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;
  // Column Pinning
  enableColumnPinning?: boolean;
  columnPinning?: ColumnPinningState;
  onColumnPinningChange?: OnChangeFn<ColumnPinningState>;
  // Bulk Actions
  bulkActions?: BulkAction[];
  onBulkAction?: (action: string, selectedRows: Row<T>[]) => void;
  // Global Search
  enableGlobalSearch?: boolean;
  globalSearchPlaceholder?: string;
  // Column Filtering
  enableColumnFiltering?: boolean;
  // Footer
  enableFooter?: boolean;
}

export function ElegantTable<T>({
  data,
  columns: columnDefs,
  onRowClick,
  onRowAction,
  enableRowSelection = false,
  onSelectionChange,
  rowSelection = {},
  rowActions = [],
  toolbar,
  emptyMessage = 'No data available',
  showLoadOlder = false,
  onLoadOlder,
  initialColumnSizing,
  onColumnSizingChange,
  virtualize = false,
  estimatedRowHeight = 44,
  selectionChangeDebounceMs = 0,
  sorting,
  onSortingChange,
  manualSorting,
  isLoading = false,
  loadingRowCount = 5,
  enableExport = true,
  enableColumnReordering = false,
  initialColumnOrder,
  onColumnOrderChange,
  enableInlineEdit = false,
  onCellEdit,
  getCellEditType,
  getCellEditOptions,
  enableRowExpansion = false,
  renderExpandedContent,
  expanded,
  onExpandedChange,
  enableColumnPinning = false,
  columnPinning,
  onColumnPinningChange,
  bulkActions = [],
  onBulkAction,
  enableGlobalSearch = false,
  globalSearchPlaceholder,
  enableColumnFiltering = false,
  enableFooter = false,
}: ElegantTableProps<T>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [internalExpanded, setInternalExpanded] = useState<ExpandedState>({});
  const [internalColumnPinning, setInternalColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  });
  const [globalFilter, setGlobalFilter] = useState('');

  // Custom hooks for cleaner state management
  const { columnSizing, onColumnSizingChange: handleColumnSizingChange } = useColumnSizing(
    initialColumnSizing,
    onColumnSizingChange,
  );

  const { columnOrder, onColumnOrderChange: handleColumnOrderChange } = useColumnOrdering({
    initialColumnOrder,
    onColumnOrderChange,
  });

  const { isEditing, startEditing, stopEditing, handleCellEdit } = useInlineEdit<T>({
    onCellEdit,
  });

  const {
    rowSelection: currentRowSelection,
    onRowSelectionChange,
    hasSelection,
  } = useRowSelection({
    enabled: enableRowSelection,
    initialSelection: rowSelection,
    onSelectionChange,
    debounceMs: selectionChangeDebounceMs,
  });

  const { isSelectionModeActive, longPressTriggered, startLongPress, endLongPress } =
    useSelectionMode<T>(
      hasSelection,
      enableRowSelection,
      useCallback((visible: boolean) => {
        // Avoid unnecessary state updates if visibility hasn't changed
        setColumnVisibility((prev) => {
          const current = (prev as Record<string, unknown>).select as boolean | undefined;
          if (current === visible) return prev;
          return { ...prev, select: visible } as VisibilityState;
        });
      }, []),
    );

  const { menuState, menuButtonRefs, menuContainerRef, toggleMenu, closeMenu } = useActionMenu();

  // Selection column with checkbox
  const columns = useMemo(() => {
    if (!enableRowSelection) return columnDefs;

    return [
      {
        id: 'select',
        header: ({ table }) => (
          <HStack className="justify-center px-3 py-1 h-8">
            <input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className={checkboxClassName}
              aria-label="Select all rows"
              title="Select all"
            />
          </HStack>
        ),
        cell: ({ row }) => (
          <HStack className="justify-center px-3 py-1 h-8">
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              onClick={(e) => e.stopPropagation()}
              className={checkboxClassName}
            />
          </HStack>
        ),
        size: 50,
      },
      ...columnDefs,
    ] as ColumnDef<T, unknown>[];
  }, [columnDefs, enableRowSelection]);

  // Initialize table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: currentRowSelection,
      columnSizing,
      columnOrder,
      expanded: expanded ?? internalExpanded,
      columnPinning: columnPinning ?? internalColumnPinning,
      globalFilter,
    },
    onSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    manualSorting,
    onRowSelectionChange,
    onColumnSizingChange: handleColumnSizingChange,
    onColumnOrderChange: handleColumnOrderChange,
    onExpandedChange: onExpandedChange ?? setInternalExpanded,
    onColumnPinningChange: onColumnPinningChange ?? setInternalColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableRowSelection,
    enableColumnPinning,
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 100,
      maxSize: 1000,
      size: 150,
    },
  });

  const allRows = useMemo(() => table.getRowModel().rows, [table]);

  // Virtualization
  const { startIndex, endIndex, paddingTop, paddingBottom, containerRef } = useTableVirtualization(
    allRows.length,
    {
      enabled: virtualize,
      rowHeight: estimatedRowHeight,
    },
  );

  // Row click handler
  const handleRowClick = useCallback(
    (row: Row<T>, e: React.MouseEvent) => {
      if (longPressTriggered.current) {
        longPressTriggered.current = false;
        return;
      }
      const active = isSelectionModeActive || e.ctrlKey || e.metaKey;
      if (enableRowSelection && active) {
        e.preventDefault();
        row.toggleSelected();
      } else {
        onRowClick?.(row.original);
      }
    },
    [enableRowSelection, onRowClick, isSelectionModeActive, longPressTriggered],
  );

  // Menu action handler
  const handleMenuAction = useCallback(
    (action: string) => {
      const row = allRows.find((r) => r.id === menuState.openRowId);
      if (row) {
        onRowAction?.(action, row.original);
      }
      closeMenu();
    },
    [onRowAction, allRows, menuState.openRowId, closeMenu],
  );

  const selectedRows = useMemo(
    () => allRows.filter((row) => currentRowSelection[row.id]),
    [allRows, currentRowSelection],
  );

  // Column reordering handlers
  const handleColumnDragStart = useCallback((columnId: string) => {
    setDraggedColumn(columnId);
  }, []);

  const handleColumnDragOver = useCallback((columnId: string) => {
    setDragOverColumn(columnId);
  }, []);

  const handleColumnDrop = useCallback(
    (targetColumnId: string) => {
      if (!draggedColumn || draggedColumn === targetColumnId) {
        setDraggedColumn(null);
        setDragOverColumn(null);
        return;
      }

      const currentOrder = table.getAllLeafColumns().map((col) => col.id);
      const draggedIndex = currentOrder.indexOf(draggedColumn);
      const targetIndex = currentOrder.indexOf(targetColumnId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newOrder = [...currentOrder];
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedColumn);
        handleColumnOrderChange(newOrder);
      }

      setDraggedColumn(null);
      setDragOverColumn(null);
    },
    [draggedColumn, table, handleColumnOrderChange],
  );

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Toolbar */}
      <TableToolbar
        table={table}
        toolbar={
          <>
            {enableGlobalSearch && (
              <GlobalSearch
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder={globalSearchPlaceholder}
              />
            )}
            {toolbar}
          </>
        }
        enableExport={enableExport}
        allRows={allRows}
        selectedRows={selectedRows}
        hasSelection={hasSelection}
        bulkActions={bulkActions}
        onBulkAction={onBulkAction}
      />

      {/* Selection Banner */}
      <SelectionBanner
        selectedCount={Object.keys(currentRowSelection).length}
        totalCount={allRows.length}
      />

      {/* Table Container */}
      <div ref={containerRef} className="flex-1 overflow-auto min-h-0">
        <table
          className="w-full min-w-max border-separate border-spacing-0"
          style={{
            tableLayout: 'fixed',
            width: `${table.getTotalSize()}px`,
          }}
        >
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
                {headerGroup.headers.map((header) => {
                  const isPinned = header.column.getIsPinned();
                  return (
                    <th
                      key={header.id}
                      style={{
                        width: `${header.getSize()}px`,
                        position: isPinned ? 'sticky' : 'relative',
                        left: isPinned === 'left' ? `${header.getStart('left')}px` : undefined,
                        right: isPinned === 'right' ? `${header.getAfter('right')}px` : undefined,
                        zIndex: isPinned ? 11 : undefined,
                      }}
                      className={`border-r border-gray-100 dark:border-gray-800 last:border-r-0 ${
                        isPinned ? 'bg-gray-50 dark:bg-gray-800' : ''
                      }`}
                    >
                    {header.isPlaceholder ? null : (
                      <ColumnHeader
                        header={header}
                        enableColumnReordering={enableColumnReordering}
                        onColumnDragStart={handleColumnDragStart}
                        onColumnDragOver={handleColumnDragOver}
                        onColumnDrop={handleColumnDrop}
                        isDragging={draggedColumn === header.column.id}
                        isDragOver={dragOverColumn === header.column.id}
                        enableColumnPinning={enableColumnPinning}
                        enableColumnFiltering={enableColumnFiltering}
                      />
                    )}
                    </th>
                  );
                })}
                {rowActions.length > 0 && <th className="w-12 bg-gray-50 dark:bg-gray-800" />}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: loadingRowCount }).map((_, i) => (
                <LoadingRow
                  key={`skeleton-${i}`}
                  index={i}
                  columnCount={columns.length}
                  hasRowActions={rowActions.length > 0}
                  rowHeight={estimatedRowHeight}
                />
              ))
            ) : allRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rowActions.length > 0 ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              <>
                {/* Top padding for virtualization */}
                {virtualize && paddingTop > 0 && (
                  <tr aria-hidden="true" style={{ contain: 'strict', contentVisibility: 'auto' }}>
                    <td
                      colSpan={columns.length + (rowActions.length > 0 ? 1 : 0)}
                      style={{ height: paddingTop, padding: 0, border: 'none' }}
                    />
                  </tr>
                )}

                {/* Visible rows */}
                {allRows.slice(startIndex, endIndex + 1).map((row) => (
                  <Fragment key={row.id}>
                    <TableRow
                      key={row.id}
                      row={row}
                      rowHeight={estimatedRowHeight}
                      hoveredRowId={hoveredRowId}
                      hasRowActions={rowActions.length > 0}
                      onRowClick={onRowClick || enableRowSelection ? handleRowClick : undefined}
                      onPointerDown={() => startLongPress(row)}
                      onPointerUp={endLongPress}
                      onPointerLeave={endLongPress}
                      onPointerCancel={endLongPress}
                      onMouseEnter={() => setHoveredRowId(row.id)}
                      onMouseLeave={() => {
                        if (menuState.openRowId !== row.id) {
                          setHoveredRowId(null);
                        }
                      }}
                      onMenuToggle={(rowId) =>
                        toggleMenu(rowId, menuButtonRefs.current.get(rowId) || null)
                      }
                      menuButtonRef={(el, rowId) => {
                        if (el) menuButtonRefs.current.set(rowId, el);
                      }}
                      enableInlineEdit={enableInlineEdit}
                      isEditingCell={isEditing}
                      onCellDoubleClick={startEditing}
                      onCellEditSave={(cell, newValue) => {
                        const oldValue = cell.getValue();
                        handleCellEdit(row.id, cell.column.id, oldValue, newValue, row.original);
                      }}
                      onCellEditCancel={stopEditing}
                      getCellEditType={getCellEditType}
                      getCellEditOptions={getCellEditOptions}
                      enableRowExpansion={enableRowExpansion}
                    />
                    {enableRowExpansion && renderExpandedContent && (
                      <ExpandedRow
                        key={`${row.id}-expanded`}
                        row={row}
                        renderExpandedContent={renderExpandedContent}
                        colSpan={columns.length + (rowActions.length > 0 ? 1 : 0)}
                      />
                    )}
                  </Fragment>
                ))}

                {/* Bottom padding for virtualization */}
                {virtualize && paddingBottom > 0 && (
                  <tr aria-hidden="true" style={{ contain: 'strict', contentVisibility: 'auto' }}>
                    <td
                      colSpan={columns.length + (rowActions.length > 0 ? 1 : 0)}
                      style={{ height: paddingBottom, padding: 0, border: 'none' }}
                    />
                  </tr>
                )}
              </>
            )}
          </tbody>
          {enableFooter && (
            <tfoot className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-600">
              {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((header) => {
                    const isPinned = header.column.getIsPinned();
                    return (
                      <th
                        key={header.id}
                        style={{
                          width: `${header.getSize()}px`,
                          position: isPinned ? 'sticky' : 'relative',
                          left: isPinned === 'left' ? `${header.getStart('left')}px` : undefined,
                          right: isPinned === 'right' ? `${header.getAfter('right')}px` : undefined,
                          zIndex: isPinned ? 11 : undefined,
                        }}
                        className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.footer, header.getContext())}
                      </th>
                    );
                  })}
                  {rowActions.length > 0 && <th className="w-12" />}
                </tr>
              ))}
            </tfoot>
          )}
        </table>

        {/* Load Older Button */}
        {showLoadOlder && (
          <HStack className="w-full px-4 py-3 justify-center border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLoadOlder?.();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Load Older Transactions
            </button>
          </HStack>
        )}
      </div>

      {/* Footer - Selection info */}
      {enableRowSelection && hasSelection && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          {Object.keys(currentRowSelection).length} of {allRows.length} row(s) selected
        </div>
      )}

      {/* Action Menu */}
      <ActionMenu
        isOpen={menuState.openRowId !== null}
        position={menuState.position}
        actions={rowActions}
        onActionClick={handleMenuAction}
        containerRef={menuContainerRef}
      />
    </div>
  );
}

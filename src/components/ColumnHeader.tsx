import { memo, useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, GripVertical, Pin, PinOff } from 'lucide-react';
import type { Header } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';

interface ColumnHeaderProps<T> {
  header: Header<T, unknown>;
  enableColumnReordering?: boolean;
  onColumnDragStart?: (columnId: string) => void;
  onColumnDragOver?: (columnId: string) => void;
  onColumnDrop?: (columnId: string) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  enableColumnPinning?: boolean;
}

function ColumnHeaderComponent<T>({
  header,
  enableColumnReordering = false,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
  isDragging = false,
  isDragOver = false,
  enableColumnPinning = false,
}: ColumnHeaderProps<T>) {
  const canSort = header.column.getCanSort();
  const isSorted = header.column.getIsSorted();
  const canResize = header.column.getCanResize();
  const isResizing = header.column.getIsResizing();
  const rawHeader = header.column.columnDef.header;
  const isStringHeader = typeof rawHeader === 'string';
  const [showDragHandle, setShowDragHandle] = useState(false);
  const [showPinMenu, setShowPinMenu] = useState(false);
  const pinMenuRef = useRef<HTMLDivElement>(null);
  const isPinned = header.column.getIsPinned();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    onColumnDragStart?.(header.column.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onColumnDragOver?.(header.column.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onColumnDrop?.(header.column.id);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pinMenuRef.current && !pinMenuRef.current.contains(event.target as Node)) {
        setShowPinMenu(false);
      }
    }

    if (showPinMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPinMenu]);

  const handlePinLeft = () => {
    header.column.pin('left');
    setShowPinMenu(false);
  };

  const handlePinRight = () => {
    header.column.pin('right');
    setShowPinMenu(false);
  };

  const handleUnpin = () => {
    header.column.pin(false);
    setShowPinMenu(false);
  };

  return (
    <div
      className={`relative flex items-center h-full group ${isResizing ? 'select-none' : ''} ${
        isDragging ? 'opacity-50' : ''
      } ${isDragOver ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
      draggable={enableColumnReordering && !isResizing}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setShowDragHandle(true)}
      onMouseLeave={() => setShowDragHandle(false)}
    >
      {enableColumnReordering && showDragHandle && (
        <div className="flex-shrink-0 px-1 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3 h-3 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      {isStringHeader ? (
        <button
          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
          className={`flex-1 flex items-center gap-1.5 px-3 py-2 text-left text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest min-w-0 ${
            canSort ? 'cursor-pointer hover:text-gray-600 dark:hover:text-gray-300' : ''
          }`}
        >
          <span className="truncate min-w-0 block">{rawHeader as string}</span>
          {canSort && (
            <span className="flex-shrink-0">
              {isSorted === 'asc' ? (
                <ChevronUp className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              ) : isSorted === 'desc' ? (
                <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-30 transition-opacity" />
              )}
            </span>
          )}
        </button>
      ) : (
        <div className="flex-1 px-3 py-2 text-[10px] font-medium text-gray-400 dark:text-gray-500">
          {flexRender(rawHeader, header.getContext())}
        </div>
      )}

      {/* Pin Menu */}
      {enableColumnPinning && (
        <div className="relative flex-shrink-0" ref={pinMenuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPinMenu(!showPinMenu);
            }}
            className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
              isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            title="Pin column"
          >
            {isPinned ? (
              <Pin className="w-3 h-3 text-blue-500 dark:text-blue-400" />
            ) : (
              <PinOff className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            )}
          </button>

          {showPinMenu && (
            <div className="absolute top-full right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={handlePinLeft}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={isPinned === 'left'}
                >
                  Pin Left
                </button>
                <button
                  onClick={handlePinRight}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={isPinned === 'right'}
                >
                  Pin Right
                </button>
                {isPinned && (
                  <button
                    onClick={handleUnpin}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
                  >
                    Unpin
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resize handle */}
      {canResize && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={`absolute right-0 top-0 bottom-0 w-[1px] cursor-col-resize z-20 select-none transition-colors ${
            isResizing
              ? 'bg-blue-500 dark:bg-blue-400'
              : 'bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          style={{
            touchAction: 'none',
          }}
          title="Drag to resize"
        />
      )}
    </div>
  );
}

export const ColumnHeader = memo(ColumnHeaderComponent) as typeof ColumnHeaderComponent;

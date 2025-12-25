import { useState, useRef, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Column } from '@tanstack/react-table';

interface ColumnFilterMenuProps<T> {
  column: Column<T, unknown>;
}

export function ColumnFilterMenu<T>({ column }: ColumnFilterMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState((column.getFilterValue() as string) ?? '');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleApplyFilter = () => {
    column.setFilterValue(filterValue || undefined);
    setIsOpen(false);
  };

  const handleClearFilter = () => {
    setFilterValue('');
    column.setFilterValue(undefined);
    setIsOpen(false);
  };

  const isFiltered = column.getIsFiltered();

  if (!column.getCanFilter()) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
          isFiltered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        title="Filter column"
      >
        <Filter className={`w-3 h-3 ${isFiltered ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 p-3">
          <div className="space-y-3">
            <input
              type="text"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder="Filter value..."
              className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleApplyFilter}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Apply
              </button>
              <button
                onClick={handleClearFilter}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Row } from '@tanstack/react-table';
import { exportTableData, ExportFormat } from '../utils/export';

interface ExportMenuProps<T> {
  allRows: Row<T>[];
  selectedRows: Row<T>[];
  hasSelection: boolean;
}

export function ExportMenu<T>({ allRows, selectedRows, hasSelection }: ExportMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleExport = (format: ExportFormat, scope: 'all' | 'selected') => {
    const rows = scope === 'selected' ? selectedRows : allRows;
    const filename = `table-export-${scope}`;
    exportTableData({ filename, rows, format });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        aria-label="Export"
      >
        <Download size={16} />
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-1">
            {/* Export All Section */}
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Export All ({allRows.length} rows)
            </div>
            <button
              type="button"
              onClick={() => handleExport('csv', 'all')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport('json', 'all')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => handleExport('excel', 'all')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Excel
            </button>

            {/* Export Selected Section */}
            {hasSelection && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Export Selected ({selectedRows.length} rows)
                </div>
                <button
                  type="button"
                  onClick={() => handleExport('csv', 'selected')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('json', 'selected')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  JSON
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('excel', 'selected')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Excel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

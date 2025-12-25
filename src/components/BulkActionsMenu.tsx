import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface BulkAction {
  label: string;
  action: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
}

interface BulkActionsMenuProps {
  actions: BulkAction[];
  selectedCount: number;
  onAction: (action: string) => void;
}

export function BulkActionsMenu({ actions, selectedCount, onAction }: BulkActionsMenuProps) {
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

  if (actions.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
      >
        <MoreVertical size={16} />
        Bulk Actions ({selectedCount})
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-1">
            {actions.map((bulkAction) => (
              <button
                key={bulkAction.action}
                onClick={() => {
                  onAction(bulkAction.action);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                  bulkAction.variant === 'danger'
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {bulkAction.icon && <span className="flex-shrink-0">{bulkAction.icon}</span>}
                <span>{bulkAction.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

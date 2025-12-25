import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Check, X } from 'lucide-react';

export type CellEditType = 'text' | 'number' | 'date' | 'select';

interface EditableCellProps {
  value: unknown;
  onSave: (newValue: unknown) => void;
  onCancel: () => void;
  type?: CellEditType;
  options?: Array<{ value: unknown; label: string }>;
  autoFocus?: boolean;
}

export function EditableCell({
  value,
  onSave,
  onCancel,
  type = 'text',
  options = [],
  autoFocus = true,
}: EditableCellProps) {
  const [editValue, setEditValue] = useState(String(value ?? ''));
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [autoFocus]);

  const handleSave = () => {
    let parsedValue: unknown = editValue;

    if (type === 'number') {
      parsedValue = editValue === '' ? null : Number(editValue);
    }

    onSave(parsedValue);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded">
      {type === 'select' ? (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-1 py-0.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-1 py-0.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
        />
      )}
      <button
        type="button"
        onClick={handleSave}
        className="flex-shrink-0 p-0.5 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
        title="Save (Enter)"
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex-shrink-0 p-0.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
        title="Cancel (Esc)"
      >
        <X size={14} />
      </button>
    </div>
  );
}

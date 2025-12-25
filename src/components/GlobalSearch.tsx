import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function GlobalSearch({ value, onChange, placeholder = 'Search...' }: GlobalSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border rounded-md transition-colors ${
        isFocused
          ? 'border-blue-500 dark:border-blue-400 ring-1 ring-blue-500 dark:ring-blue-400'
          : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      <Search size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 text-sm bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 min-w-0"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="flex-shrink-0 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          aria-label="Clear search"
        >
          <X size={14} className="text-gray-400 dark:text-gray-500" />
        </button>
      )}
    </div>
  );
}

import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ColumnOrderState,
  ColumnPinningState,
} from '@tanstack/react-table';

export interface TablePreset {
  name: string;
  id: string;
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState;
  columnOrder?: ColumnOrderState;
  columnPinning?: ColumnPinningState;
  globalFilter?: string;
  createdAt: number;
}

/**
 * Save a table preset to localStorage
 */
export function savePreset(tableId: string, preset: TablePreset): boolean {
  try {
    const key = `table-preset-${tableId}`;
    const existing = loadPresets(tableId);
    const updated = existing.filter((p) => p.id !== preset.id);
    updated.push({ ...preset, createdAt: Date.now() });
    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Failed to save preset:', error);
    return false;
  }
}

/**
 * Load all presets for a table from localStorage
 */
export function loadPresets(tableId: string): TablePreset[] {
  try {
    const key = `table-preset-${tableId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load presets:', error);
    return [];
  }
}

/**
 * Delete a preset from localStorage
 */
export function deletePreset(tableId: string, presetId: string): boolean {
  try {
    const key = `table-preset-${tableId}`;
    const existing = loadPresets(tableId);
    const updated = existing.filter((p) => p.id !== presetId);
    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Failed to delete preset:', error);
    return false;
  }
}

/**
 * Get a specific preset by ID
 */
export function getPreset(tableId: string, presetId: string): TablePreset | null {
  const presets = loadPresets(tableId);
  return presets.find((p) => p.id === presetId) || null;
}

/**
 * Create a preset from current table state
 */
export function createPreset(
  name: string,
  state: {
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    columnOrder?: ColumnOrderState;
    columnPinning?: ColumnPinningState;
    globalFilter?: string;
  },
): TablePreset {
  return {
    name,
    id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...state,
    createdAt: Date.now(),
  };
}

/**
 * Apply a preset to table state
 */
export function applyPreset(
  preset: TablePreset,
  callbacks: {
    onSortingChange?: (sorting: SortingState) => void;
    onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
    onColumnVisibilityChange?: (visibility: VisibilityState) => void;
    onColumnOrderChange?: (order: ColumnOrderState) => void;
    onColumnPinningChange?: (pinning: ColumnPinningState) => void;
    onGlobalFilterChange?: (filter: string) => void;
  },
): void {
  if (preset.sorting && callbacks.onSortingChange) {
    callbacks.onSortingChange(preset.sorting);
  }
  if (preset.columnFilters && callbacks.onColumnFiltersChange) {
    callbacks.onColumnFiltersChange(preset.columnFilters);
  }
  if (preset.columnVisibility && callbacks.onColumnVisibilityChange) {
    callbacks.onColumnVisibilityChange(preset.columnVisibility);
  }
  if (preset.columnOrder && callbacks.onColumnOrderChange) {
    callbacks.onColumnOrderChange(preset.columnOrder);
  }
  if (preset.columnPinning && callbacks.onColumnPinningChange) {
    callbacks.onColumnPinningChange(preset.columnPinning);
  }
  if (preset.globalFilter !== undefined && callbacks.onGlobalFilterChange) {
    callbacks.onGlobalFilterChange(preset.globalFilter);
  }
}

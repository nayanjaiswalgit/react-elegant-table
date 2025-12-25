import { ColumnDef } from '@tanstack/react-table';

/**
 * Helper function to create grouped columns
 * @param header - The header text for the group
 * @param columns - Array of column definitions to group
 * @returns A column group definition
 */
export function createColumnGroup<T>(
  header: string,
  columns: ColumnDef<T, unknown>[],
  options?: {
    id?: string;
    footer?: string;
  },
): ColumnDef<T, unknown> {
  return {
    id: options?.id || header.toLowerCase().replace(/\s+/g, '-'),
    header,
    footer: options?.footer,
    columns,
  };
}

/**
 * Helper to create multi-level column groups
 * @param groups - Array of group definitions
 * @returns Array of grouped column definitions
 */
export function createColumnGroups<T>(
  groups: Array<{
    header: string;
    columns: ColumnDef<T, unknown>[];
    id?: string;
    footer?: string;
  }>,
): ColumnDef<T, unknown>[] {
  return groups.map((group) => createColumnGroup(group.header, group.columns, group));
}

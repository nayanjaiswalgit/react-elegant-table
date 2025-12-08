# Changelog

## [0.1.1] - 2025-12-08

### Fixed
- **TypeScript Export Issue**: Exported `ElegantTableProps` interface for better TypeScript support
  - Users can now import and use the props type: `import { type ElegantTableProps } from 'react-elegant-table'`
  - This fixes intellisense and type checking for consumers of the package
- **Code Quality**: Fixed all ESLint and Prettier formatting issues
- **React Hooks**: Fixed exhaustive-deps warning in useMCPData hook

## [0.1.0] - 2025-12-07

### Added
- **Actions Column Header Customization**: Added `actionsHeader` and `actionsColumnWidth` props to allow customization of the actions column header
  - `actionsHeader` (React.ReactNode): Custom content to display in the actions column header (can be text, icon, or any React element)
  - `actionsColumnWidth` (number): Width of the actions column in pixels (default: 48)

### Changed
- Actions column header is no longer blank by default - it now displays custom content when `actionsHeader` is provided
- Actions column header now has proper styling that matches other column headers

### Example Usage

```tsx
import { ElegantTable } from 'react-elegant-table';
import { Settings } from 'lucide-react';

<ElegantTable
  data={data}
  columns={columns}
  rowActions={actions}
  actionsHeader="Actions"  // Simple text header
  actionsColumnWidth={80}  // Wider column for the header text
/>

// Or with an icon:
<ElegantTable
  data={data}
  columns={columns}
  rowActions={actions}
  actionsHeader={<Settings className="h-4 w-4" />}  // Icon header
  actionsColumnWidth={48}  // Default width works well for icons
/>

// Or leave it empty (default behavior):
<ElegantTable
  data={data}
  columns={columns}
  rowActions={actions}
  // No actionsHeader prop - renders empty header cell
/>
```

## Previous Versions
...

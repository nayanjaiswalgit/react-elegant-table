import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ElegantTable } from './ElegantTable';
import { ColumnDef } from '@tanstack/react-table';

interface TestData {
  id: number;
  name: string;
  role: string;
}

const data: TestData[] = [
  { id: 1, name: 'John Doe', role: 'Admin' },
  { id: 2, name: 'Jane Smith', role: 'User' },
];

const columns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
];

describe('ElegantTable', () => {
  it('renders table headers correctly', () => {
    render(<ElegantTable data={data} columns={columns} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('renders table data correctly', () => {
    render(<ElegantTable data={data} columns={columns} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('shows empty state when no data provided', () => {
    render(<ElegantTable data={[]} columns={columns} />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});

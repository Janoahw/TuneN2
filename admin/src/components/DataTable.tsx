import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-[#1A1A1E] bg-surface-alt shadow">
        <div className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00CCCC] border-r-transparent"></div>
          <p className="mt-4 text-[#8E8E93]">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-[#1A1A1E] bg-surface-alt shadow">
        <div className="p-12 text-center text-[#8E8E93]">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#1A1A1E] bg-surface-alt shadow">
      <table className="min-w-full divide-y divide-[#1A1A1E]">
        <thead className="bg-surface">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={idx}
                className={`px-4 py-3 text-left text-[11px] font-medium uppercase text-[#8E8E93] ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A1A1E] bg-surface-alt">
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer transition hover:bg-[#1A1A1E]' : ''}
            >
              {columns.map((column, idx) => (
                <td
                  key={idx}
                  className={`whitespace-nowrap px-4 py-3 text-sm text-white ${column.className || ''}`}
                >
                  {typeof column.accessor === 'function'
                    ? column.accessor(row)
                    : String(row[column.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

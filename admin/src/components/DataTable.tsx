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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00CCCC] border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-12 text-center text-gray-600">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={idx}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map((column, idx) => (
                <td
                  key={idx}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
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

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Column {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  mobileHidden?: boolean;
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
  actions?: (row: any) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  title,
  searchable = true,
  filterable = false,
  actions,
  loading = false,
  emptyMessage = 'No data available',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter data based on search term
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {/* Header */}
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-semibold">
            {title} ({sortedData.length})
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {searchable && (
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            )}
            
            {filterable && (
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            )}

            {/* View Mode Toggle - Mobile */}
            <div className="sm:hidden flex border rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded text-xs ${
                  viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2 py-1 rounded text-xs ${
                  viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {sortedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`text-left py-3 px-4 font-medium text-gray-600 ${
                          column.sortable ? 'cursor-pointer hover:text-gray-900' : ''
                        }`}
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        <div className="flex items-center gap-2">
                          {column.title}
                          {column.sortable && renderSortIcon(column.key)}
                        </div>
                      </th>
                    ))}
                    {actions && <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className="py-3 px-4">
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </td>
                      ))}
                      {actions && (
                        <td className="py-3 px-4">
                          {actions(row)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {sortedData.map((row, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    {columns
                      .filter((column) => !column.mobileHidden)
                      .map((column) => (
                        <div key={column.key} className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-600 min-w-0 flex-1">
                            {column.title}:
                          </span>
                          <span className="text-sm text-gray-900 ml-2 text-right">
                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                          </span>
                        </div>
                      ))}
                    {actions && (
                      <div className="pt-2 border-t flex justify-end">
                        {actions(row)}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ResponsiveTable;
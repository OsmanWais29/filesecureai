
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExcelTableProps } from '../types';

const ExcelTable: React.FC<ExcelTableProps> = ({ 
  data,
  enableSorting = false,
  enableFiltering = false
}) => {
  if (!data || !data.length) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Get all possible column headers from data
  const columns = React.useMemo(() => {
    const headers = new Set<string>();
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        headers.add(key);
      });
    });
    return Array.from(headers);
  }, [data]);

  return (
    <div className="overflow-auto h-full w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={`${rowIndex}-${column}`}>
                  {row[column] !== undefined ? String(row[column]) : ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExcelTable;

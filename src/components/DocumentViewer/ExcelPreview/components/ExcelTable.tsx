
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ExcelTableProps {
  data: any;
}

export const ExcelTable: React.FC<ExcelTableProps> = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="p-4 text-muted-foreground">No data available</div>;
  }

  // Get all unique keys from the data objects
  const allKeys = data.reduce((keys: Set<string>, row: any) => {
    if (row && typeof row === 'object') {
      Object.keys(row).forEach(key => keys.add(key));
    }
    return keys;
  }, new Set<string>());

  const headers = Array.from(allKeys);

  return (
    <div className="overflow-auto h-full">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, idx) => (
              <TableHead key={idx} className="whitespace-nowrap">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row: any, rowIdx: number) => (
            <TableRow key={rowIdx}>
              {headers.map((header, cellIdx) => (
                <TableCell key={cellIdx} className="whitespace-nowrap">
                  {row && row[header] !== undefined ? String(row[header]) : ''}
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

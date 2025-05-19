
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { safeString } from '@/utils/typeSafetyUtils';

export interface ExcelTableProps {
  data: Record<string, unknown>[];
}

const ExcelTable: React.FC<ExcelTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }
  
  // Get headers from the first data item
  const headers = Object.keys(data[0]);

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className="font-medium">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header) => (
                <TableCell key={`${rowIndex}-${header}`}>
                  {safeString(row[header], '')}
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

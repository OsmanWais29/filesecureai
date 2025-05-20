
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExcelTableProps } from '../types';

const ExcelTable: React.FC<ExcelTableProps> = ({ 
  data, 
  enableSorting = false, 
  enableFiltering = false 
}) => {
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Get headers from the first object's keys
  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index} className="font-medium">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header, cellIndex) => (
                <TableCell key={cellIndex}>
                  {row[header] === null || row[header] === undefined ? '' : String(row[header])}
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


import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExcelTableProps } from '../types';

const ExcelTable: React.FC<ExcelTableProps> = ({ 
  data, 
  selectedSheet,
  onSheetSelect,
  enableSorting = false, 
  enableFiltering = false 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No data available
      </div>
    );
  }

  // Extract headers from the first row
  const headers = Object.keys(data[0]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header) => (
                <TableCell key={`${rowIndex}-${header}`}>
                  {row[header]?.toString() || ''}
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

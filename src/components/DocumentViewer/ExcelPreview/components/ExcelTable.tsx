
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { safeString } from '@/utils/typeSafetyUtils';

interface ExcelTableProps {
  data: Record<string, any>[];
}

const ExcelTable: React.FC<ExcelTableProps> = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Get all unique keys from all objects
  const allKeys = Object.keys(data.reduce((result, obj) => {
    Object.keys(obj).forEach(key => {
      result[key] = true;
    });
    return result;
  }, {} as Record<string, boolean>));

  return (
    <Card className="h-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {allKeys.map((key) => (
              <TableHead key={key}>{key}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {allKeys.map((key) => (
                <TableCell key={`${rowIndex}-${key}`}>
                  {safeString(row[key], '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ExcelTable;

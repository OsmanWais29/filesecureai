
import React from 'react';

interface ExcelTableProps {
  data: any[][];
  tableName?: string;
}

const ExcelTable: React.FC<ExcelTableProps> = ({ data, tableName }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No data available in this sheet
      </div>
    );
  }

  // Get header row
  const headers = data[0];
  
  return (
    <div className="overflow-auto max-h-full pb-4">
      {tableName && (
        <h3 className="font-medium text-lg sticky top-0 bg-background p-2">
          {tableName}
        </h3>
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((header: any, index: number) => (
              <th 
                key={`header-${index}`} 
                className="border border-border p-2 text-left font-medium text-sm sticky top-10 bg-muted/50"
              >
                {header?.toString() || ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, rowIndex) => (
            <tr 
              key={`row-${rowIndex}`} 
              className={rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
            >
              {row.map((cell, cellIndex) => (
                <td 
                  key={`cell-${rowIndex}-${cellIndex}`} 
                  className="border border-border p-2 text-sm"
                >
                  {cell?.toString() || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelTable;

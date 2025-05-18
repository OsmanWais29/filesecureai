
import React from 'react';

interface ExcelTableProps {
  data: any;
  sheet: string;
}

const ExcelTable: React.FC<ExcelTableProps> = ({ data, sheet }) => {
  if (!data || !data[sheet] || !data[sheet].data) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-md">
        <p className="text-muted-foreground">No data available for this sheet</p>
      </div>
    );
  }

  const sheetData = data[sheet].data;
  const headers = sheetData[0] || [];
  const rows = sheetData.slice(1);

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            {headers.map((header: any, index: number) => (
              <th 
                key={index} 
                className="p-2 text-left text-sm font-medium border text-muted-foreground"
              >
                {header || ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any[], rowIndex: number) => (
            <tr 
              key={rowIndex}
              className={rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
            >
              {row.map((cell, cellIndex) => (
                <td 
                  key={cellIndex} 
                  className="p-2 text-sm border"
                >
                  {cell !== null && cell !== undefined ? String(cell) : ''}
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

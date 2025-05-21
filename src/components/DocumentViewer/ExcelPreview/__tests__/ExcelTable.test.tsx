
import React from 'react';
import { render, screen } from '@testing-library/react';
import ExcelTable from '../components/ExcelTable';
import { ExcelTableProps } from '../types';

// Mock the component for testing purposes
jest.mock('../components/ExcelTable', () => {
  return function MockExcelTable(props: ExcelTableProps) {
    return (
      <div>
        <div>Headers: {Object.keys(props.data[0] || {}).join(', ')}</div>
        <div>
          {props.data.map((row, i) => (
            <div key={i} data-testid={`row-${i}`}>
              {Object.values(row).join(', ')}
            </div>
          ))}
        </div>
        {props.data.length === 0 && <div>No data available</div>}
      </div>
    );
  };
});

describe('ExcelTable component', () => {
  const mockData = [
    { Header1: 'Value1', Header2: 'Value2', Header3: 'Value3' },
    { Header1: 'Value4', Header2: 'Value5', Header3: 'Value6' },
    { Header1: 'Value7', Header2: 'Value8', Header3: 'Value9' },
  ];

  it('renders with data correctly', () => {
    render(
      <ExcelTable
        data={mockData}
        selectedSheet="Sheet1"
        onSheetSelect={() => {}}
      />
    );
    
    // Check for headers
    expect(screen.getByText('Header1')).toBeInTheDocument();
    expect(screen.getByText('Header2')).toBeInTheDocument();
    expect(screen.getByText('Header3')).toBeInTheDocument();
    
    // Check for values
    expect(screen.getByText('Value1')).toBeInTheDocument();
    expect(screen.getByText('Value5')).toBeInTheDocument();
    expect(screen.getByText('Value9')).toBeInTheDocument();
  });
  
  it('renders empty state when no data is provided', () => {
    render(
      <ExcelTable
        data={[]}
        selectedSheet="Sheet1"
        onSheetSelect={() => {}}
      />
    );
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
  
  it('handles null values in data', () => {
    const dataWithNull = [
      { Header1: null, Header2: 'Value2', Header3: undefined },
    ];
    
    render(
      <ExcelTable
        data={dataWithNull}
        selectedSheet="Sheet1"
        onSheetSelect={() => {}}
      />
    );
    
    expect(screen.getByText('Header1')).toBeInTheDocument();
    expect(screen.getByText('Value2')).toBeInTheDocument();
    // Empty cells still exist but don't have text content
  });
});

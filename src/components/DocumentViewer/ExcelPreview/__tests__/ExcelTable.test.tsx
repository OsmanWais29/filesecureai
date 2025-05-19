
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from './setup';
import ExcelTable from '../components/ExcelTable';

describe('ExcelTable Component', () => {
  const mockData = [
    { Header1: 'Row1Col1', Header2: 'Row1Col2', Header3: 'Row1Col3' },
    { Header1: 'Row2Col1', Header2: 'Row2Col2', Header3: 'Row2Col3' }
  ];

  it('renders the table with correct headers and data', () => {
    render(<ExcelTable data={mockData} />);
    
    expect(screen.getByText('Header1')).toBeInTheDocument();
    expect(screen.getByText('Header2')).toBeInTheDocument();
    expect(screen.getByText('Header3')).toBeInTheDocument();
  });

  it('renders the table with correct rows', () => {
    render(<ExcelTable data={mockData} />);
    
    expect(screen.getByText('Row1Col1')).toBeInTheDocument();
    expect(screen.getByText('Row1Col2')).toBeInTheDocument();
    expect(screen.getByText('Row1Col3')).toBeInTheDocument();
    
    expect(screen.getByText('Row2Col1')).toBeInTheDocument();
    expect(screen.getByText('Row2Col2')).toBeInTheDocument();
    expect(screen.getByText('Row2Col3')).toBeInTheDocument();
  });

  it('renders empty state when no data is provided', () => {
    render(<ExcelTable data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});

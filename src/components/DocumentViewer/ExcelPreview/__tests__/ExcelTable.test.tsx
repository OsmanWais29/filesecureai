
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ExcelTable } from '../components/ExcelTable';
import { ExcelData } from '../types';
import { screen, fireEvent, waitFor } from '../../../../setupTests';

// Sample data for testing
const mockExcelData: ExcelData = {
  headers: ['Name', 'Age', 'City', 'Salary'],
  rows: [
    ['John Smith', 30, 'New York', 75000],
    ['Jane Doe', 25, 'Boston', 82000],
    ['Bob Johnson', 35, 'Chicago', 65000],
    ['Alice Brown', 28, 'San Francisco', 90000],
    ['Total', 118, '', 312000],
  ]
};

describe('ExcelTable Component', () => {
  beforeEach(() => {
    // Reset any mocks before each test
  });

  it('renders the table with correct headers and data', () => {
    render(<ExcelTable data={mockExcelData} />);
    
    // Check headers
    mockExcelData.headers.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
    
    // Check some sample data
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('312000')).toBeInTheDocument();
  });

  it('applies formatting to make the last row bold', () => {
    render(<ExcelTable data={mockExcelData} />);
    
    const totalCell = screen.getByText('Total').closest('tr');
    expect(totalCell).toHaveClass('font-bold');
  });

  it('does not display sorting and filtering controls when disabled', () => {
    render(<ExcelTable data={mockExcelData} />);
    
    // Filtering controls should not be present
    const filterInputs = screen.queryByPlaceholderText(/filter by/i);
    expect(filterInputs).not.toBeInTheDocument();
    
    // Sorting icons should not be visible or should be hidden
    const sortIcons = screen.queryAllByText(/ArrowUp/);
    expect(sortIcons.length).toBe(0);
  });

  it('displays sorting controls when sorting is enabled', () => {
    render(<ExcelTable data={mockExcelData} enableSorting={true} />);
    
    // Get all table headers
    const headerCells = screen.getAllByRole('columnheader');
    
    // Check for pointer cursor on headers
    headerCells.forEach(cell => {
      expect(cell).toHaveClass('cursor-pointer');
    });
  });

  it('displays filtering controls when filtering is enabled', () => {
    render(<ExcelTable data={mockExcelData} enableFiltering={true} />);
    
    // Check for presence of filter dropdown
    expect(screen.getByText(/select column to filter/i)).toBeInTheDocument();
  });

  it('sorts data when clicking on a column header with sorting enabled', async () => {
    render(<ExcelTable data={mockExcelData} enableSorting={true} />);
    
    // Get all table headers
    const headerCells = screen.getAllByRole('columnheader');
    
    // Click on 'Age' column header (index 1)
    fireEvent.click(headerCells[1]);

    // Check if data is sorted in ascending order
    const rows = screen.getAllByRole('row').slice(1); // Skip header row
    
    // First row should now be Jane Doe (age 25)
    expect(rows[0]).toHaveTextContent('Jane Doe');
    expect(rows[0]).toHaveTextContent('25');
    
    // Click again to sort in descending order
    fireEvent.click(headerCells[1]);
    
    // Now the top non-total row should be Bob Johnson (age 35)
    const rowsAfterSecondClick = screen.getAllByRole('row').slice(1);
    expect(rowsAfterSecondClick[0]).toHaveTextContent('Bob Johnson');
    expect(rowsAfterSecondClick[0]).toHaveTextContent('35');
  });

  it('filters data when selecting a column and entering filter text', async () => {
    render(<ExcelTable data={mockExcelData} enableFiltering={true} />);
    
    // Open the filter dropdown
    const selectTrigger = screen.getByText(/select column to filter/i);
    fireEvent.click(selectTrigger);
    
    // Select the "Name" column (index 0)
    const nameOption = screen.getByText('Name');
    fireEvent.click(nameOption);
    
    // Now the filter input should appear
    const filterInput = screen.getByPlaceholderText(/filter by name/i);
    
    // Filter for "John"
    fireEvent.change(filterInput, { target: { value: 'John' } });
    
    // Only John Smith should be visible in the table (plus the total row)
    const rows = screen.getAllByRole('row').slice(1); // Skip header row
    expect(rows.length).toBe(2); // John + Total
    expect(rows[0]).toHaveTextContent('John Smith');
    
    // Should show a results count
    expect(screen.getByText(/showing 1 of 5 rows/i)).toBeInTheDocument();
    
    // Clear the filter
    const clearButton = screen.getByRole('button', { name: /x/i });
    fireEvent.click(clearButton);
    
    // All rows should be visible again
    const rowsAfterClear = screen.getAllByRole('row').slice(1);
    expect(rowsAfterClear.length).toBe(5);
  });
});

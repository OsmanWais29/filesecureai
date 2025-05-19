
import { render, screen } from '@testing-library/react';
import ExcelPreview from "../index";

// Mock the useExcelPreview hook
jest.mock('../hooks/useExcelPreview', () => ({
  useExcelPreview: () => ({
    data: [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 }
    ],
    isLoading: false,
    error: null,
    sheets: ['Sheet1'],
    activeSheet: 'Sheet1',
    setActiveSheet: jest.fn(),
    downloadExcel: jest.fn(),
    refresh: jest.fn()
  })
}));

describe('ExcelPreview', () => {
  it('renders Excel data correctly', () => {
    render(<ExcelPreview documentId="test-id" storagePath="test/path" />);
    
    // Check for sheet tab
    expect(screen.getByText('Sheet1')).toBeInTheDocument();
    
    // We don't need to check for table content here as ExcelTable is tested separately
  });
});

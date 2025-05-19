
import { render, screen } from '@testing-library/react';
import ExcelPreview from "../index";
import { vi, describe, it, expect } from 'vitest';

// Mock data for the useExcelPreview hook
const mockExcelData = {
  data: [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 }
  ],
  isLoading: false,
  error: null,
  sheets: ['Sheet1'],
  activeSheet: 'Sheet1',
  setActiveSheet: vi.fn(),
  downloadExcel: vi.fn(),
  refresh: vi.fn()
};

// Mock the useExcelPreview hook
vi.mock('../hooks/useExcelPreview', () => ({
  useExcelPreview: () => mockExcelData
}));

describe('ExcelPreview', () => {
  it('renders Excel data correctly', () => {
    render(<ExcelPreview documentId="test-id" storagePath="test/path" />);
    
    // Check for sheet tab
    expect(screen.getByText('Sheet1')).toBeInTheDocument();
    
    // We don't need to check for table content here as ExcelTable is tested separately
  });
});

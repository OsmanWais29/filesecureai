
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from './setup';
import ExcelPreview from '../index';

vi.mock('../hooks/useExcelPreview', () => ({
  useExcelPreview: () => ({
    excelData: {
      sheets: [
        {
          name: 'Sheet1',
          data: [
            ['Header1', 'Header2'],
            ['Value1', 'Value2']
          ],
          columns: ['Header1', 'Header2']
        }
      ],
      activeSheet: 0,
      metadata: {
        fileName: 'test.xlsx',
        sheetCount: 1
      }
    },
    loading: false,
    error: null,
    activeSheet: 0,
    changeSheet: vi.fn(),
    sheets: ['Sheet1'],
    downloadExcel: vi.fn(),
    refresh: vi.fn(),
    data: [
      { Header1: 'Value1', Header2: 'Value2' }
    ]
  })
}));

describe('ExcelPreview', () => {
  it('renders the Excel preview component', async () => {
    render(<ExcelPreview storagePath="test/path.xlsx" documentId="test-id" />);
    
    await waitFor(() => {
      expect(screen.getByText('Sheet1')).toBeInTheDocument();
    });
  });
});

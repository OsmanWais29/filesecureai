
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from './setup';
import { ExcelPreview } from '../components/ExcelPreview';

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
    changeSheet: vi.fn()
  })
}));

describe('ExcelPreview', () => {
  it('renders the Excel preview component', async () => {
    render(<ExcelPreview storagePath="test/path.xlsx" />);
    
    await waitFor(() => {
      expect(screen.getByText('test.xlsx')).toBeInTheDocument();
    });
  });
});

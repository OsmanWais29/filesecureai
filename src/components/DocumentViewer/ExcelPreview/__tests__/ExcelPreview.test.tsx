
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from './setup'; 
import ExcelViewer from '../index';

describe('ExcelPreview Component', () => {
  const mockUrl = 'https://example.com/test.xlsx';
  const mockDocumentId = 'doc-123';
  const mockTitle = 'Test Excel Document';

  it('should render loading state initially', () => {
    render(
      <ExcelViewer 
        url={mockUrl} 
        documentId={mockDocumentId} 
        title={mockTitle} 
      />
    );
    expect(screen.getByText(/Loading spreadsheet/i)).toBeDefined();
  });

  // Additional tests would go here
});

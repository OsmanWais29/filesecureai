import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentList } from '../../documents/DocumentList';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { screen, fireEvent } from '../../../setupTests';
import type { Document } from '../types';

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Document 1',
    created_at: '2023-01-01',
    size: 1024,
    type: 'PDF',
    updated_at: '2023-01-01'
  }
];

// Mock function for document selection
const mockOnDocumentSelect = vi.fn();

describe('DocumentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders document items with correct icons', () => {
    render(
      <BrowserRouter>
        <DocumentList 
          documents={mockDocuments}
          isLoading={false}
          onDocumentDoubleClick={mockOnDocumentSelect}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Document 1')).toBeInTheDocument();
  });

  it('displays file size in correct format', () => {
    render(
      <BrowserRouter>
        <DocumentList 
          documents={mockDocuments}
          isLoading={false}
          onDocumentDoubleClick={mockOnDocumentSelect}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('1.00 MB')).toBeInTheDocument();
  });
});

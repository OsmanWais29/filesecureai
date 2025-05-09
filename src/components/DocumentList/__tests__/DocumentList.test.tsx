
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
    title: 'Test Document',
    type: 'pdf', // This is required
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    size: 1024, // This is required
    storage_path: 'test/path' // This is required
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

    expect(screen.getByText('Test Document')).toBeInTheDocument();
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

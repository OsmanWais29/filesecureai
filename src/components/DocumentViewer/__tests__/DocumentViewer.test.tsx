
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentViewer } from '../index';
import { vi } from 'vitest';
import { screen, fireEvent, waitFor } from '../../../setupTests';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

const mockDocument = {
  id: '1',
  title: 'Test Document',
  storage_path: 'test/path',
  type: 'pdf',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(), // Added missing required field
  size: 1024,
  analysis: [{
    content: {
      extracted_info: {
        clientName: 'Test Client',
        summary: 'Test Summary'
      },
      risks: []
    }
  }]
};

describe('DocumentViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders document preview with analyze button', () => {
    render(<DocumentViewer documentId="1" />);
    expect(screen.getByText('Analyze Document')).toBeInTheDocument();
  });

  it('shows loading state while analyzing', async () => {
    render(<DocumentViewer documentId="1" />);
    const analyzeButton = screen.getByText('Analyze Document');
    
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });
  });

  it('displays risk assessment when available', () => {
    render(<DocumentViewer documentId="1" />);
    expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
  });
});

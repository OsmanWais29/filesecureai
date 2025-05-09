
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExcelPreview } from '../index';
import { screen, waitFor } from '../../../../setupTests';

// Mock the required imports
vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/test.xlsx' }
        })),
        download: vi.fn(() => Promise.resolve({
          data: new Blob(['test data']),
          error: null
        }))
      }))
    },
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { metadata: { processing_complete: false } },
            error: null
          }))
        }))
      })),
      upsert: vi.fn(() => Promise.resolve())
    }))
  }
}));

// Mock hooks to avoid XLSX complexity in tests
vi.mock('../hooks/useExcelPreview', () => ({
  useExcelPreview: vi.fn(() => ({
    data: {
      headers: ['Name', 'Value'],
      rows: [['John', 100], ['Total', 100]]
    },
    loading: false,
    error: null,
    publicUrl: 'https://example.com/test.xlsx',
    loadingProgress: 100,
    clientName: 'Test Client',
    handleRefresh: vi.fn()
  }))
}));

// Mock the utils and services
vi.mock('@/utils/documents/folder-utils', () => ({
  organizeDocumentIntoFolders: vi.fn()
}));

describe('ExcelPreview Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Excel preview with the correct title', () => {
    render(<ExcelPreview storagePath="documents/test.xlsx" title="Test Excel File" />);
    expect(screen.getByText('Test Excel File')).toBeInTheDocument();
  });

  it('displays client name when available', () => {
    render(<ExcelPreview storagePath="documents/test.xlsx" />);
    expect(screen.getByText(/client: test client/i)).toBeInTheDocument();
  });

  it('displays table with Excel data', () => {
    render(<ExcelPreview storagePath="documents/test.xlsx" />);
    // Check for headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    
    // Check for some data
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', async () => {
    // Override the mock for this specific test
    vi.mocked(require('../hooks/useExcelPreview').useExcelPreview).mockReturnValueOnce({
      data: null,
      loading: true,
      error: null,
      publicUrl: '',
      loadingProgress: 50,
      clientName: null,
      handleRefresh: vi.fn()
    });
    
    render(<ExcelPreview storagePath="documents/test.xlsx" />);
    expect(screen.getByText(/extracting data and detecting/i)).toBeInTheDocument();
  });

  it('shows error state when there is an error', async () => {
    // Override the mock for this specific test
    vi.mocked(require('../hooks/useExcelPreview').useExcelPreview).mockReturnValueOnce({
      data: null,
      loading: false,
      error: 'Failed to load Excel file',
      publicUrl: 'https://example.com/test.xlsx',
      loadingProgress: 0,
      clientName: null,
      handleRefresh: vi.fn()
    });
    
    render(<ExcelPreview storagePath="documents/test.xlsx" />);
    expect(screen.getByText(/failed to load excel file/i)).toBeInTheDocument();
  });
});

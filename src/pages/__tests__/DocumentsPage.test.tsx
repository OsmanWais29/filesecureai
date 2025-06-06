
import { describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import DocumentsPage from '../DocumentsPage';
import { supabase } from '@/lib/supabase';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../setupTests';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'test-url' } }))
      }))
    }
  }
}));

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: {} })
  };
});

// No need for renderWithRouter function since we're importing render from setupTests
describe('DocumentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the document upload area', () => {
    render(
      <BrowserRouter>
        <DocumentsPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/Drag and drop your documents here/i)).toBeInTheDocument();
  });

  it('handles file upload when clicking browse button', async () => {
    render(
      <BrowserRouter>
        <DocumentsPage />
      </BrowserRouter>
    );
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/browse files/i);

    Object.defineProperty(input, 'files', {
      value: [file]
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(supabase.storage.from).toHaveBeenCalled();
    });
  });
});

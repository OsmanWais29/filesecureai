
import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ConBrandingPage } from '@/pages/ConBrandingPage';
import { supabase } from '@/lib/supabase';
import { createMockFile, logTestResult, waitForAsync } from './utils/testHelpers';
import { screen, fireEvent } from '../../../setupTests';

describe('SAFA Module-Specific Functionality', () => {
  // Test 2.1: Document Upload and Metadata Extraction
  test('handles document upload and metadata extraction', async () => {
    try {
      render(<ConBrandingPage />);
      
      // Mock Supabase upload response
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test.pdf' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
      } as any);

      // Mock AI analysis response
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: {
          response: "Document analyzed successfully. Metadata extracted..."
        },
        error: null
      });

      // Simulate file upload
      const file = createMockFile();
      const uploadInput = screen.getByLabelText(/Upload Document/i);
      fireEvent.change(uploadInput, { target: { files: [file] } });
      
      await waitForAsync();
      
      // Verify the system shows appropriate messages
      expect(screen.getByText(/I've received your document/i)).toBeInTheDocument();
      
      logTestResult('Document Upload and Metadata Extraction', true);
    } catch (error) {
      logTestResult('Document Upload and Metadata Extraction', false, error as Error);
      throw error;
    }
  });

  // Test 2.5: Legal Query Handling
  test('handles legal queries with detailed responses', async () => {
    try {
      render(<ConBrandingPage />);
      
      // Switch to Legal tab
      const legalTab = screen.getByText(/Legal & Regulatory/i);
      fireEvent.click(legalTab);
      
      // Mock Supabase response for legal query
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: {
          response: "According to the OSB Act, section 1.1..."
        },
        error: null
      });

      // Type and send a legal query
      const input = screen.getByPlaceholderText(/Ask about document management/i);
      fireEvent.change(input, { target: { value: 'Explain the implications of the OSB Act' } });
      
      const sendButton = screen.getByRole('button', { name: '' });
      fireEvent.click(sendButton);
      
      await waitForAsync();
      
      // Verify the response
      expect(screen.getByText(/According to the OSB Act, section 1.1/i)).toBeInTheDocument();
      
      logTestResult('Legal Query Handling', true);
    } catch (error) {
      logTestResult('Legal Query Handling', false, error as Error);
      throw error;
    }
  });
});

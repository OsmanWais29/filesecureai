
import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ConBrandingPage } from '@/pages/ConBrandingPage';
import { 
  createMockMessage, 
  logTestResult, 
  waitForAsync, 
  mockAIResponse,
  simulateChat
} from './utils/testHelpers';
import { screen, fireEvent } from '../../../setupTests';

describe('SAFA Core Functionality', () => {
  // Test 1.1: Module Launch and Navigation
  test('renders SAFA interface with all core components', () => {
    try {
      render(<ConBrandingPage />);
      
      // Check for core UI elements
      expect(screen.getByText(/Welcome to Secure Files Adaptive Future-forward Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/Document Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/Legal & Regulatory/i)).toBeInTheDocument();
      expect(screen.getByText(/Training & Help/i)).toBeInTheDocument();
      
      logTestResult('Core UI Components Render', true);
    } catch (error) {
      logTestResult('Core UI Components Render', false, error as Error);
      throw error;
    }
  });

  // Test 1.2: Module Tab Switching
  test('switches between module tabs correctly', async () => {
    try {
      render(<ConBrandingPage />);
      
      // Click Legal & Regulatory tab
      const legalTab = screen.getByText(/Legal & Regulatory/i);
      fireEvent.click(legalTab);
      expect(screen.getByRole('tab', { name: /Legal & Regulatory/i })).toHaveAttribute('aria-selected', 'true');
      
      // Click Training & Help tab
      const helpTab = screen.getByText(/Training & Help/i);
      fireEvent.click(helpTab);
      expect(screen.getByRole('tab', { name: /Training & Help/i })).toHaveAttribute('aria-selected', 'true');
      
      logTestResult('Module Tab Switching', true);
    } catch (error) {
      logTestResult('Module Tab Switching', false, error as Error);
      throw error;
    }
  });

  // Test 1.3: Responsive Design
  test('adapts layout for different screen sizes', async () => {
    try {
      const { container } = render(<ConBrandingPage />);
      
      // Test mobile view
      window.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));
      await waitForAsync();
      
      // Verify mobile layout adjustments
      const sidebar = container.querySelector('[data-testid="sidebar"]');
      expect(sidebar).toHaveClass('hidden md:block');
      
      logTestResult('Responsive Design', true);
    } catch (error) {
      logTestResult('Responsive Design', false, error as Error);
      throw error;
    }
  });

  // Test 1.4: Work-Related Query Response
  test('handles work-related queries correctly', async () => {
    try {
      render(<ConBrandingPage />);
      
      // Mock AI response
      mockAIResponse('help', "Here are the steps to update document metadata...");

      // Type and send a query
      const input = screen.getByPlaceholderText(/Ask about document management/i);
      fireEvent.change(input, { target: { value: 'How do I update document metadata?' } });
      
      const sendButton = screen.getByRole('button', { name: '' });
      fireEvent.click(sendButton);
      
      await waitForAsync();
      
      // Verify the response
      expect(screen.getByText(/Here are the steps to update document metadata/i)).toBeInTheDocument();
      
      logTestResult('Work-Related Query Response', true);
    } catch (error) {
      logTestResult('Work-Related Query Response', false, error as Error);
      throw error;
    }
  });

  // Test 1.5: Module State Persistence
  test('maintains module state between tab switches', async () => {
    try {
      render(<ConBrandingPage />);
      
      // Input a message in document analysis
      await simulateChat(screen, 'Analyze this document');
      
      // Switch to legal tab and back
      const legalTab = screen.getByText(/Legal & Regulatory/i);
      fireEvent.click(legalTab);
      const documentTab = screen.getByText(/Document Analysis/i);
      fireEvent.click(documentTab);
      
      // Verify chat history is maintained
      expect(screen.getByText(/Analyze this document/i)).toBeInTheDocument();
      
      logTestResult('Module State Persistence', true);
    } catch (error) {
      logTestResult('Module State Persistence', false, error as Error);
      throw error;
    }
  });

  // Test 1.6: Search Functionality
  test('performs search across all modules', async () => {
    try {
      render(<ConBrandingPage />);
      
      // Mock search results
      mockAIResponse('help', 'Found 3 relevant documents...');
      
      const searchInput = screen.getByPlaceholderText(/Search/i);
      fireEvent.change(searchInput, { target: { value: 'bankruptcy' } });
      await waitForAsync();
      
      expect(screen.getByText(/Found 3 relevant documents/i)).toBeInTheDocument();
      
      logTestResult('Search Functionality', true);
    } catch (error) {
      logTestResult('Search Functionality', false, error as Error);
      throw error;
    }
  });

  // Test 1.7: Accessibility
  test('meets accessibility requirements', () => {
    try {
      render(<ConBrandingPage />);
      
      // Test keyboard navigation
      const firstTab = screen.getByText(/Document Analysis/i);
      firstTab.focus();
      fireEvent.keyDown(firstTab, { key: 'Enter' });
      expect(screen.getByRole('tab', { name: /Document Analysis/i })).toHaveAttribute('aria-selected', 'true');
      
      // Test ARIA attributes
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('complementary')).toBeInTheDocument();
      
      logTestResult('Accessibility Requirements', true);
    } catch (error) {
      logTestResult('Accessibility Requirements', false, error as Error);
      throw error;
    }
  });
});

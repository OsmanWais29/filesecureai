
import { vi } from 'vitest';
import { User, Session } from '@supabase/supabase-js';
import { fireEvent } from '../../../../setupTests';

export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Create a mock AuthError that's compatible with Supabase's AuthError
export const mockErrorResponse = (message: string) => {
  const error = new Error(message);
  Object.defineProperties(error, {
    name: { value: 'AuthError' },
    code: { value: 'custom_error' },
    status: { value: 400 }
  });
  return error as unknown as any; // Cast to any to avoid TypeScript complexity with AuthError
};

export const mockSession = {
  user: {
    id: 'test-user',
    email: 'test@example.com',
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: 'Test User' },
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00Z',
    role: 'authenticated',
    identities: []
  },
  access_token: 'valid-token',
  refresh_token: 'valid-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  expires_at: Math.floor(Date.now() / 1000) + 3600
};

// Helper functions with correct parameter signatures
export const createMockMessage = vi.fn((content: string) => ({
  id: 'msg-' + Math.random().toString(36).substring(2, 9),
  content,
  timestamp: new Date().toISOString(),
  sender: 'user'
}));

export const logTestResult = vi.fn((testName: string, passed: boolean, error?: Error) => {
  if (passed) {
    console.log(`✅ Test Passed: ${testName}`);
  } else {
    console.error(`❌ Test Failed: ${testName}`, error);
  }
});

export const mockAIResponse = vi.fn((type: string, content: string) => {
  return {
    text: content,
    type,
    timestamp: new Date().toISOString()
  };
});

export const simulateChat = vi.fn(async (screen: any, message: string) => {
  const input = screen.getByPlaceholderText(/Ask about document management/i);
  fireEvent.change(input, { target: { value: message } });
  
  const sendButton = screen.getByRole('button', { name: '' });
  fireEvent.click(sendButton);
  
  await waitForAsync();
});

export const mockDocumentUpload = vi.fn((success: boolean) => {
  // Mock implementation based on success parameter
  return success;
});

export const verifyToastNotification = vi.fn((screen: any, textPattern: RegExp) => {
  expect(screen.getByText(textPattern)).toBeInTheDocument();
});

export const createMockFile = vi.fn(() => {
  return new File(['test content'], 'test.pdf', { type: 'application/pdf' });
});

// Add missing imports needed by the helper functions
import { expect } from 'vitest';

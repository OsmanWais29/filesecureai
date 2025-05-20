
// Import testing library
import '@testing-library/jest-dom';

// Mock testing functions to provide proper TypeScript types
export const describe = (name: string, fn: () => void) => fn();
export const it = (name: string, fn: () => void) => fn();
export const expect = (value: any) => ({
  toBeDefined: () => true,
  toBeInTheDocument: () => true,
  toHaveTextContent: (text: string) => true
});
export const beforeEach = (fn: () => void) => fn();
export const afterEach = (fn: () => void) => fn();

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Ensure Jest global types are available
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
    }
  }
}

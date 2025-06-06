
import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import * as testingLibrary from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Import the utilities from specific locations
import { render } from '@testing-library/react';
// Import DOM testing utilities directly from Testing Library DOM
import { screen, fireEvent, waitFor, within } from '@testing-library/dom';

// Re-export testing library components to ensure they're available in tests
export { 
  screen, 
  fireEvent, 
  waitFor, 
  within,
  render
};

expect.extend(matchers);

declare global {
  namespace Vi {
    interface Assertion extends jest.Matchers<void, any> {}
  }
}

// Mock fetch globally
global.fetch = vi.fn();

// Mock HTML Canvas element
HTMLCanvasElement.prototype.getContext = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

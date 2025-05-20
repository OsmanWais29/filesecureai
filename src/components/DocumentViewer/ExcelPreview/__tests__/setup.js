
// Configure Jest globals for tests
global.describe = jest.fn();
global.it = jest.fn();
global.expect = jest.fn();
global.beforeEach = jest.fn();
global.afterEach = jest.fn();

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

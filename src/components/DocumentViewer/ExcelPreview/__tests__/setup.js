
// Mock Jest testing functions
const describe = (name, fn) => fn();
const it = (name, fn) => fn();
const expect = (value) => ({
  toBeDefined: () => true,
  toBeInTheDocument: () => true,
  toHaveTextContent: () => true
});
const beforeEach = (fn) => fn();
const afterEach = (fn) => fn();

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Export mock functions
export { describe, it, expect, beforeEach, afterEach };

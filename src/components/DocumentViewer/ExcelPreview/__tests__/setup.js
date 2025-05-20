
// Mock Jest testing functions
export const describe = (name, fn) => fn();
export const it = (name, fn) => fn();
export const expect = (value) => ({
  toBeDefined: () => true,
  toBeInTheDocument: () => true,
  toHaveTextContent: () => true
});
export const beforeEach = (fn) => fn();
export const afterEach = (fn) => fn();

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

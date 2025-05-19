
import { vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

// Extend Vitest's expect method with testing-library methods
expect.extend(matchers);

// Export testing utilities
export { describe, expect, it, vi };

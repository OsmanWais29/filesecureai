
// Import and set up vitest globals
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Make vitest globals available
global.describe = describe;
global.it = it;
global.expect = expect;
global.vi = vi;
global.beforeEach = beforeEach;
global.afterEach = afterEach;

// Mock functions and dependencies as needed
vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        download: vi.fn().mockResolvedValue({ data: { arrayBuffer: () => new ArrayBuffer(0) }, error: null }),
        getPublicUrl: vi.fn().mockResolvedValue({ data: { publicUrl: 'https://example.com/test.xlsx' }, error: null }),
      })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockReturnThis(),
    })
  }
}));

vi.mock('xlsx', () => ({
  read: vi.fn().mockReturnValue({
    SheetNames: ['Sheet1', 'Sheet2'],
    Sheets: {
      'Sheet1': {},
      'Sheet2': {}
    }
  }),
  utils: {
    sheet_to_json: vi.fn().mockReturnValue([['Header1', 'Header2'], ['Data1', 'Data2']])
  }
}));

// Export for test files to use
export { vi, describe, it, expect, beforeEach, afterEach };

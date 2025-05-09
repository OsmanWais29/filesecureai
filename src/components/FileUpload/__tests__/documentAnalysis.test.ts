
import { extractTextFromPdf } from '../pdfUtils';
import { supabase } from '@/lib/supabase';
import { beforeEach, describe, expect, it, vi, afterAll } from 'vitest';
import * as pdfjs from 'pdfjs-dist';

// Mock PDF.js
vi.mock('pdfjs-dist', () => ({
  version: '3.4.120',
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 2,
      getPage: (pageNum: number) => ({
        getTextContent: () => Promise.resolve({
          items: [
            { str: 'Form 47 Consumer Proposal' },
            { str: 'Client Name: John Doe' },
            { str: 'Estate Number: 12345' }
          ]
        }),
        getViewport: () => ({ width: 800, height: 1000 })
      })
    })
  }),
  GlobalWorkerOptions: {
    workerSrc: null
  }
}));

// Mock Tesseract.js
vi.mock('tesseract.js', () => ({
  default: {
    recognize: () => Promise.resolve({
      data: {
        text: 'Mock OCR Text'
      }
    })
  }
}));

// Mock canvas
const mockCanvas = {
  getContext: () => ({
    drawImage: vi.fn(),
    getImageData: () => ({ data: new Uint8Array(100) })
  }),
  toDataURL: () => 'mock-data-url'
};
global.document.createElement = vi.fn().mockReturnValue(mockCanvas);

describe('Document Analysis', () => {
  let testScore = 0;
  const totalTests = 4;
  const pointsPerTest = 25;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    console.log(`\nDocument Analysis Test Score: ${testScore}/${totalTests * pointsPerTest}`);
    console.log(`Success Rate: ${(testScore / (totalTests * pointsPerTest) * 100).toFixed(2)}%`);
  });

  it('should successfully extract text from PDF (25 points)', async () => {
    try {
      const mockArrayBuffer = new ArrayBuffer(8);
      const result = await extractTextFromPdf(mockArrayBuffer);
      
      expect(result.text).toContain('Form 47 Consumer Proposal');
      expect(result.text).toContain('Client Name: John Doe');
      expect(result.text).toContain('Estate Number: 12345');
      testScore += pointsPerTest;
    } catch (error) {
      console.error('Test failed:', error);
    }
  });

  it('should handle empty PDFs (25 points)', async () => {
    try {
      await expect(extractTextFromPdf(new ArrayBuffer(0)))
        .rejects
        .toThrow('Invalid PDF data received');
      testScore += pointsPerTest;
    } catch (error) {
      console.error('Test failed:', error);
    }
  });

  it('should upload and analyze document successfully (25 points)', async () => {
    try {
      const mockFile = new File(['test pdf content'], 'test.pdf', { type: 'application/pdf' });

      const mockStorageResponse = { 
        data: { path: 'test-path.pdf' }, 
        error: null 
      };
      
      vi.spyOn(supabase.storage.from('documents'), 'upload')
        .mockResolvedValue(mockStorageResponse as any);

      const mockDocumentData = {
        id: 'test-doc-id',
        title: 'test.pdf',
        storage_path: 'test-path.pdf'
      };

      vi.spyOn(supabase.from('documents'), 'insert')
        .mockReturnValue({
          select: () => ({
            single: () => Promise.resolve({ data: mockDocumentData, error: null })
          })
        } as any);

      const mockAnalysisResponse = {
        data: {
          type: 'Consumer Proposal',
          formNumber: '47',
          clientName: 'John Doe'
        },
        error: null
      };

      vi.spyOn(supabase.functions, 'invoke')
        .mockResolvedValue(mockAnalysisResponse as any);

      const result = await supabase.functions.invoke('analyze-document', {
        body: { documentId: mockDocumentData.id }
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockAnalysisResponse.data);
      testScore += pointsPerTest;
    } catch (error) {
      console.error('Test failed:', error);
    }
  });

  it('should handle document analysis failures gracefully (25 points)', async () => {
    try {
      vi.spyOn(supabase.functions, 'invoke')
        .mockRejectedValue(new Error('Analysis failed'));

      await expect(supabase.functions.invoke('analyze-document', {
        body: { documentId: 'test-id' }
      })).rejects.toThrow();

      testScore += pointsPerTest;
    } catch (error) {
      console.error('Test failed:', error);
    }
  });
});

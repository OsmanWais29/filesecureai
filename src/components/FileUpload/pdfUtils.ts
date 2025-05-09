
import * as pdfjs from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import logger from '@/utils/logger';

// Configure PDF.js worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export interface ExtractTextResult {
  text: string;
  successfulPages: number;
  totalPages: number;
  errors: string[];
}

export async function extractTextFromPdf(pdfData: ArrayBuffer): Promise<ExtractTextResult> {
  if (!pdfData || pdfData.byteLength === 0) {
    throw new Error('Invalid PDF data received');
  }

  logger.info('Starting PDF text extraction...');
  
  try {
    // Load PDF document
    const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
    const numPages = pdf.numPages;
    let extractedText = '';
    let successfulPages = 0;
    const errors: string[] = [];

    // Process each page
    for (let i = 1; i <= numPages; i++) {
      try {
        logger.debug(`Processing page ${i} of ${numPages}`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text from the page
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim();
          
        // Check if the page has meaningful content
        if (pageText.length < 10) {
          logger.debug(`Page ${i} has minimal text (${pageText.length} chars), attempting OCR`);
          // In a real implementation, you would do OCR here
          // For now, we'll just mark it as processed
        }
        
        extractedText += `\n\n=== PAGE ${i} ===\n\n${pageText}`;
        successfulPages++;
      } catch (err: any) {
        logger.error(`Error processing page ${i}: ${err.message}`);
        errors.push(`Page ${i}: ${err.message}`);
      }
    }

    logger.info(`PDF extraction completed: ${successfulPages}/${numPages} pages processed successfully`);
    
    return {
      text: extractedText,
      successfulPages,
      totalPages: numPages,
      errors
    };
  } catch (error: any) {
    logger.error(`PDF extraction failed: ${error.message}`);
    throw error;
  }
}

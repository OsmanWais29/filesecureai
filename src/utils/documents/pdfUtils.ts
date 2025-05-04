
import * as pdfjs from 'pdfjs-dist';

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Extracts text from a PDF document with enhanced error handling
 * @param url URL of the PDF document
 * @returns Promise resolving to the extracted text
 */
export const extractTextFromPdf = async (url: string): Promise<string> => {
  console.log(`Starting PDF text extraction from: ${url}`);
  
  try {
    // Add cache-busting parameter to URL to avoid cached responses
    const cacheBustedUrl = `${url}?t=${Date.now()}`;
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument(cacheBustedUrl);
    
    // Add a reasonable timeout to avoid hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('PDF loading timeout after 30s')), 30000);
    });
    
    // Race between loading and timeout
    const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
    
    // Get the total number of pages
    const numPages = pdf.numPages;
    console.log(`PDF loaded with ${numPages} pages`);
    
    let fullText = '';
    let successfulPages = 0;
    
    // Extract text from each page with individual page error handling
    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim();
        
        // Only add non-empty pages to reduce noise
        if (pageText.length > 0) {
          fullText += pageText + ' ';
          successfulPages++;
        }
        
        console.log(`Extracted text from page ${i}/${numPages} (${pageText.length} chars)`);
      } catch (pageError) {
        console.error(`Error extracting text from page ${i}:`, pageError);
        // Continue with other pages even if one fails
      }
    }
    
    // Check if we extracted any meaningful text
    if (fullText.trim().length < 50 && successfulPages === 0) {
      console.warn('Extracted text is insufficient - trying fallback method');
      return await fallbackExtraction(url);
    }
    
    return fullText.trim();
  } catch (error: any) {
    console.error('PDF text extraction error:', error);
    
    // More specific error handling with fallbacks
    if (error.message?.includes('timeout') || 
        error.name === 'MissingPDFException' ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('network') ||
        error.message?.includes('connection')) {
      console.log('Network error during extraction, attempting fallback method...');
      return await fallbackExtraction(url);
    }
    
    throw new Error(`Failed to extract text from PDF: ${error.message || error}`);
  }
};

/**
 * Fallback extraction method with enhanced resilience
 */
const fallbackExtraction = async (url: string): Promise<string> => {
  try {
    console.log('Using fallback extraction method for:', url);
    
    // Try with a direct fetch first - fix the RequestInit type issue
    const fetchOptions: RequestInit = { 
      cache: 'no-store' as RequestCache,
      headers: { 'Cache-Control': 'no-cache' }
    };
    
    // Add retries for network resilience
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`Fallback extraction attempt ${attempts}/${maxAttempts}`);
        
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        
        let text = '';
        const numPages = pdf.numPages;
        
        for (let i = 1; i <= numPages; i++) {
          try {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item: any) => item.str).join(' ');
            text += pageText + ' ';
          } catch (pageError) {
            console.warn(`Fallback: Error extracting page ${i}`, pageError);
            // Continue with other pages
          }
        }
        
        if (text.trim().length > 0) {
          return text.trim();
        }
        
        throw new Error('Extracted empty text');
      } catch (attemptError) {
        console.warn(`Fallback attempt ${attempts} failed:`, attemptError);
        lastError = attemptError;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // If we get here, all attempts failed
    console.error('All fallback extraction attempts failed:', lastError);
    return 'PDF text extraction failed after multiple attempts. The document may be corrupted or in an unsupported format.';
  } catch (error: any) {
    console.error('Fallback extraction failed:', error);
    // Return a minimal string to prevent complete failure
    return 'PDF text extraction failed. Please try uploading the document again or contact support if the issue persists.';
  }
};

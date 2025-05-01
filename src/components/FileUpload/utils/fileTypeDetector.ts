
import { startTiming, endTiming } from "@/utils/performanceMonitor";

export const detectDocumentType = (file: File): { isForm76: boolean, isExcel: boolean, isPDF: boolean } => {
  startTiming('detect-document-type');

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  
  // Check if this is a Form 76 by filename
  const isForm76 = fileName.includes('form 76') || 
                   fileName.includes('form76') || 
                   fileName.includes('statement of affairs');
  
  // Check if this is an Excel file
  const isExcel = fileType.includes('excel') || 
                 fileType.includes('spreadsheet') ||
                 fileName.endsWith('.xls') || 
                 fileName.endsWith('.xlsx') || 
                 fileName.endsWith('.csv');
  
  // Check if this is a PDF file
  const isPDF = fileType.includes('pdf') || 
               fileName.endsWith('.pdf');

  endTiming('detect-document-type');
  
  return { isForm76, isExcel, isPDF };
};

export const getDocumentFormType = (fileName: string): string | null => {
  const lowerFileName = fileName.toLowerCase();
  
  // Form 31 - Proof of Claim
  if (lowerFileName.includes('form 31') || 
      lowerFileName.includes('form31') || 
      lowerFileName.includes('proof of claim')) {
    return 'form-31';
  }
  
  // Form 47 - Consumer Proposal
  else if (lowerFileName.includes('form 47') || 
           lowerFileName.includes('form47') || 
           lowerFileName.includes('consumer proposal')) {
    return 'form-47';
  }
  
  // Form 76 - Statement of Affairs
  else if (lowerFileName.includes('form 76') || 
           lowerFileName.includes('form76') || 
           lowerFileName.includes('statement of affairs')) {
    return 'form-76';
  }
  
  // No match
  return null;
};


import { startTiming, endTiming } from "@/utils/performanceMonitor";

export const detectDocumentType = (file: File): { isForm76: boolean, isForm47: boolean, isForm31: boolean, isExcel: boolean, isPDF: boolean } => {
  startTiming('detect-document-type');

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  
  // Check for specific forms by filename
  const isForm76 = fileName.includes('form 76') || 
                  fileName.includes('form76') || 
                  fileName.includes('statement of affairs');
                  
  const isForm47 = fileName.includes('form 47') || 
                  fileName.includes('form47') || 
                  fileName.includes('consumer proposal');
                  
  const isForm31 = fileName.includes('form 31') || 
                  fileName.includes('form31') || 
                  fileName.includes('proof of claim');
  
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
  console.log(`File detection results: isForm76=${isForm76}, isForm47=${isForm47}, isForm31=${isForm31}, isExcel=${isExcel}, isPDF=${isPDF}`);
  
  return { isForm76, isForm47, isForm31, isExcel, isPDF };
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

  // Form 21 - Assignment for General Benefit of Creditors
  else if (lowerFileName.includes('form 21') || 
           lowerFileName.includes('form21') || 
           lowerFileName.includes('assignment for') || 
           lowerFileName.includes('general benefit')) {
    return 'form-21';
  }
  
  // Form 33 - Statement of Receipts and Disbursements
  else if (lowerFileName.includes('form 33') || 
           lowerFileName.includes('form33') || 
           lowerFileName.includes('receipts and disbursements')) {
    return 'form-33';
  }
  
  // Form 40 - Trustee's Preliminary Report
  else if (lowerFileName.includes('form 40') || 
           lowerFileName.includes('form40') || 
           lowerFileName.includes('preliminary report')) {
    return 'form-40';
  }
  
  // No match
  return null;
};

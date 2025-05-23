
import { toString } from '@/utils/typeSafetyUtils';

export const getDocumentType = (document: any): string => {
  const storagePath = toString(document?.storage_path);
  const title = toString(document?.title);
  const type = toString(document?.type);
  
  if (!storagePath && !title && !type) {
    return 'unknown';
  }

  // Check file extension first
  if (storagePath) {
    const extension = storagePath.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'xlsx':
      case 'xls':
        return 'excel';
      case 'docx':
      case 'doc':
        return 'word';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      default:
        break;
    }
  }

  // Check title for form indicators
  const titleLower = toString(title).toLowerCase();
  const typeUrl = toString(type).toLowerCase();
  
  if (titleLower.includes('form') || typeUrl.includes('form')) {
    if (titleLower.includes('47') || typeUrl.includes('47')) {
      return 'form-47';
    }
    return 'form';
  }

  // Return the explicit type if available, otherwise 'document'
  return type || 'document';
};

export const isFormDocument = (document: any): boolean => {
  const docType = getDocumentType(document);
  return docType.startsWith('form');
};

export const isDocumentForm47 = (document: any): boolean => {
  const docType = getDocumentType(document);
  return docType === 'form-47';
};

export const getFormNumber = (document: any): string | null => {
  const title = toString(document?.title);
  const type = toString(document?.type);
  
  // Look for form number patterns
  const formNumberPattern = /form[\s-]?(\d+)/i;
  
  let match = title.match(formNumberPattern);
  if (match) {
    return match[1];
  }
  
  match = type.match(formNumberPattern);
  if (match) {
    return match[1];
  }
  
  return null;
};

export const getDocumentIcon = (document: any): string => {
  const docType = getDocumentType(document);
  
  switch (docType) {
    case 'pdf':
      return '📄';
    case 'excel':
      return '📊';
    case 'word':
      return '📝';
    case 'image':
      return '🖼️';
    case 'form-47':
      return '📋';
    case 'form':
      return '📑';
    default:
      return '📄';
  }
};

export const validateFormDocument = (document: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const title = toString(document?.title);
  const storagePath = toString(document?.storage_path);
  
  if (!title) {
    errors.push('Document title is required');
  }
  
  if (!storagePath) {
    errors.push('Document storage path is required');
  }
  
  const formNumber = getFormNumber(document);
  if (isFormDocument(document) && !formNumber) {
    errors.push('Form number could not be determined');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

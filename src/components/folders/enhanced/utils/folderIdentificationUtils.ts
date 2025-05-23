
import { Document } from "@/types/client";
import { FolderStructure } from "@/types/folders";

export const isDocumentForm47 = (document: Document): boolean => {
  const title = document.title?.toLowerCase() || '';
  const metadata = document.metadata as any;
  return title.includes('form 47') || 
         title.includes('consumer proposal') ||
         metadata?.form_number === '47';
};

export const isDocumentForm76 = (document: Document): boolean => {
  const title = document.title?.toLowerCase() || '';
  const metadata = document.metadata as any;
  return title.includes('form 76') || 
         title.includes('statement of affairs') ||
         metadata?.form_number === '76';
};

export const isFinancialDocument = (document: Document): boolean => {
  const title = document.title?.toLowerCase() || '';
  const type = document.type?.toLowerCase() || '';
  return title.includes('financial') || 
         title.includes('income') ||
         title.includes('expense') ||
         type.includes('financial');
};

export const extractClientName = (document: Document): string | null => {
  const metadata = document.metadata as any;
  return metadata?.client_name || metadata?.debtor_name || null;
};

export const findAppropriateSubfolder = (document: Document, folders: FolderStructure[]): FolderStructure | null => {
  if (isDocumentForm47(document)) {
    return folders.find(f => f.name.toLowerCase().includes('form 47') || f.name.toLowerCase().includes('consumer proposal')) || null;
  }
  
  if (isDocumentForm76(document)) {
    return folders.find(f => f.name.toLowerCase().includes('form 76') || f.name.toLowerCase().includes('statement of affairs')) || null;
  }
  
  if (isFinancialDocument(document)) {
    return folders.find(f => f.name.toLowerCase().includes('financial') || f.name.toLowerCase().includes('income')) || null;
  }
  
  return null;
};

export const generateFolderRecommendations = (document: Document, folders: FolderStructure[]) => {
  const suggestedFolder = findAppropriateSubfolder(document, folders);
  const clientName = extractClientName(document);
  
  if (!suggestedFolder) {
    return null;
  }
  
  return {
    id: `rec_${document.id}`,
    type: 'organize' as const,
    title: `Move ${document.title} to ${suggestedFolder.name}`,
    description: `This document appears to be a ${isDocumentForm47(document) ? 'Form 47' : isDocumentForm76(document) ? 'Form 76' : 'financial'} document`,
    confidence: 0.8,
    documentId: document.id,
    suggestedFolderId: suggestedFolder.id,
    documentTitle: document.title,
    folderPath: [suggestedFolder.name],
    reason: `Document type matches folder category`
  };
};

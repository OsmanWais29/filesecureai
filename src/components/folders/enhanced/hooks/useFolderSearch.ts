
import { useMemo } from 'react';
import { Document } from '@/types/client';

export function useFolderSearch(documents: Document[], searchTerm: string) {
  const filteredDocuments = useMemo(() => {
    if (!searchTerm.trim()) {
      return documents;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    
    return documents.filter(doc => {
      const titleMatch = doc.title?.toLowerCase().includes(lowercaseSearch);
      const typeMatch = doc.type?.toLowerCase().includes(lowercaseSearch);
      const descriptionMatch = doc.description?.toLowerCase().includes(lowercaseSearch);
      
      return titleMatch || typeMatch || descriptionMatch;
    });
  }, [documents, searchTerm]);

  return {
    filteredDocuments,
    hasResults: filteredDocuments.length > 0,
    resultCount: filteredDocuments.length
  };
}


import { useState, useEffect, useMemo } from 'react';
import { useDocuments } from './useDocuments';
import { Document } from '../types';

export function useDocumentsWithSearch() {
  const { documents, isLoading, error, refetch } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Debounce search query to avoid unnecessary filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Memoize filtered documents to avoid unnecessary re-renders
  const filteredDocuments = useMemo(() => {
    if (!debouncedSearchQuery) return documents;
    
    return documents.filter(doc => {
      const title = doc.title?.toLowerCase() || '';
      const type = doc.type?.toLowerCase() || '';
      const clientName = doc.metadata && typeof doc.metadata === 'object' && 
                         doc.metadata.client_name ? 
                         doc.metadata.client_name.toLowerCase() : '';
      
      const searchLower = debouncedSearchQuery.toLowerCase();
      
      return title.includes(searchLower) || 
             type.includes(searchLower) || 
             (clientName && clientName.includes(searchLower));
    });
  }, [documents, debouncedSearchQuery]);
  
  return {
    documents: filteredDocuments,
    isLoading,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    allDocuments: documents // Original documents for reference
  };
}


import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { convertDocumentArray } from '@/utils/typeGuards';
import { Document } from '@/types/client';

export const RecentlyAccessedPage = () => {
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentlyAccessed();
  }, []);

  const loadRecentlyAccessed = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('document_access_history')
        .select(`
          document_id,
          accessed_at,
          documents (*)
        `)
        .eq('user_id', user.id)
        .order('accessed_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const documents = data
        ?.map(item => item.documents)
        .filter(Boolean) || [];
      
      const safeDocuments = convertDocumentArray(documents);
      setRecentDocuments(safeDocuments);
    } catch (error) {
      console.error('Error loading recent documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackAccess = async (documentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('document_access_history')
        .insert({
          document_id: documentId,
          user_id: user.id,
          accessed_at: new Date().toISOString(),
          session_id: generateSessionId(),
          access_source: 'web'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking access:', error);
    }
  };

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading recent documents...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Recently Accessed Documents</h1>
      
      {recentDocuments.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No recently accessed documents found.
        </div>
      ) : (
        <div className="grid gap-4">
          {recentDocuments.map(document => (
            <div 
              key={document.id}
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => trackAccess(document.id)}
            >
              <h3 className="font-medium">{document.title}</h3>
              <p className="text-sm text-muted-foreground">
                Type: {document.type || 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(document.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentlyAccessedPage;

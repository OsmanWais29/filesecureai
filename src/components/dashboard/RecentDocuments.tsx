
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  title: string;
  type: string;
  created_at: string;
  storage_path: string;
  user_id: string;
  metadata?: {
    clientName?: string;
  };
}

interface RecentDocumentsProps {
  onDocumentSelect: (documentId: string) => void;
}

export const RecentDocuments: React.FC<RecentDocumentsProps> = ({ onDocumentSelect }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentDocuments();
    
    // Set up real-time subscription for new documents
    const subscription = supabase
      .channel('recent-documents')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'documents',
          filter: 'is_folder=eq.false'
        },
        () => {
          // Refresh the list when new documents are added
          fetchRecentDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchRecentDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_folder', false)
        .not('storage_path', 'is', null) // Only show documents with actual files
        .order('created_at', { ascending: false })
        .limit(10); // Increased from 5 to 10 for better visibility

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      // Properly type the response data
      const typedDocuments: Document[] = (data || []).map(doc => ({
        id: String(doc.id),
        title: String(doc.title),
        type: String(doc.type || 'document'),
        created_at: String(doc.created_at),
        storage_path: String(doc.storage_path || ''),
        user_id: String(doc.user_id),
        metadata: doc.metadata as { clientName?: string } || {}
      }));

      setDocuments(typedDocuments);
    } catch (error) {
      console.error('Error in fetchRecentDocuments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No recent documents found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Upload your first document to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <Card 
          key={document.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onDocumentSelect(document.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm truncate">
                    {document.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                    </div>
                    {document.metadata?.clientName && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="h-3 w-3 mr-1" />
                        {document.metadata.clientName}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Status: {document.storage_path ? 'Ready' : 'Processing...'}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDocumentSelect(document.id);
                }}
              >
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

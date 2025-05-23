
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentGrid } from '../DocumentGrid/DocumentGrid';
import { FilePreview } from './FilePreview/FilePreviewPanel';
import { Client, Document } from '../../types';

interface MobileTabletViewProps {
  client: Client;
  documents: Document[];
  selectedDocumentId: string;
  onDocumentSelect: (documentId: string) => void;
}

export const MobileTabletView: React.FC<MobileTabletViewProps> = ({
  client,
  documents,
  selectedDocumentId,
  onDocumentSelect
}) => {
  const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);

  return (
    <div className="p-4">
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{client.name} - Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentGrid 
                documents={documents}
                onDocumentSelect={onDocumentSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          {selectedDocument ? (
            <FilePreview 
              fileName={selectedDocument.title}
              fileType={selectedDocument.type || 'document'}
              fileSize={selectedDocument.size || 0}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Select a document to preview
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

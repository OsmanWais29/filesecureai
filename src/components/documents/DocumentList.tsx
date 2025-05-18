
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Document } from "@/components/DocumentList/types";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean; 
  onDocumentDoubleClick: (documentId: string) => void;
}

export const DocumentList = ({ documents, isLoading, onDocumentDoubleClick }: DocumentListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse h-[200px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <Card 
          key={doc.id} 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onDoubleClick={() => onDocumentDoubleClick(doc.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium truncate" title={doc.title}>
                  {doc.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {doc.size && (doc.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="mt-1"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

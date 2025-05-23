
import { CollaborationPanel } from "@/components/DocumentViewer/CollaborationPanel";
import { Document } from "../../types";
import { toString } from "@/utils/typeSafetyUtils";

interface CommentsTabProps {
  document: Document;
  effectiveDocumentId: string;
}

export const CommentsTab: React.FC<CommentsTabProps> = ({
  document,
  effectiveDocumentId,
}) => {
  return (
    <CollaborationPanel 
      document={{
        id: effectiveDocumentId,
        title: document.title,
        type: document.type || 'document',
        storage_path: toString(document.metadata?.storage_path),
        comments: [],
        // Add the missing required properties
        created_at: document.created_at,
        updated_at: document.updated_at
      }}
      onCommentAdded={() => console.log('Comment added')}
    />
  );
};

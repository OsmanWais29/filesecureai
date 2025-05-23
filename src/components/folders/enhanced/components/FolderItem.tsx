
import React, { useState } from "react";
import { FolderStructure } from "@/types/folders";
import { Document } from "@/types/client";
import { convertDocumentArray } from "@/utils/typeGuards";
import { FolderIcon } from "./folder/FolderIcon";
import { FolderNameEditor } from "./folder/FolderNameEditor";
import { FolderActions } from "./folder/FolderActions";
import { FolderStatusIndicator } from "./folder/FolderStatusIndicator";
import { DocumentItem } from "./documents/DocumentItem";

interface FolderItemProps {
  folder: FolderStructure;
  documents: any[];
  onFolderSelect: (folderId: string) => void;
  onDocumentSelect: (documentId: string) => void;
  onDocumentOpen: (documentId: string) => void;
  onRenameDocument: (document: Document) => void;
  level?: number;
}

export const FolderItem = ({ 
  folder, 
  documents, 
  onFolderSelect, 
  onDocumentSelect, 
  onDocumentOpen,
  onRenameDocument, 
  level = 0 
}: FolderItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Convert raw documents to safe client documents
  const safeDocuments = convertDocumentArray(documents);
  
  // Filter documents for this folder
  const folderDocuments = safeDocuments.filter(doc => 
    doc.parent_folder_id === folder.id
  );

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onFolderSelect(folder.id);
  };

  const indentLevel = level * 20;

  return (
    <div className="folder-item">
      <div 
        className="flex items-center p-2 hover:bg-muted/50 cursor-pointer group"
        style={{ paddingLeft: `${indentLevel + 8}px` }}
        onClick={handleToggle}
      >
        <FolderIcon 
          isExpanded={isExpanded}
          type={folder.type}
        />
        
        {isEditing ? (
          <FolderNameEditor
            name={folder.name}
            onSave={(newName) => {
              // Handle folder rename
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <span className="ml-2 flex-1 text-sm font-medium">
            {folder.name}
          </span>
        )}
        
        <FolderStatusIndicator folder={folder} />
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <FolderActions
            folder={folder}
            onRename={() => setIsEditing(true)}
            onDelete={() => {
              // Handle folder delete
            }}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="ml-4">
          {/* Render child folders */}
          {folder.children?.map(childFolder => (
            <FolderItem
              key={childFolder.id}
              folder={childFolder}
              documents={safeDocuments}
              onFolderSelect={onFolderSelect}
              onDocumentSelect={onDocumentSelect}
              onDocumentOpen={onDocumentOpen}
              onRenameDocument={onRenameDocument}
              level={level + 1}
            />
          ))}
          
          {/* Render documents in this folder */}
          {folderDocuments.map(document => (
            <DocumentItem
              key={document.id}
              document={document}
              onOpen={onDocumentOpen}
              onRename={onRenameDocument}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

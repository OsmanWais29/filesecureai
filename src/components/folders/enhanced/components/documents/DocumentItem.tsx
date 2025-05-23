
import React, { useState } from 'react';
import { Document } from '@/types/client';
import { FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItemProps {
  document: Document;
  onOpen: (documentId: string) => void;
  onRename: (document: Document) => void;
  level?: number;
  onSelect?: (documentId: string) => void;
  handleDragStart?: (id: string, type: 'folder' | 'document') => void;
  indentation?: React.ReactElement[];
}

export const DocumentItem = ({
  document,
  onOpen,
  onRename,
  level = 0,
  onSelect,
  handleDragStart,
  indentation = []
}: DocumentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(document.title);

  const handleClick = () => {
    if (onSelect) {
      onSelect(document.id);
    } else {
      onOpen(document.id);
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleRename = () => {
    onRename({ ...document, title: newName });
    setIsEditing(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (handleDragStart) {
      handleDragStart(document.id, 'document');
    }
  };

  const getStatusIcon = () => {
    if (document.ai_processing_status === 'processing') {
      return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (document.status === 'approved') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (document.metadata?.has_errors) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const indentLevel = level * 20;

  return (
    <div 
      className={cn(
        "flex items-center p-2 hover:bg-muted/50 cursor-pointer group",
        document.metadata?.has_errors && "bg-red-50 border-l-2 border-red-400"
      )}
      style={{ paddingLeft: `${indentLevel + 8}px` }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      draggable={!!handleDragStart}
      onDragStart={handleDragStart ? handleDragStart : undefined}
    >
      {/* Render indentation elements */}
      {indentation.map((indent, index) => (
        <React.Fragment key={index}>{indent}</React.Fragment>
      ))}

      <div className="flex-shrink-0 mr-3">
        {getStatusIcon()}
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="w-full px-2 py-1 border rounded text-sm"
            autoFocus
          />
        ) : (
          <div className="truncate">
            <span className="text-sm">{document.title}</span>
            {document.size && (
              <span className="text-xs text-gray-500 ml-2">
                ({Math.round(document.size / 1024)}KB)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

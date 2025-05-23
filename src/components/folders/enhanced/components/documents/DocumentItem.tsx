
import React, { useState } from 'react';
import { Document } from '@/types/client';
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { DocumentContextMenu } from './DocumentContextMenu';
import { DocumentActions } from './DocumentActions';
import { isForm47or76, documentNeedsAttention, isDocumentLocked } from '../../utils/documentUtils';

interface DocumentItemProps {
  document: Document;
  indentation: React.ReactNode[];
  onSelect: (documentId: string) => void;
  onOpen: (documentId: string) => void;
  handleDragStart: (id: string, type: 'folder' | 'document') => void;
}

export const DocumentItem = ({
  document,
  indentation,
  onSelect,
  onOpen,
  handleDragStart
}: DocumentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(document.title);

  const needsAttention = documentNeedsAttention(document);
  const isLocked = isDocumentLocked(document);
  const isForm47or76Doc = isForm47or76(document);

  const handleClick = () => {
    onSelect(document.id);
  };

  const handleDoubleClick = () => {
    if (!isLocked) {
      setIsEditing(true);
    }
  };

  const handleRename = (updatedName: string) => {
    console.log(`Renamed document ${document.id} to ${updatedName}`);
    setNewName(updatedName);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNewName(document.title);
  };

  const getStatusIcon = () => {
    if (needsAttention) {
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
    if (document.metadata?.status === 'approved') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (document.ai_processing_status === 'processing') {
      return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="flex items-center">
      {indentation}
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              "flex items-center w-full py-2 px-3 rounded-md cursor-pointer group hover:bg-gray-100 transition-colors",
              needsAttention && "bg-amber-50 border-l-2 border-amber-400",
              isForm47or76Doc && "font-medium"
            )}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            draggable={!isLocked}
            onDragStart={() => handleDragStart(document.id, 'document')}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0 mr-3">
              {getStatusIcon()}
            </div>

            {/* Document Name */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => handleRename(newName)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRename(newName);
                    } else if (e.key === 'Escape') {
                      cancelEditing();
                    }
                  }}
                  className="w-full px-2 py-1 border rounded text-sm"
                  autoFocus
                />
              ) : (
                <div className="truncate">
                  <span className={cn(
                    "text-sm",
                    isForm47or76Doc && "font-semibold text-blue-900",
                    needsAttention && "text-amber-900"
                  )}>
                    {document.title}
                  </span>
                  {document.size && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({formatFileSize(document.size)})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 ml-2">
              <DocumentActions
                document={document}
                onOpen={onOpen}
                onRename={() => setIsEditing(true)}
              />
            </div>

            {/* Locked Indicator */}
            {isLocked && (
              <div className="flex-shrink-0 ml-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" title="Document is locked" />
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        
        <DocumentContextMenu
          document={document}
          onOpen={onOpen}
          onRename={() => setIsEditing(true)}
        />
      </ContextMenu>
    </div>
  );
};

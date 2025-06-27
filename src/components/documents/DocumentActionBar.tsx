
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Merge, 
  Trash2, 
  RotateCcw, 
  ArrowUpDown,
  MoreHorizontal,
  FileX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface DocumentActionBarProps {
  selectedDocuments: string[];
  onEdit: (documentId: string) => void;
  onMerge: (documentIds: string[]) => void;
  onDelete: (documentIds: string[]) => void;
  onRecover: (documentIds: string[]) => void;
  onReorder: () => void;
  disabled?: boolean;
}

export const DocumentActionBar = ({
  selectedDocuments,
  onEdit,
  onMerge,
  onDelete,
  onRecover,
  onReorder,
  disabled = false
}: DocumentActionBarProps) => {
  const hasSelection = selectedDocuments.length > 0;
  const hasMultipleSelection = selectedDocuments.length > 1;
  const hasSingleSelection = selectedDocuments.length === 1;

  const handleAction = (action: () => void, actionName: string) => {
    if (disabled) {
      toast.error(`Cannot ${actionName} - operation in progress`);
      return;
    }
    action();
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
      <div className="flex items-center gap-1">
        {/* Edit - Single selection only */}
        <Button
          size="sm"
          variant="ghost"
          disabled={!hasSingleSelection || disabled}
          onClick={() => handleAction(() => onEdit(selectedDocuments[0]), 'edit')}
          title="Edit document name"
        >
          <Edit className="h-4 w-4" />
        </Button>

        {/* Merge - Multiple selection only */}
        <Button
          size="sm"
          variant="ghost"
          disabled={!hasMultipleSelection || disabled}
          onClick={() => handleAction(() => onMerge(selectedDocuments), 'merge documents')}
          title="Merge selected documents"
        >
          <Merge className="h-4 w-4" />
        </Button>

        {/* Delete - Any selection */}
        <Button
          size="sm"
          variant="ghost"
          disabled={!hasSelection || disabled}
          onClick={() => handleAction(() => onDelete(selectedDocuments), 'delete')}
          title="Delete selected documents"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {/* Recover - Any selection */}
        <Button
          size="sm"
          variant="ghost"
          disabled={!hasSelection || disabled}
          onClick={() => handleAction(() => onRecover(selectedDocuments), 'recover')}
          title="Recover selected documents"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        {/* Reorder */}
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => handleAction(onReorder, 'reorder')}
          title="Adjust document order"
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" disabled={disabled}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              disabled={!hasSingleSelection}
              onClick={() => onEdit(selectedDocuments[0])}
            >
              <Edit className="h-4 w-4 mr-2" />
              Rename Document
            </DropdownMenuItem>
            <DropdownMenuItem 
              disabled={!hasMultipleSelection}
              onClick={() => onMerge(selectedDocuments)}
            >
              <Merge className="h-4 w-4 mr-2" />
              Merge Documents
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              disabled={!hasSelection}
              onClick={() => onDelete(selectedDocuments)}
              className="text-destructive focus:text-destructive"
            >
              <FileX className="h-4 w-4 mr-2" />
              Delete Selected
            </DropdownMenuItem>
            <DropdownMenuItem 
              disabled={!hasSelection}
              onClick={() => onRecover(selectedDocuments)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Recover Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasSelection && (
        <div className="text-sm text-muted-foreground">
          {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

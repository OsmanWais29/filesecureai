
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GripVertical, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  title: string;
  type?: string;
}

interface DocumentReorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: Document[];
  onReorder: (reorderedDocuments: Document[]) => void;
}

export const DocumentReorderDialog = ({
  open,
  onOpenChange,
  documents,
  onReorder
}: DocumentReorderDialogProps) => {
  const [reorderedDocs, setReorderedDocs] = useState<Document[]>(documents);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setReorderedDocs(documents);
  }, [documents]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newDocs = [...reorderedDocs];
    const draggedDoc = newDocs[draggedIndex];
    
    // Remove dragged item
    newDocs.splice(draggedIndex, 1);
    
    // Insert at new position
    newDocs.splice(index, 0, draggedDoc);
    
    setReorderedDocs(newDocs);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    onReorder(reorderedDocs);
    onOpenChange(false);
    toast.success('Document order updated successfully');
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newDocs = [...reorderedDocs];
    [newDocs[index], newDocs[index - 1]] = [newDocs[index - 1], newDocs[index]];
    setReorderedDocs(newDocs);
  };

  const moveDown = (index: number) => {
    if (index === reorderedDocs.length - 1) return;
    const newDocs = [...reorderedDocs];
    [newDocs[index], newDocs[index + 1]] = [newDocs[index + 1], newDocs[index]];
    setReorderedDocs(newDocs);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reorder Documents</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-96 py-4">
          <div className="space-y-2">
            {reorderedDocs.map((doc, index) => (
              <div
                key={doc.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-3 p-3 border rounded-md bg-card hover:bg-accent/50 cursor-move"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.title}</p>
                  {doc.type && (
                    <p className="text-sm text-muted-foreground">{doc.type}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveDown(index)}
                    disabled={index === reorderedDocs.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    ↓
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface EditDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentName: string;
  onSave: (newName: string) => void;
}

export const EditDocumentDialog = ({
  open,
  onOpenChange,
  documentName,
  onSave
}: EditDocumentDialogProps) => {
  const [newName, setNewName] = useState(documentName);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setNewName(documentName);
  }, [documentName]);

  const handleSave = async () => {
    if (!newName.trim()) {
      toast.error('Document name cannot be empty');
      return;
    }

    if (newName === documentName) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(newName.trim());
      onOpenChange(false);
      toast.success('Document renamed successfully');
    } catch (error) {
      toast.error('Failed to rename document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Document</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="document-name">Document Name</Label>
            <Input
              id="document-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter document name"
              disabled={isLoading}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !newName.trim()}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

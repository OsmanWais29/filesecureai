
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle } from 'lucide-react';

interface DuplicateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  existingDocument: any;
  onAction: (action: 'replace' | 'keep_both' | 'cancel') => void;
}

export const DuplicateDialog = ({
  isOpen,
  onClose,
  fileName,
  existingDocument,
  onAction
}: DuplicateDialogProps) => {
  const [selectedAction, setSelectedAction] = useState<'replace' | 'keep_both' | null>(null);

  const handleConfirm = () => {
    if (selectedAction) {
      onAction(selectedAction);
      onClose();
    }
  };

  const handleCancel = () => {
    onAction('cancel');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Duplicate File Detected
          </DialogTitle>
          <DialogDescription>
            A file with the same name already exists in your documents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="flex-1">
              <p className="font-medium text-sm">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                Originally uploaded: {new Date(existingDocument?.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">What would you like to do?</p>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="duplicate-action"
                  value="replace"
                  checked={selectedAction === 'replace'}
                  onChange={() => setSelectedAction('replace')}
                  className="text-primary"
                />
                <div>
                  <p className="text-sm font-medium">Replace existing file</p>
                  <p className="text-xs text-muted-foreground">
                    Create a new version and set it as current
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="duplicate-action"
                  value="keep_both"
                  checked={selectedAction === 'keep_both'}
                  onChange={() => setSelectedAction('keep_both')}
                  className="text-primary"
                />
                <div>
                  <p className="text-sm font-medium">Keep both files</p>
                  <p className="text-xs text-muted-foreground">
                    Upload as a separate document
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedAction}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

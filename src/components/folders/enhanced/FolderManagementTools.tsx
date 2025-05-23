
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderPlus, Upload, Download, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClientFolder, createFolderIfNotExists } from '@/utils/documents/folder-utils/createFolder';

interface FolderManagementToolsProps {
  onFolderCreated?: () => void;
  currentFolderId?: string;
}

export const FolderManagementTools: React.FC<FolderManagementToolsProps> = ({
  onFolderCreated,
  currentFolderId
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderType, setFolderType] = useState('general');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      let result;
      
      if (folderType === 'client') {
        result = await createClientFolder(newFolderName, currentFolderId);
      } else {
        result = await createFolderIfNotExists(newFolderName, folderType, currentFolderId);
      }

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Folder created successfully"
        });
        setNewFolderName('');
        setIsCreateDialogOpen(false);
        onFolderCreated?.();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create folder",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleExportFolders = () => {
    toast({
      title: "Export",
      description: "Export functionality coming soon"
    });
  };

  const handleImportFolders = () => {
    toast({
      title: "Import",
      description: "Import functionality coming soon"
    });
  };

  const handleFolderSettings = () => {
    toast({
      title: "Settings",
      description: "Folder settings coming soon"
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <FolderPlus className="h-4 w-4" />
            New Folder
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Folder Name</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Folder Type</label>
              <Select value={folderType} onValueChange={setFolderType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Folder'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={handleExportFolders}
      >
        <Download className="h-4 w-4" />
        Export
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={handleImportFolders}
      >
        <Upload className="h-4 w-4" />
        Import
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={handleFolderSettings}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>
    </div>
  );
};

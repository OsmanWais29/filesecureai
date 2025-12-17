import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { createClientFolder } from "@/utils/documents/folder-utils/createFolder";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string | null;
  clientName?: string;
}

const FOLDER_TYPES = [
  { value: "general", label: "General Documents" },
  { value: "financials", label: "Financial Records" },
  { value: "forms", label: "OSB Forms" },
  { value: "correspondence", label: "Correspondence" },
  { value: "legal", label: "Legal Documents" },
  { value: "creditors", label: "Creditor Documents" },
];

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  open,
  onOpenChange,
  clientId,
  clientName,
}) => {
  const [folderName, setFolderName] = useState("");
  const [folderType, setFolderType] = useState("general");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    if (!clientId) {
      toast.error("No client selected");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createClientFolder(folderName.trim(), clientId);
      
      if (result.success) {
        toast.success(`Folder "${folderName}" created successfully`);
        setFolderName("");
        setFolderType("general");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFolderName("");
    setFolderType("general");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create New Folder
          </DialogTitle>
          <DialogDescription>
            {clientName 
              ? `Create a new folder for ${clientName}`
              : "Create a new document folder"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              placeholder="e.g., Tax Documents 2024"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                }
              }}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="folderType">Folder Type</Label>
            <Select value={folderType} onValueChange={setFolderType}>
              <SelectTrigger>
                <SelectValue placeholder="Select folder type" />
              </SelectTrigger>
              <SelectContent>
                {FOLDER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !folderName.trim()}>
            {isCreating ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

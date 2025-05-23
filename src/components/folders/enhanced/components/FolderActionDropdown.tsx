
import { MoreHorizontal, FolderUp, Edit, Trash2, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/folders";

interface FolderActionDropdownProps {
  selectedFolderId?: string;
  hasWriteAccess: boolean;
  userRole: UserRole;
  onRefresh: () => void;
}

export const FolderActionDropdown = ({
  selectedFolderId,
  hasWriteAccess,
  userRole,
  onRefresh,
}: FolderActionDropdownProps) => {
  const handleRenameFolderClick = () => {
    console.log("Rename folder", selectedFolderId);
  };

  const handleDeleteFolderClick = () => {
    console.log("Delete folder", selectedFolderId);
  };

  const handleMoveFolderClick = () => {
    console.log("Move folder", selectedFolderId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Folder Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {hasWriteAccess && selectedFolderId && (
          <>
            <DropdownMenuItem onClick={handleRenameFolderClick}>
              <Edit className="h-4 w-4 mr-2" />
              Rename Folder
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleMoveFolderClick}>
              <FolderUp className="h-4 w-4 mr-2" />
              Move Folder
            </DropdownMenuItem>
            
            {(userRole === 'admin' || userRole === 'administrator') && (
              <DropdownMenuItem onClick={handleDeleteFolderClick}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Folder
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderCardProps {
  folder: any;
  onFolderSelect: (folderId: string) => void;
}

export const FolderCard = ({ folder, onFolderSelect }: FolderCardProps) => {
  const [clientName, setClientName] = useState<string | null>(null);

  useEffect(() => {
    // Use safe access for metadata.client_name with optional chaining
    const clientName = folder.metadata?.client_name;

    if (clientName) {
      setClientName(clientName);
    } else if (folder.title === 'Uncategorized') {
      setClientName('Uncategorized');
    }
  }, [folder]);

  return (
    <Card
      className={cn(
        "cursor-pointer hover:bg-secondary",
        folder.title === 'Uncategorized' ? 'bg-accent' : 'bg-card'
      )}
      onClick={() => onFolderSelect(folder.id)}
    >
      <CardContent className="flex items-center space-x-4 p-3">
        <Folder className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <h3 className="text-sm font-medium truncate">{clientName || folder.title}</h3>
          <p className="text-xs text-muted-foreground">Folder</p>
        </div>
      </CardContent>
    </Card>
  );
};

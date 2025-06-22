
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { History, Clock, User, CheckCircle } from 'lucide-react';
import { getDocumentVersions, restoreDocumentVersion, type DocumentVersion } from '@/components/FileUpload/utils/documentVersioning';
import { useToast } from '@/hooks/use-toast';

interface VersionToggleProps {
  documentId: string;
  onVersionChange?: (versionId: string, storagePath: string) => void;
}

export const VersionToggle = ({ documentId, onVersionChange }: VersionToggleProps) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<DocumentVersion | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadVersions();
  }, [documentId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const versionList = await getDocumentVersions(documentId);
      setVersions(versionList);
      
      const current = versionList.find(v => v.is_current);
      setCurrentVersion(current || null);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionSelect = async (version: DocumentVersion) => {
    try {
      if (version.is_current) return;

      const result = await restoreDocumentVersion(documentId, version.id);
      
      if (result.success) {
        toast({
          title: "Version Restored",
          description: `Switched to version ${version.version_number}`
        });
        
        setCurrentVersion(version);
        
        // Notify parent component of version change
        if (onVersionChange) {
          onVersionChange(version.id, version.storage_path);
        }
        
        // Reload versions to update current status
        await loadVersions();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to restore version"
        });
      }
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore version"
      });
    }
  };

  if (versions.length <= 1) {
    return null; // Don't show if there's only one version
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Version {currentVersion?.version_number || 1}
          {versions.length > 1 && (
            <span className="text-xs text-muted-foreground">
              ({versions.length} total)
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <h4 className="font-medium text-sm mb-2">Document Versions</h4>
          
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading versions...</div>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {versions.map((version) => (
                <DropdownMenuItem
                  key={version.id}
                  onClick={() => handleVersionSelect(version)}
                  className="flex items-start gap-3 p-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      {version.is_current && <CheckCircle className="h-3 w-3 text-green-500" />}
                      <span className="font-medium text-sm">
                        v{version.version_number}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {version.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(version.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

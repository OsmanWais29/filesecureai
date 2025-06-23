
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { History, Clock, User, CheckCircle, GitBranch, AlertTriangle } from 'lucide-react';
import { FileVersioningService, DocumentVersion } from '@/services/FileVersioningService';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface EnhancedVersionToggleProps {
  documentId: string;
  onVersionChange?: (versionId: string, storagePath: string) => void;
}

export const EnhancedVersionToggle = ({ documentId, onVersionChange }: EnhancedVersionToggleProps) => {
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
      const versionList = await FileVersioningService.getVersionHistory(documentId);
      setVersions(versionList);
      
      const current = versionList.find(v => v.isCurrent);
      setCurrentVersion(current || null);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionSwitch = async (version: DocumentVersion) => {
    try {
      if (version.isCurrent) return;

      const result = await FileVersioningService.switchToVersion(documentId, version.id);
      
      if (result.success) {
        toast({
          title: "Version Switched",
          description: `Now viewing version ${version.versionNumber}`
        });
        
        setCurrentVersion(version);
        
        // Notify parent component
        if (onVersionChange) {
          onVersionChange(version.id, version.storagePath);
        }
        
        // Reload to update current status
        await loadVersions();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to switch version"
        });
      }
    } catch (error) {
      console.error('Error switching version:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to switch version"
      });
    }
  };

  const handleDeleteVersion = async (versionId: string, versionNumber: number) => {
    try {
      const result = await FileVersioningService.deleteVersion(versionId);
      
      if (result.success) {
        toast({
          title: "Version Deleted",
          description: `Version ${versionNumber} has been removed`
        });
        
        await loadVersions();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete version"
        });
      }
    } catch (error) {
      console.error('Error deleting version:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (versions.length <= 1) {
    return (
      <Button variant="outline" size="sm" className="flex items-center gap-2" disabled>
        <GitBranch className="h-4 w-4" />
        Single Version
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">Version</span> {currentVersion?.versionNumber || 1}
          {versions.length > 1 && (
            <Badge variant="secondary" className="ml-1 h-5 text-xs">
              {versions.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">Document Versions</h4>
            <Badge variant="outline" className="text-xs">
              {versions.length} total
            </Badge>
          </div>
          
          {isLoading ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Loading versions...
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    version.isCurrent 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/30 border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {version.isCurrent && (
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm">
                          Version {version.versionNumber}
                        </span>
                        {version.isCurrent && (
                          <Badge variant="default" className="text-xs h-5">
                            Current
                          </Badge>
                        )}
                      </div>
                      
                      {version.changeNotes && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {version.changeNotes}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(version.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>User</span>
                        </div>
                        <span>{formatFileSize(version.fileSize)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 ml-2">
                      {!version.isCurrent && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleVersionSwitch(version)}
                          >
                            Switch
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleDeleteVersion(version.id, version.versionNumber)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

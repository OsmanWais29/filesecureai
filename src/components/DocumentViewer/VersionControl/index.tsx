
import React, { useState, useEffect } from 'react';
import { VersionHistory } from './VersionHistory';
import { ComparisonView } from './ComparisonView';
import { supabase } from '@/lib/supabase';
import { DocumentVersion } from '../types';
import { safeObjectCast } from '@/utils/typeSafetyUtils';

interface VersionControlProps {
  documentId: string;
}

export const VersionControl: React.FC<VersionControlProps> = ({ documentId }) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<DocumentVersion | null>(null);
  const [compareVersion, setCompareVersion] = useState<DocumentVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('document_versions')
          .select('*')
          .eq('document_id', documentId)
          .order('version_number', { ascending: false });
        
        if (error) throw error;
        
        if (data && Array.isArray(data)) {
          // Map the database result to our DocumentVersion type
          const documentVersions: DocumentVersion[] = data.map(item => ({
            id: safeObjectCast<string>(item.id),
            documentId: safeObjectCast<string>(item.document_id),
            versionNumber: safeObjectCast<number>(item.version_number),
            content: safeObjectCast<any>(item.content),
            createdAt: safeObjectCast<string>(item.created_at),
            createdBy: safeObjectCast<string>(item.created_by),
            isCurrent: safeObjectCast<boolean>(item.is_current),
            description: safeObjectCast<string>(item.description),
            changesSummary: safeObjectCast<string>(item.changes_summary),
            metadata: safeObjectCast<Record<string, any>>(item.metadata),
            changes: safeObjectCast<Record<string, any>[]>(item.changes || [])
          }));
          
          setVersions(documentVersions);
          
          // Set the current version
          const current = documentVersions.find(v => v.isCurrent) || (documentVersions[0] || null);
          setCurrentVersion(current);
        }
      } catch (err: any) {
        console.error('Error fetching document versions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (documentId) {
      fetchVersions();
    }
  }, [documentId]);

  const handleViewVersion = (version: DocumentVersion) => {
    setCurrentVersion(version);
    setCompareVersion(null);
  };
  
  const handleCompareVersions = (current: DocumentVersion, previous: DocumentVersion) => {
    setCurrentVersion(current);
    setCompareVersion(previous);
  };
  
  const handleDownloadVersion = (version: DocumentVersion) => {
    // Implementation for downloading a specific version
    console.log('Download version:', version);
    // Actual download implementation would go here
    alert(`Downloading version ${version.versionNumber}`);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">Loading version history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <VersionHistory
        versions={versions}
        currentVersion={currentVersion}
        onViewVersion={handleViewVersion}
        onDownloadVersion={handleDownloadVersion}
        onCompareVersions={handleCompareVersions}
      />
      
      {currentVersion && compareVersion && (
        <ComparisonView
          currentVersion={currentVersion}
          previousVersion={compareVersion}
        />
      )}
    </div>
  );
};

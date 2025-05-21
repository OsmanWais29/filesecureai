
import React, { useState, useEffect } from 'react';
import { VersionHistory } from './VersionHistory';
import { ComparisonView } from './ComparisonView';
import { supabase } from '@/lib/supabase';
import { DocumentVersion } from '../types';
import { toSafeSpreadObject } from '@/utils/typeSafetyUtils';

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
            id: String(item.id || ''),
            document_id: String(item.document_id || ''),
            version_number: Number(item.version_number || 0),
            storage_path: String(item.storage_path || ''),
            created_at: String(item.created_at || ''),
            created_by: String(item.created_by || ''),
            is_current: Boolean(item.is_current || false),
            description: String(item.description || ''),
            changes_summary: String(item.changes_summary || '')
          }));
          
          setVersions(documentVersions);
          
          // Set the current version
          const current = documentVersions.find(v => v.is_current) || (documentVersions[0] || null);
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
    alert(`Downloading version ${version.version_number}`);
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

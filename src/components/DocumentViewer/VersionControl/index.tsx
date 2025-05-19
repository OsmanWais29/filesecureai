
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { VersionHistory } from './VersionHistory';
import { ComparisonView } from './ComparisonView';
import { DocumentVersion } from '../types';
import { toString, safeObjectCast } from '@/utils/typeSafetyUtils';

interface VersionControlProps {
  documentId: string;
}

export const VersionControl: React.FC<VersionControlProps> = ({ documentId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [comparisonVersions, setComparisonVersions] = useState<{ currentVersion: DocumentVersion, previousVersion: DocumentVersion } | null>(null);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    const fetchVersions = async () => {
      if (!documentId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('document_versions')
          .select('*')
          .eq('document_id', documentId)
          .order('version_number', { ascending: false });
        
        if (fetchError) throw fetchError;
        
        if (data && Array.isArray(data)) {
          const typedVersions: DocumentVersion[] = data.map(version => ({
            id: toString(version.id),
            documentId: toString(version.document_id),
            version_number: Number(version.version_number),
            content: version.content || {},
            createdAt: toString(version.created_at),
            is_current: Boolean(version.is_current),
            changes: version.changes_summary ? [toString(version.changes_summary)] : []
          }));
          
          setVersions(typedVersions);
          
          // Set the current version as the selected version by default
          const currentVersion = typedVersions.find(v => v.is_current) || (typedVersions.length > 0 ? typedVersions[0] : null);
          if (currentVersion) {
            setSelectedVersion(currentVersion);
          }
        }
      } catch (err: any) {
        console.error('Error fetching document versions:', err);
        setError(`Failed to load versions: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVersions();
  }, [documentId]);

  const handleSelectVersion = (version: DocumentVersion) => {
    setSelectedVersion(version);
  };

  const handleCompare = (current: DocumentVersion, previous: DocumentVersion) => {
    setComparisonVersions({
      currentVersion: current,
      previousVersion: previous
    });
    setActiveTab('compare');
  };

  if (loading) {
    return (
      <Card className="w-full flex justify-center items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading version history...</span>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full p-4">
        <div className="text-red-500">{error}</div>
      </Card>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="history">Version History</TabsTrigger>
        {comparisonVersions && <TabsTrigger value="compare">Compare Versions</TabsTrigger>}
      </TabsList>
      <TabsContent value="history">
        <VersionHistory
          versions={versions}
          onSelectVersion={handleSelectVersion}
          onCompare={handleCompare}
        />
      </TabsContent>
      <TabsContent value="compare">
        {comparisonVersions && (
          <ComparisonView
            currentVersion={comparisonVersions.currentVersion}
            previousVersion={comparisonVersions.previousVersion}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

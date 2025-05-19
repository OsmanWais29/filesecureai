
import { DocumentVersion } from '../types';

export interface VersionHistoryProps {
  versions: DocumentVersion[];
  currentVersion: DocumentVersion | null;
  onViewVersion: (version: DocumentVersion) => void;
  onDownloadVersion: (version: DocumentVersion) => void;
  onCompareVersions: (current: DocumentVersion, previous: DocumentVersion) => void;
}

export interface ComparisonViewProps {
  currentVersion: DocumentVersion;
  previousVersion: DocumentVersion;
}

export interface VersionCardProps {
  version: DocumentVersion;
  isCurrent: boolean;
  onView: (version: DocumentVersion) => void;
  onDownload: (version: DocumentVersion) => void;
  onCompare: (version: DocumentVersion) => void;
  showCompareButton: boolean;
}

export interface VersionControlProps {
  documentId: string;
}

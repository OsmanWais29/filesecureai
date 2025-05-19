
import React from 'react';
import { VersionControl } from '../VersionControl';
import { DocumentVersion } from '../types';

interface VersionTabProps {
  documentId: string;
  versions: DocumentVersion[];
}

export const VersionTab: React.FC<VersionTabProps> = ({ documentId, versions }) => {
  return (
    <div className="p-4">
      <VersionControl documentId={documentId} />
    </div>
  );
};

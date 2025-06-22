
import React from 'react';
import { DropArea } from './components/DropArea';
import { UploadProgressDisplay } from './components/UploadProgressDisplay';
import { DuplicateDialog } from './components/DuplicateDialog';
import { useFileUpload } from './hooks/useFileUpload';
import { FileUploadProps } from './types';

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const { 
    handleUpload, 
    isUploading, 
    uploadProgress, 
    uploadStep,
    showDuplicateDialog,
    duplicateInfo,
    handleDuplicateDecision
  } = useFileUpload(onUploadComplete);

  return (
    <div className="space-y-4">
      {isUploading ? (
        <UploadProgressDisplay 
          uploadProgress={uploadProgress} 
          uploadStep={uploadStep} 
        />
      ) : (
        <div className="flex items-center justify-center w-full">
          <label htmlFor="file-upload" className="w-full">
            <DropArea onFileSelect={handleUpload} />
          </label>
        </div>
      )}

      {/* Duplicate Detection Dialog */}
      {showDuplicateDialog && duplicateInfo && (
        <DuplicateDialog
          isOpen={showDuplicateDialog}
          onClose={() => handleDuplicateDecision('cancel')}
          fileName={duplicateInfo.file.name}
          existingDocument={duplicateInfo.result.existingDocument}
          onAction={handleDuplicateDecision}
        />
      )}
    </div>
  );
};

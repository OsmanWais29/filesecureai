
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

interface FolderNameEditorProps {
  name: string;
  onSave: (newName: string) => void;
  onCancel: () => void;
}

export const FolderNameEditor: React.FC<FolderNameEditorProps> = ({ 
  name, 
  onSave, 
  onCancel 
}) => {
  const [editName, setEditName] = useState(name);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(editName);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Input
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onSave(editName)}
      className="h-6 text-sm"
      autoFocus
    />
  );
};


import { useState } from "react";

export const useEditableFields = () => {
  const [editableFields, setEditableFields] = useState<Record<string, boolean>>({});

  // Toggle a specific field's edit state
  const toggleFieldEdit = (fieldName: string) => {
    setEditableFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  // Check if a field is in edit mode
  const isFieldEditable = (fieldName: string): boolean => {
    return !!editableFields[fieldName];
  };

  // Set all fields to view mode
  const setAllFieldsToViewMode = () => {
    setEditableFields({});
  };

  return {
    isFieldEditable,
    toggleFieldEdit,
    setAllFieldsToViewMode
  };
};

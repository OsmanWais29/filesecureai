
import { useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewModeFieldProps {
  id: string;
  name: string;
  label: React.ReactNode;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isEditable: boolean;
  onToggleEdit: () => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  isMultiline?: boolean;
}

export const ViewModeField = ({
  id,
  name,
  label,
  value,
  onChange,
  isEditable,
  onToggleEdit,
  type = "text",
  placeholder = "",
  required = false,
  isMultiline = false
}: ViewModeFieldProps) => {
  const [localValue, setLocalValue] = useState(value?.toString() || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize local value when toggling edit mode
  const handleToggleEdit = useCallback(() => {
    setLocalValue(value?.toString() || "");
    onToggleEdit();
    // Focus the input after a short delay to ensure it's rendered
    setTimeout(() => {
      if (isMultiline) {
        textareaRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }, 50);
  }, [value, onToggleEdit, isMultiline]);

  // Handle local changes
  const handleLocalChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  }, []);

  // Save changes
  const handleSave = useCallback(() => {
    const syntheticEvent = {
      target: {
        name,
        value: localValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
    onToggleEdit();
  }, [localValue, name, onChange, onToggleEdit]);

  // Cancel edit
  const handleCancel = useCallback(() => {
    setLocalValue(value?.toString() || "");
    onToggleEdit();
  }, [value, onToggleEdit]);

  // Handle double-click to edit
  const handleDoubleClick = useCallback(() => {
    if (!isEditable) {
      handleToggleEdit();
    }
  }, [isEditable, handleToggleEdit]);

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="flex items-center justify-between">
        <span>{label}</span>
        {!isEditable && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToggleEdit}
            className="h-6 w-6 p-0"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span className="sr-only">Edit {typeof label === 'string' ? label : 'field'}</span>
          </Button>
        )}
      </Label>
      
      {isEditable ? (
        <div className="space-y-2">
          {isMultiline ? (
            <Textarea
              id={id}
              name={name}
              value={localValue}
              onChange={handleLocalChange}
              placeholder={placeholder}
              required={required}
              ref={textareaRef}
              className="min-h-[100px]"
            />
          ) : (
            <Input
              id={id}
              name={name}
              type={type}
              value={localValue}
              onChange={handleLocalChange}
              placeholder={placeholder}
              required={required}
              ref={inputRef}
            />
          )}
          <div className="flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCancel}
              className="h-7 px-2"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              className="h-7 px-2"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="p-2 border rounded-md bg-muted/20 cursor-pointer min-h-9 flex items-center"
          onDoubleClick={handleDoubleClick}
        >
          {value ? (
            isMultiline ? (
              <div className="whitespace-pre-line">{value}</div>
            ) : (
              <div>{value}</div>
            )
          ) : (
            <span className="text-muted-foreground text-sm italic">Not provided</span>
          )}
        </div>
      )}
    </div>
  );
};

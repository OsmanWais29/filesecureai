
import React, { memo } from "react";
import { ViewModeField } from "./ViewModeField";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ViewModeFormFieldProps {
  id: string;
  name: string;
  label: React.ReactNode;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isEditable: boolean;
  onToggleEdit: () => void;
  type?: string;
  placeholder?: string;
  tooltip?: string;
  required?: boolean;
  isMultiline?: boolean;
  className?: string;
}

export const ViewModeFormField = memo(({
  id,
  name,
  label,
  value,
  onChange,
  isEditable,
  onToggleEdit,
  type = "text",
  placeholder = "",
  tooltip,
  required = false,
  isMultiline = false,
  className = ""
}: ViewModeFormFieldProps) => {
  // Create a label with tooltip if provided
  const fullLabel = tooltip ? (
    <span className="flex items-center gap-1">
      {label}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle 
              className="h-4 w-4 text-muted-foreground cursor-help"
            />
          </TooltipTrigger>
          <TooltipContent>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  ) : (
    label
  );

  return (
    <div className={`grid ${className}`}>
      <ViewModeField
        id={id}
        name={name}
        label={fullLabel}
        value={value}
        onChange={onChange}
        isEditable={isEditable}
        onToggleEdit={onToggleEdit}
        type={type}
        placeholder={placeholder}
        required={required}
        isMultiline={isMultiline}
      />
    </div>
  );
});

ViewModeFormField.displayName = "ViewModeFormField";

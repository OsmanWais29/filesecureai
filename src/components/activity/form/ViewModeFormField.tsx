
import { ViewModeField } from "./ViewModeField";
import { useTooltip } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ViewModeFormFieldProps {
  id: string;
  name: string;
  label: string;
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

export const ViewModeFormField = ({
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
  // This is a stub for now - in a real implementation, you would have a real tooltip component
  const showTooltip = (message: string) => {
    // In a real implementation, you'd show a tooltip
    console.log("Tooltip:", message);
  };

  const fullLabel = tooltip ? (
    <span className="flex items-center gap-1">
      {label}
      <HelpCircle 
        className="h-4 w-4 text-muted-foreground cursor-help" 
        onMouseEnter={() => tooltip && showTooltip(tooltip)}
      />
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
};

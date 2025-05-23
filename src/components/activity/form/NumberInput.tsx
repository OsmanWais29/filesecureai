
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface NumberInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tooltip?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const NumberInput = ({
  id,
  name,
  label,
  value,
  onChange,
  tooltip,
  required = false,
  disabled = false,
  className = "",
}: NumberInputProps) => {
  // Handle number input validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      onChange(e);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <Input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        className={className}
        inputMode="decimal"
        pattern="[0-9]*\.?[0-9]*"
      />
    </div>
  );
};


import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { FormFieldProps } from "../types";

export const FormField = ({
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  tooltip,
  placeholder,
  type = "text",
  disabled = false,
  className = "",
}: FormFieldProps & { disabled?: boolean; className?: string; type?: string }) => {
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
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={className}
        type={type}
        disabled={disabled}
      />
    </div>
  );
};

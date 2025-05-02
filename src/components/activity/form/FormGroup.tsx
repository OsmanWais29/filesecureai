
import React from "react";

interface FormGroupProps {
  title?: string;
  children: React.ReactNode;
}

export const FormGroup = ({ title, children }: FormGroupProps) => {
  return (
    <div className="space-y-4 border-b pb-6 last:border-b-0 last:pb-0">
      {title && <h3 className="text-md font-medium">{title}</h3>}
      {children}
    </div>
  );
};

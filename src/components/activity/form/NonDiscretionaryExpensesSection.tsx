
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "./NumberInput";
import { IncomeExpenseData, NonDiscretionaryExpensesSectionProps } from "../types";
import { CircleDollarSign } from "lucide-react";
import { ViewModeFormField } from "./ViewModeFormField";

export const NonDiscretionaryExpensesSection = ({
  formData,
  previousMonthData,
  onChange,
  isViewMode = false,
  isFieldEditable = () => false,
  onToggleFieldEdit = () => {},
}: NonDiscretionaryExpensesSectionProps) => {
  // Calculate total non-discretionary expenses
  const handleNonDiscretionaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e);
    
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    
    // Calculate total
    const childSupport = parseFloat(newFormData.child_support_payments || "0") || 0;
    const medicalExpenses = parseFloat(newFormData.medical_expenses || "0") || 0;
    const finesPenalties = parseFloat(newFormData.fines_penalties || "0") || 0;
    const otherDeductions = parseFloat(newFormData.other_mandatory_deductions || "0") || 0;
    
    const total = childSupport + medicalExpenses + finesPenalties + otherDeductions;
    
    const totalEvent = {
      target: {
        name: "total_non_discretionary",
        value: total.toFixed(2),
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(totalEvent);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CircleDollarSign className="h-5 w-5" />
          Non-Discretionary Expenses
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isViewMode ? (
          <>
            <ViewModeFormField
              id="child_support_payments"
              name="child_support_payments"
              label="Child Support Payments"
              value={formData.child_support_payments || ""}
              onChange={handleNonDiscretionaryChange}
              isEditable={isFieldEditable("child_support_payments")}
              onToggleEdit={() => onToggleFieldEdit("child_support_payments")}
              tooltip="Court-ordered child support payments"
            />
            
            <ViewModeFormField
              id="medical_expenses"
              name="medical_expenses"
              label="Medical Expenses"
              value={formData.medical_expenses || ""}
              onChange={handleNonDiscretionaryChange}
              isEditable={isFieldEditable("medical_expenses")}
              onToggleEdit={() => onToggleFieldEdit("medical_expenses")}
              tooltip="Non-discretionary medical expenses"
            />
            
            <ViewModeFormField
              id="fines_penalties"
              name="fines_penalties"
              label="Fines or Penalties"
              value={formData.fines_penalties || ""}
              onChange={handleNonDiscretionaryChange}
              isEditable={isFieldEditable("fines_penalties")}
              onToggleEdit={() => onToggleFieldEdit("fines_penalties")}
              tooltip="Court-ordered fines or penalties"
            />
            
            <ViewModeFormField
              id="other_mandatory_deductions"
              name="other_mandatory_deductions"
              label="Other Mandatory Deductions"
              value={formData.other_mandatory_deductions || ""}
              onChange={handleNonDiscretionaryChange}
              isEditable={isFieldEditable("other_mandatory_deductions")}
              onToggleEdit={() => onToggleFieldEdit("other_mandatory_deductions")}
              tooltip="Other legally required deductions"
            />
            
            <ViewModeFormField
              id="total_non_discretionary"
              name="total_non_discretionary"
              label="Total Non-Discretionary Expenses"
              value={formData.total_non_discretionary || ""}
              onChange={onChange}
              isEditable={false}
              onToggleEdit={() => {}}
              className="font-bold"
            />
          </>
        ) : (
          <>
            <NumberInput
              id="child_support_payments"
              name="child_support_payments"
              label="Child Support Payments"
              value={formData.child_support_payments || ""}
              onChange={handleNonDiscretionaryChange}
              tooltip="Court-ordered child support payments"
            />
            
            <NumberInput
              id="medical_expenses"
              name="medical_expenses"
              label="Medical Expenses"
              value={formData.medical_expenses || ""}
              onChange={handleNonDiscretionaryChange}
              tooltip="Non-discretionary medical expenses"
            />
            
            <NumberInput
              id="fines_penalties"
              name="fines_penalties"
              label="Fines or Penalties"
              value={formData.fines_penalties || ""}
              onChange={handleNonDiscretionaryChange}
              tooltip="Court-ordered fines or penalties"
            />
            
            <NumberInput
              id="other_mandatory_deductions"
              name="other_mandatory_deductions"
              label="Other Mandatory Deductions"
              value={formData.other_mandatory_deductions || ""}
              onChange={handleNonDiscretionaryChange}
              tooltip="Other legally required deductions"
            />
            
            <NumberInput
              id="total_non_discretionary"
              name="total_non_discretionary"
              label="Total Non-Discretionary Expenses"
              value={formData.total_non_discretionary || ""}
              onChange={onChange}
              required
              disabled
              className="font-bold"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

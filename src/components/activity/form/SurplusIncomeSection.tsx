
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "./NumberInput";
import { IncomeExpenseData } from "../types";
import { Calculator } from "lucide-react";
import { ViewModeFormField } from "./ViewModeFormField";

interface SurplusIncomeSectionProps {
  formData: IncomeExpenseData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isViewMode?: boolean;
  isFieldEditable?: (fieldName: string) => boolean;
  onToggleFieldEdit?: (fieldName: string) => void;
}

export const SurplusIncomeSection = ({
  formData,
  onChange,
  isViewMode = false,
  isFieldEditable = () => false,
  onToggleFieldEdit = () => {},
}: SurplusIncomeSectionProps) => {
  // Calculate surplus income
  const handleSurplusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    
    // Update net income based on household income and total expenses
    if (e.target.name === "net_income" || e.target.name === "applicable_threshold") {
      const netIncome = parseFloat(newFormData.net_income || "0") || 0;
      const threshold = parseFloat(newFormData.applicable_threshold || "0") || 0;
      
      const surplusAmount = Math.max(0, netIncome - threshold).toFixed(2);
      
      const surplusEvent = {
        target: {
          name: "surplus_amount",
          value: surplusAmount,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(surplusEvent);
    }
  };
  
  // Calculate net income based on household income and expenses
  const calculateNetIncome = () => {
    const householdIncome = parseFloat(formData.total_household_income || "0") || 0;
    const totalExpenses = parseFloat(formData.total_essential_expenses || "0") || 0;
    const nonDiscretionary = parseFloat(formData.total_non_discretionary || "0") || 0;
    
    const netIncome = Math.max(0, householdIncome - totalExpenses - nonDiscretionary).toFixed(2);
    
    const netIncomeEvent = {
      target: {
        name: "net_income",
        value: netIncome,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(netIncomeEvent);
    
    // Also update surplus amount
    const threshold = parseFloat(formData.applicable_threshold || "0") || 0;
    const surplusAmount = Math.max(0, parseFloat(netIncome) - threshold).toFixed(2);
    
    const surplusEvent = {
      target: {
        name: "surplus_amount",
        value: surplusAmount,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(surplusEvent);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Surplus Income Calculation
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={calculateNetIncome}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Calculate Net Income
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isViewMode ? (
            <>
              <ViewModeFormField
                id="net_income"
                name="net_income"
                label="Net Income"
                value={formData.net_income || ""}
                onChange={handleSurplusChange}
                isEditable={isFieldEditable("net_income")}
                onToggleEdit={() => onToggleFieldEdit("net_income")}
                tooltip="Income after expenses"
                required
              />
              
              <ViewModeFormField
                id="applicable_threshold"
                name="applicable_threshold"
                label="Applicable Threshold"
                value={formData.applicable_threshold || ""}
                onChange={handleSurplusChange}
                isEditable={isFieldEditable("applicable_threshold")}
                onToggleEdit={() => onToggleFieldEdit("applicable_threshold")}
                tooltip="Threshold amount based on household size"
                required
              />
              
              <ViewModeFormField
                id="surplus_amount"
                name="surplus_amount"
                label="Surplus Amount"
                value={formData.surplus_amount || ""}
                onChange={onChange}
                isEditable={false}
                onToggleEdit={() => {}}
                tooltip="Net income minus applicable threshold"
                required
                className="font-bold"
              />
            </>
          ) : (
            <>
              <NumberInput
                id="net_income"
                name="net_income"
                label="Net Income"
                value={formData.net_income || ""}
                onChange={handleSurplusChange}
                tooltip="Income after expenses"
                required
              />
              
              <NumberInput
                id="applicable_threshold"
                name="applicable_threshold"
                label="Applicable Threshold"
                value={formData.applicable_threshold || ""}
                onChange={handleSurplusChange}
                tooltip="Threshold amount based on household size"
                required
              />
              
              <NumberInput
                id="surplus_amount"
                name="surplus_amount"
                label="Surplus Amount"
                value={formData.surplus_amount || ""}
                onChange={onChange}
                tooltip="Net income minus applicable threshold"
                required
                disabled
                className="font-bold"
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

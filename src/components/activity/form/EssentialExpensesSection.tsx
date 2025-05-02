
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "./NumberInput";
import { IncomeExpenseData } from "../types";
import { Home } from "lucide-react";

interface EssentialExpensesSectionProps {
  formData: IncomeExpenseData;
  previousMonthData?: IncomeExpenseData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EssentialExpensesSection = ({
  formData,
  previousMonthData,
  onChange,
}: EssentialExpensesSectionProps) => {
  // Calculate total essential expenses
  const handleEssentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    
    // Calculate total
    const rent = parseFloat(newFormData.mortgage_rent || "0") || 0;
    const utilities = parseFloat(newFormData.utilities || "0") || 0;
    const groceries = parseFloat(newFormData.groceries || "0") || 0;
    const childCare = parseFloat(newFormData.child_care || "0") || 0;
    const medicalDental = parseFloat(newFormData.medical_dental || "0") || 0;
    const transportation = parseFloat(newFormData.transportation || "0") || 0;
    const education = parseFloat(newFormData.education_tuition || "0") || 0;
    const debt = parseFloat(newFormData.debt_repayments || "0") || 0;
    const telephone = parseFloat(newFormData.telephone_internet || "0") || 0;
    const insurance = parseFloat(newFormData.insurance || "0") || 0;
    const misc = parseFloat(newFormData.misc_essential_expenses || "0") || 0;
    
    const total = rent + utilities + groceries + childCare + medicalDental + 
                 transportation + education + debt + telephone + insurance + misc;
    
    const totalEvent = {
      target: {
        name: "total_essential_expenses",
        value: total.toFixed(2),
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(totalEvent);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Monthly Expenses
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberInput
          id="mortgage_rent"
          name="mortgage_rent"
          label="Mortgage/Rent"
          value={formData.mortgage_rent || ""}
          onChange={handleEssentialChange}
          required
        />
        
        <NumberInput
          id="utilities"
          name="utilities"
          label="Utilities"
          value={formData.utilities || ""}
          onChange={handleEssentialChange}
        />
        
        <NumberInput
          id="groceries"
          name="groceries"
          label="Groceries"
          value={formData.groceries || ""}
          onChange={handleEssentialChange}
        />
        
        <NumberInput
          id="transportation"
          name="transportation"
          label="Transportation"
          value={formData.transportation || ""}
          onChange={handleEssentialChange}
          tooltip="Car payments, gas, public transit, etc."
        />
        
        <NumberInput
          id="telephone_internet"
          name="telephone_internet"
          label="Telephone/Internet"
          value={formData.telephone_internet || ""}
          onChange={handleEssentialChange}
        />
        
        <NumberInput
          id="insurance"
          name="insurance"
          label="Insurance"
          value={formData.insurance || ""}
          onChange={handleEssentialChange}
          tooltip="All insurance types"
        />
        
        <NumberInput
          id="child_care"
          name="child_care"
          label="Child Care"
          value={formData.child_care || ""}
          onChange={handleEssentialChange}
        />
        
        <NumberInput
          id="medical_dental"
          name="medical_dental"
          label="Medical & Dental"
          value={formData.medical_dental || ""}
          onChange={handleEssentialChange}
        />
        
        <NumberInput
          id="education_tuition"
          name="education_tuition"
          label="Education/Tuition"
          value={formData.education_tuition || ""}
          onChange={handleEssentialChange}
        />
        
        <NumberInput
          id="debt_repayments"
          name="debt_repayments"
          label="Debt Repayments"
          value={formData.debt_repayments || ""}
          onChange={handleEssentialChange}
          tooltip="Minimum payments on debts"
        />
        
        <NumberInput
          id="misc_essential_expenses"
          name="misc_essential_expenses"
          label="Other"
          value={formData.misc_essential_expenses || ""}
          onChange={handleEssentialChange}
        />
        
        <NumberInput
          id="total_essential_expenses"
          name="total_essential_expenses"
          label="Total Monthly Expenses"
          value={formData.total_essential_expenses || ""}
          onChange={onChange}
          required
          disabled
          className="font-bold"
        />
      </CardContent>
    </Card>
  );
};

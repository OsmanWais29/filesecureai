
import React, { useEffect } from "react";
import { IncomeExpenseData } from "../types";
import { ComparisonField } from "./ComparisonField";
import { ViewModeFormField } from "./ViewModeFormField";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DiscretionaryExpensesSectionProps {
  formData: IncomeExpenseData;
  previousMonthData?: IncomeExpenseData | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isViewMode?: boolean;
  isFieldEditable?: (fieldName: string) => boolean;
  onToggleFieldEdit?: (fieldName: string) => void;
}

export const DiscretionaryExpensesSection = ({ 
  formData, 
  previousMonthData, 
  onChange,
  isViewMode = false,
  isFieldEditable = () => false,
  onToggleFieldEdit = () => {},
}: DiscretionaryExpensesSectionProps) => {
  // Discretionary expense fields with labels
  const expenseFields = [
    { id: "dining_out", label: "Dining Out" },
    { id: "alcohol", label: "Alcohol" },
    { id: "tobacco", label: "Tobacco Products" },
    { id: "entertainment", label: "Entertainment/Recreation" },
    { id: "gym_memberships", label: "Gym/Clubs Membership" },
    { id: "gifts_donations", label: "Gifts/Charitable Donations" },
    { id: "subscriptions", label: "Subscriptions" },
    { id: "clothing", label: "Clothing & Accessories" },
    { id: "pet_care", label: "Pet Care" },
    { id: "leisure_travel", label: "Leisure & Travel" },
    { id: "other_discretionary", label: "Other (specify)" }
  ];
  
  // Calculate total discretionary expenses
  const calculateTotal = () => {
    let total = 0;
    expenseFields.forEach(field => {
      total += parseFloat(formData[field.id as keyof IncomeExpenseData] as string || '0');
    });
    return total.toFixed(2);
  };
  
  // Update total when values change
  useEffect(() => {
    const total = calculateTotal();
    if (formData.total_discretionary_expenses !== total) {
      const e = {
        target: {
          name: 'total_discretionary_expenses',
          value: total
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(e);
    }
  }, [formData, onChange]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Discretionary Expenses</CardTitle>
        <CardDescription>
          Record all optional monthly expenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Expense Category</TableHead>
              <TableHead>Amount ($)</TableHead>
              <TableHead className="text-right">Previous Month</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenseFields.map(field => (
              <TableRow key={field.id}>
                <TableCell>{field.label}</TableCell>
                <TableCell>
                  <ComparisonField
                    id={field.id}
                    name={field.id}
                    label=""
                    value={formData[field.id as keyof IncomeExpenseData] as string}
                    previousValue={previousMonthData ? previousMonthData[field.id as keyof IncomeExpenseData] as string : undefined}
                    onChange={onChange}
                    placeholder="0.00"
                  />
                </TableCell>
                <TableCell className="text-right">
                  {previousMonthData ? 
                    `$${parseFloat(previousMonthData[field.id as keyof IncomeExpenseData] as string || '0').toFixed(2)}` : 
                    'N/A'}
                </TableCell>
              </TableRow>
            ))}
            
            {/* Other discretionary description field */}
            <TableRow>
              <TableCell colSpan={3}>
                <div className="space-y-1">
                  <Label htmlFor="other_discretionary_description">Specify Other Discretionary Expenses</Label>
                  <Input
                    id="other_discretionary_description"
                    name="other_discretionary_description"
                    value={formData.other_discretionary_description}
                    onChange={onChange}
                    placeholder="Describe other discretionary expenses"
                  />
                </div>
              </TableCell>
            </TableRow>
            
            {/* Total Row */}
            <TableRow className="font-bold">
              <TableCell>Total Discretionary Expenses</TableCell>
              <TableCell>
                ${calculateTotal()}
              </TableCell>
              <TableCell className="text-right">
                {previousMonthData ? 
                  `$${parseFloat(previousMonthData.total_discretionary_expenses || '0').toFixed(2)}` : 
                  'N/A'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

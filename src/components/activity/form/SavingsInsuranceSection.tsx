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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SavingsInsuranceSectionProps {
  formData: IncomeExpenseData;
  previousMonthData?: IncomeExpenseData | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isViewMode?: boolean;
  isFieldEditable?: (fieldName: string) => boolean;
  onToggleFieldEdit?: (fieldName: string) => void;
}

export const SavingsInsuranceSection = ({ 
  formData, 
  previousMonthData, 
  onChange,
  isViewMode = false,
  isFieldEditable = () => false,
  onToggleFieldEdit = () => {},
}: SavingsInsuranceSectionProps) => {
  // Savings fields with labels
  const savingsFields = [
    { id: "emergency_savings", label: "Emergency Savings" },
    { id: "retirement_savings", label: "Retirement Savings" },
    { id: "education_savings", label: "Education Savings" },
    { id: "investment_contributions", label: "Investment Contributions" }
  ];
  
  // Insurance fields with labels
  const insuranceFields = [
    { id: "vehicle_insurance", label: "Vehicle" },
    { id: "health_insurance", label: "Health" },
    { id: "life_insurance", label: "Life" },
    { id: "home_insurance", label: "Home/Renter's" },
    { id: "other_insurance", label: "Other (specify)" }
  ];
  
  // Calculate totals
  const calculateSavingsTotal = () => {
    let total = 0;
    savingsFields.forEach(field => {
      total += parseFloat(formData[field.id as keyof IncomeExpenseData] as string || '0');
    });
    return total.toFixed(2);
  };
  
  const calculateInsuranceTotal = () => {
    let total = 0;
    insuranceFields.forEach(field => {
      total += parseFloat(formData[field.id as keyof IncomeExpenseData] as string || '0');
    });
    return total.toFixed(2);
  };
  
  // Update totals when values change
  useEffect(() => {
    const savingsTotal = calculateSavingsTotal();
    const insuranceTotal = calculateInsuranceTotal();
    
    // Only update if the values are different to prevent infinite loops
    if (formData.total_savings !== savingsTotal) {
      const e = {
        target: {
          name: 'total_savings',
          value: savingsTotal
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(e);
    }
    
    if (formData.total_insurance !== insuranceTotal) {
      const e = {
        target: {
          name: 'total_insurance',
          value: insuranceTotal
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(e);
    }
  }, [formData, onChange]);
  
  return (
    <Tabs defaultValue="savings">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="savings">Savings & Investments</TabsTrigger>
        <TabsTrigger value="insurance">Insurance Expenses</TabsTrigger>
      </TabsList>
      
      <TabsContent value="savings" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Savings & Investments</CardTitle>
            <CardDescription>
              Record monthly contributions to savings and investments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Financial Goal</TableHead>
                  <TableHead>Monthly Contribution ($)</TableHead>
                  <TableHead className="text-right">Previous Month</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savingsFields.map(field => (
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
                
                {/* Total Row */}
                <TableRow className="font-bold">
                  <TableCell>Total Savings & Investments</TableCell>
                  <TableCell>
                    ${calculateSavingsTotal()}
                  </TableCell>
                  <TableCell className="text-right">
                    {previousMonthData ? 
                      `$${parseFloat(previousMonthData.total_savings || '0').toFixed(2)}` : 
                      'N/A'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="insurance" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Insurance Expenses</CardTitle>
            <CardDescription>
              Record monthly insurance premiums
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Insurance Type</TableHead>
                  <TableHead>Monthly Premium ($)</TableHead>
                  <TableHead className="text-right">Previous Month</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insuranceFields.map(field => (
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
                
                {/* Other insurance description field */}
                <TableRow>
                  <TableCell colSpan={3}>
                    <div className="space-y-1">
                      <Label htmlFor="other_insurance_description">Specify Other Insurance</Label>
                      <Input
                        id="other_insurance_description"
                        name="other_insurance_description"
                        value={formData.other_insurance_description}
                        onChange={onChange}
                        placeholder="Describe other insurance expenses"
                      />
                    </div>
                  </TableCell>
                </TableRow>
                
                {/* Total Row */}
                <TableRow className="font-bold">
                  <TableCell>Total Insurance Expenses</TableCell>
                  <TableCell>
                    ${calculateInsuranceTotal()}
                  </TableCell>
                  <TableCell className="text-right">
                    {previousMonthData ? 
                      `$${parseFloat(previousMonthData.total_insurance || '0').toFixed(2)}` : 
                      'N/A'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

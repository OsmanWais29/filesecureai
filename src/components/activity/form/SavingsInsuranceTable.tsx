
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SavingsInsuranceTableProps {
  formData: any;
  previousMonthData?: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const SavingsInsuranceTable = ({ formData, previousMonthData, onChange }: SavingsInsuranceTableProps) => {
  const savingsRows = [
    { label: "Emergency Savings", field: "emergency_savings", previousField: "emergency_savings" },
    { label: "Retirement Savings", field: "retirement_savings", previousField: "retirement_savings" },
    { label: "Education Savings", field: "education_savings", previousField: "education_savings" },
    { label: "Investment Contributions", field: "investment_contributions", previousField: "investment_contributions" }
  ];

  const insuranceRows = [
    { label: "Vehicle", field: "vehicle_insurance", previousField: "vehicle_insurance" },
    { label: "Health", field: "health_insurance", previousField: "health_insurance" },
    { label: "Life", field: "life_insurance", previousField: "life_insurance" },
    { label: "Home/Renter's", field: "home_insurance", previousField: "home_insurance" },
    { label: "Other (specify)", field: "other_insurance", previousField: "other_insurance" }
  ];

  const calculateSavingsTotal = () => {
    return savingsRows.reduce((total, saving) => {
      return total + parseFloat(formData[saving.field] || '0');
    }, 0).toFixed(2);
  };

  const calculateInsuranceTotal = () => {
    return insuranceRows.reduce((total, insurance) => {
      return total + parseFloat(formData[insurance.field] || '0');
    }, 0).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Savings & Investments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-purple-700">
            💰 Savings & Investments
          </CardTitle>
          <p className="text-sm text-gray-600">
            Record monthly contributions to savings and investments
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Financial Goal</TableHead>
                  <TableHead className="font-semibold text-center">Monthly Contribution ($)</TableHead>
                  <TableHead className="font-semibold text-center">Previous Month</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savingsRows.map((saving, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{saving.label}</TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        name={saving.field}
                        value={formData[saving.field] || ''}
                        onChange={onChange}
                        placeholder="0.00"
                        className="text-center"
                      />
                    </TableCell>
                    <TableCell className="text-center font-medium text-gray-600">
                      ${previousMonthData?.[saving.previousField] || '0.00'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-purple-50 font-semibold">
                  <TableCell className="font-bold">Total Savings & Investments</TableCell>
                  <TableCell className="text-center font-bold">
                    ${calculateSavingsTotal()}
                  </TableCell>
                  <TableCell className="text-center font-bold text-gray-600">
                    ${formData.total_savings || '0.00'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-red-700">
            🛡️ Insurance Expenses
          </CardTitle>
          <p className="text-sm text-gray-600">
            Record monthly insurance premiums
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Insurance Type</TableHead>
                  <TableHead className="font-semibold text-center">Monthly Premium ($)</TableHead>
                  <TableHead className="font-semibold text-center">Previous Month</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insuranceRows.map((insurance, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{insurance.label}</TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        name={insurance.field}
                        value={formData[insurance.field] || ''}
                        onChange={onChange}
                        placeholder="0.00"
                        className="text-center"
                      />
                    </TableCell>
                    <TableCell className="text-center font-medium text-gray-600">
                      ${previousMonthData?.[insurance.previousField] || '0.00'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-red-50 font-semibold">
                  <TableCell className="font-bold">Total Insurance Expenses</TableCell>
                  <TableCell className="text-center font-bold">
                    ${calculateInsuranceTotal()}
                  </TableCell>
                  <TableCell className="text-center font-bold text-gray-600">
                    ${formData.total_insurance || '0.00'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <Label htmlFor="other_insurance_description" className="text-sm font-medium">
              Specify Other Insurance
            </Label>
            <Textarea
              id="other_insurance_description"
              name="other_insurance_description"
              value={formData.other_insurance_description || ''}
              onChange={onChange}
              placeholder="Describe other insurance expenses"
              className="mt-1"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

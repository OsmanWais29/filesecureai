
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExpenseTableProps {
  formData: any;
  previousMonthData?: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ExpenseTable = ({ formData, previousMonthData, onChange }: ExpenseTableProps) => {
  const essentialExpenses = [
    { label: "Mortgage/Rent", field: "mortgage_rent", previousField: "mortgage_rent" },
    { label: "Utilities (Electricity, Gas, Water)", field: "utilities", previousField: "utilities" },
    { label: "Groceries", field: "groceries", previousField: "groceries" },
    { label: "Child Care", field: "child_care", previousField: "child_care" },
    { label: "Medical/Dental Expenses", field: "medical_dental", previousField: "medical_dental" },
    { label: "Transportation (Car, Public Transit)", field: "transportation", previousField: "transportation" },
    { label: "Education/Tuition", field: "education_tuition", previousField: "education_tuition" },
    { label: "Debt Repayments", field: "debt_repayments", previousField: "debt_repayments" },
    { label: "Miscellaneous Essential Expenses", field: "misc_essential_expenses", previousField: "misc_essential_expenses" }
  ];

  const discretionaryExpenses = [
    { label: "Dining Out", field: "dining_out", previousField: "dining_out" },
    { label: "Alcohol", field: "alcohol", previousField: "alcohol" },
    { label: "Tobacco Products", field: "tobacco", previousField: "tobacco" },
    { label: "Entertainment/Recreation", field: "entertainment", previousField: "entertainment" },
    { label: "Gym/Clubs Membership", field: "gym_memberships", previousField: "gym_memberships" },
    { label: "Gifts/Charitable Donations", field: "gifts_donations", previousField: "gifts_donations" },
    { label: "Subscriptions", field: "subscriptions", previousField: "subscriptions" },
    { label: "Clothing & Accessories", field: "clothing", previousField: "clothing" },
    { label: "Pet Care", field: "pet_care", previousField: "pet_care" },
    { label: "Leisure & Travel", field: "leisure_travel", previousField: "leisure_travel" },
    { label: "Other (specify)", field: "other_discretionary", previousField: "other_discretionary" }
  ];

  const calculateEssentialTotal = () => {
    return essentialExpenses.reduce((total, expense) => {
      return total + parseFloat(formData[expense.field] || '0');
    }, 0).toFixed(2);
  };

  const calculateDiscretionaryTotal = () => {
    return discretionaryExpenses.reduce((total, expense) => {
      return total + parseFloat(formData[expense.field] || '0');
    }, 0).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Essential Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-green-700">
            🏠 Essential Monthly Expenses
          </CardTitle>
          <p className="text-sm text-gray-600">
            Record all necessary monthly expenses
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Expense Category</TableHead>
                  <TableHead className="font-semibold text-center">Amount ($)</TableHead>
                  <TableHead className="font-semibold text-center">Previous Month</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {essentialExpenses.map((expense, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{expense.label}</TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        name={expense.field}
                        value={formData[expense.field] || ''}
                        onChange={onChange}
                        placeholder="0.00"
                        className="text-center"
                      />
                    </TableCell>
                    <TableCell className="text-center font-medium text-gray-600">
                      ${previousMonthData?.[expense.previousField] || '0.00'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-green-50 font-semibold">
                  <TableCell className="font-bold">Total Essential Expenses</TableCell>
                  <TableCell className="text-center font-bold">
                    ${calculateEssentialTotal()}
                  </TableCell>
                  <TableCell className="text-center font-bold text-gray-600">
                    ${formData.total_essential_expenses || '0.00'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Discretionary Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-orange-700">
            🎯 Monthly Discretionary Expenses
          </CardTitle>
          <p className="text-sm text-gray-600">
            Record all optional monthly expenses
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Expense Category</TableHead>
                  <TableHead className="font-semibold text-center">Amount ($)</TableHead>
                  <TableHead className="font-semibold text-center">Previous Month</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discretionaryExpenses.map((expense, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{expense.label}</TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        name={expense.field}
                        value={formData[expense.field] || ''}
                        onChange={onChange}
                        placeholder="0.00"
                        className="text-center"
                      />
                    </TableCell>
                    <TableCell className="text-center font-medium text-gray-600">
                      ${previousMonthData?.[expense.previousField] || '0.00'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-orange-50 font-semibold">
                  <TableCell className="font-bold">Total Discretionary Expenses</TableCell>
                  <TableCell className="text-center font-bold">
                    ${calculateDiscretionaryTotal()}
                  </TableCell>
                  <TableCell className="text-center font-bold text-gray-600">
                    ${formData.total_discretionary_expenses || '0.00'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <Label htmlFor="other_discretionary_description" className="text-sm font-medium">
              Specify Other Discretionary Expenses
            </Label>
            <Textarea
              id="other_discretionary_description"
              name="other_discretionary_description"
              value={formData.other_discretionary_description || ''}
              onChange={onChange}
              placeholder="Describe other discretionary expenses"
              className="mt-1"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

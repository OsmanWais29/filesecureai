
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface IncomeTableProps {
  formData: any;
  previousMonthData?: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const IncomeTable = ({ formData, previousMonthData, onChange }: IncomeTableProps) => {
  const calculateTotal = (debtorField: string, spouseField: string) => {
    const debtorAmount = parseFloat(formData[debtorField] || '0');
    const spouseAmount = parseFloat(formData[spouseField] || '0');
    return (debtorAmount + spouseAmount).toFixed(2);
  };

  const incomeRows = [
    {
      label: "Employment Income",
      debtorField: "employment_income",
      spouseField: "spouse_employment_income",
      previousField: "employment_income"
    },
    {
      label: "Pension/Annuities",
      debtorField: "pension_annuities",
      spouseField: "spouse_pension_annuities",
      previousField: "pension_annuities"
    },
    {
      label: "Child/Spousal Support",
      debtorField: "child_spousal_support",
      spouseField: "spouse_child_spousal_support",
      previousField: "child_spousal_support"
    },
    {
      label: "Self-Employment Income",
      debtorField: "self_employment_income",
      spouseField: "spouse_self_employment_income",
      previousField: "self_employment_income"
    },
    {
      label: "Government Benefits",
      debtorField: "government_benefits",
      spouseField: "spouse_government_benefits",
      previousField: "government_benefits"
    },
    {
      label: "Rental Income",
      debtorField: "rental_income",
      spouseField: "spouse_rental_income",
      previousField: "rental_income"
    },
    {
      label: "Other (specify)",
      debtorField: "other_income",
      spouseField: "spouse_other_income",
      previousField: "other_income"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-700">
          📊 Monthly Income Details
        </CardTitle>
        <p className="text-sm text-gray-600">
          Record all sources of income for the debtor and spouse/partner if applicable
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Source of Income</TableHead>
                <TableHead className="font-semibold text-center">Debtor Amount</TableHead>
                <TableHead className="font-semibold text-center">Spouse Amount</TableHead>
                <TableHead className="font-semibold text-center">Previous Month</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomeRows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      name={row.debtorField}
                      value={formData[row.debtorField] || ''}
                      onChange={onChange}
                      placeholder="0.00"
                      className="text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      name={row.spouseField}
                      value={formData[row.spouseField] || ''}
                      onChange={onChange}
                      placeholder="0.00"
                      className="text-center"
                    />
                  </TableCell>
                  <TableCell className="text-center font-medium text-gray-600">
                    ${previousMonthData?.[row.previousField] || '0.00'}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-blue-50 font-semibold">
                <TableCell className="font-bold">Total Monthly Net Income</TableCell>
                <TableCell className="text-center font-bold">
                  ${(parseFloat(formData.employment_income || '0') + 
                     parseFloat(formData.pension_annuities || '0') + 
                     parseFloat(formData.child_spousal_support || '0') + 
                     parseFloat(formData.self_employment_income || '0') + 
                     parseFloat(formData.government_benefits || '0') + 
                     parseFloat(formData.rental_income || '0') + 
                     parseFloat(formData.other_income || '0')).toFixed(2)}
                </TableCell>
                <TableCell className="text-center font-bold">
                  ${(parseFloat(formData.spouse_employment_income || '0') + 
                     parseFloat(formData.spouse_pension_annuities || '0') + 
                     parseFloat(formData.spouse_child_spousal_support || '0') + 
                     parseFloat(formData.spouse_self_employment_income || '0') + 
                     parseFloat(formData.spouse_government_benefits || '0') + 
                     parseFloat(formData.spouse_rental_income || '0') + 
                     parseFloat(formData.spouse_other_income || '0')).toFixed(2)}
                </TableCell>
                <TableCell className="text-center font-bold text-gray-600">
                  ${formData.total_monthly_income || '0.00'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="other_income_description" className="text-sm font-medium">
              Specify Other Income
            </Label>
            <Textarea
              id="other_income_description"
              name="other_income_description"
              value={formData.other_income_description || ''}
              onChange={onChange}
              placeholder="Describe other income sources"
              className="mt-1"
              rows={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

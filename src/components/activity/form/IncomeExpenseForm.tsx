
import React, { useState, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  income: {
    salary: string;
    other: string;
  };
  expenses: {
    rent: string;
    utilities: string;
    food: string;
    transportation: string;
    other: string;
  };
}

const IncomeExpenseForm = () => {
  const [formData, setFormData] = useState<FormData>({
    income: {
      salary: '',
      other: '',
    },
    expenses: {
      rent: '',
      utilities: '',
      food: '',
      transportation: '',
      other: '',
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>, category: 'income' | 'expenses', field: string) => {
    setFormData({
      ...formData,
      [category]: {
        ...formData[category],
        [field]: e.target.value,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add submission logic here
  };

  const calculateTotalIncome = () => {
    return parseFloat(formData.income.salary || '0') + parseFloat(formData.income.other || '0');
  };

  const calculateTotalExpenses = () => {
    const { rent, utilities, food, transportation, other } = formData.expenses;
    return parseFloat(rent || '0') + 
           parseFloat(utilities || '0') + 
           parseFloat(food || '0') + 
           parseFloat(transportation || '0') + 
           parseFloat(other || '0');
  };

  const calculateNetAmount = () => {
    return calculateTotalIncome() - calculateTotalExpenses();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Income & Expense Form</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Income Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary/Wages</Label>
              <Input
                id="salary"
                type="number"
                placeholder="0.00"
                value={formData.income.salary}
                onChange={(e) => handleChange(e, 'income', 'salary')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="other-income">Other Income</Label>
              <Input
                id="other-income"
                type="number"
                placeholder="0.00"
                value={formData.income.other}
                onChange={(e) => handleChange(e, 'income', 'other')}
              />
            </div>
            
            <div className="pt-2">
              <div className="flex justify-between font-medium">
                <span>Total Income:</span>
                <span>${calculateTotalIncome().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rent">Rent/Mortgage</Label>
              <Input
                id="rent"
                type="number"
                placeholder="0.00"
                value={formData.expenses.rent}
                onChange={(e) => handleChange(e, 'expenses', 'rent')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="utilities">Utilities</Label>
              <Input
                id="utilities"
                type="number"
                placeholder="0.00"
                value={formData.expenses.utilities}
                onChange={(e) => handleChange(e, 'expenses', 'utilities')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="food">Food</Label>
              <Input
                id="food"
                type="number"
                placeholder="0.00"
                value={formData.expenses.food}
                onChange={(e) => handleChange(e, 'expenses', 'food')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transportation">Transportation</Label>
              <Input
                id="transportation"
                type="number"
                placeholder="0.00"
                value={formData.expenses.transportation}
                onChange={(e) => handleChange(e, 'expenses', 'transportation')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="other-expenses">Other Expenses</Label>
              <Input
                id="other-expenses"
                type="number"
                placeholder="0.00"
                value={formData.expenses.other}
                onChange={(e) => handleChange(e, 'expenses', 'other')}
              />
            </div>
            
            <div className="pt-2">
              <div className="flex justify-between font-medium">
                <span>Total Expenses:</span>
                <span>${calculateTotalExpenses().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between text-lg font-bold">
              <span>Net Amount:</span>
              <span className={calculateNetAmount() >= 0 ? 'text-green-600' : 'text-red-600'}>
                ${calculateNetAmount().toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </div>
  );
};

export default IncomeExpenseForm;

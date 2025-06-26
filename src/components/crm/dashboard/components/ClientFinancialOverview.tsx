
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface ClientFinancialOverviewProps {
  clientData: {
    totalDebt: number;
    monthlyIncome: number;
    monthlyExpenses: number;
  };
}

export const ClientFinancialOverview = ({ clientData }: ClientFinancialOverviewProps) => {
  const surplus = clientData.monthlyIncome - clientData.monthlyExpenses;
  const debtToIncomeRatio = (clientData.totalDebt / (clientData.monthlyIncome * 12)) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Debt:</span>
            <span className="font-medium">${clientData.totalDebt.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Monthly Income:</span>
            <span className="font-medium text-green-600">${clientData.monthlyIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Monthly Expenses:</span>
            <span className="font-medium text-red-600">${clientData.monthlyExpenses.toLocaleString()}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Monthly Surplus:</span>
            <div className="flex items-center gap-1">
              {surplus >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`font-medium ${surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(surplus).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Debt-to-Income Ratio:</span>
            <span className="font-medium">{debtToIncomeRatio.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(debtToIncomeRatio, 100)} className="h-2" />
          <p className="text-xs text-gray-500">
            {debtToIncomeRatio < 36 ? 'Good' : debtToIncomeRatio < 50 ? 'Acceptable' : 'High Risk'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

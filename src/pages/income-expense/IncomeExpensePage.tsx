
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  FileText,
  Calculator,
  PieChart,
  Upload,
  Download
} from 'lucide-react';

const IncomeExpensePage = () => {
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [surplusIncome, setSurplusIncome] = useState(0);

  const calculateSurplus = () => {
    const income = parseFloat(monthlyIncome) || 0;
    const expenses = parseFloat(monthlyExpenses) || 0;
    setSurplusIncome(income - expenses);
  };

  const clients = [
    {
      id: "1",
      name: "John Smith",
      income: 3200,
      expenses: 2800,
      surplus: 400,
      status: "Under Threshold",
      lastSubmission: "2024-06-20"
    },
    {
      id: "2", 
      name: "Sarah Johnson",
      income: 4500, 
      expenses: 3200,
      surplus: 1300,
      status: "Above Threshold",
      lastSubmission: "2024-06-18"
    },
    {
      id: "3",
      name: "Mike Wilson", 
      income: 2800,
      expenses: 2600,
      surplus: 200,
      status: "Under Threshold", 
      lastSubmission: "2024-06-15"
    }
  ];

  const getStatusColor = (status: string) => {
    return status === "Above Threshold" 
      ? "bg-red-100 text-red-800" 
      : "bg-green-100 text-green-800";
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Income & Expense Analysis</h1>
            <p className="text-gray-600 mt-1">AI-powered surplus income monitoring and predictive analysis for bankruptcy cases.</p>
          </div>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">+12 this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Above Threshold</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Requires review</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Surplus</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$428</div>
              <p className="text-xs text-muted-foreground">Monthly average</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews Due</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calculator">Surplus Calculator</TabsTrigger>
            <TabsTrigger value="clients">Client Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Predictive Analytics</TabsTrigger>
            <TabsTrigger value="forms">Monthly Forms</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Surplus Income Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="monthly-income">Monthly Income</Label>
                    <Input
                      id="monthly-income"
                      type="number"
                      placeholder="Enter monthly income"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="monthly-expenses">Monthly Expenses</Label>
                    <Input
                      id="monthly-expenses"
                      type="number"
                      placeholder="Enter monthly expenses"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={calculateSurplus} className="w-full">
                    Calculate Surplus
                  </Button>
                  
                  {surplusIncome !== 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Surplus Income:</span>
                        <span className={`text-2xl font-bold ${surplusIncome > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(surplusIncome).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {surplusIncome > 200 
                          ? "⚠️ Above threshold - may require increased payments"
                          : "✅ Within acceptable threshold"
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Threshold Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-green-700 mb-2">Standard Threshold</h3>
                      <p className="text-2xl font-bold text-green-600">$200/month</p>
                      <p className="text-sm text-gray-600">For single person household</p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-blue-700 mb-2">Family Threshold</h3>
                      <p className="text-2xl font-bold text-blue-600">$250+/month</p>
                      <p className="text-sm text-gray-600">Varies by family size</p>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Important Note</h4>
                      <p className="text-sm text-yellow-700">
                        Surplus income above thresholds may extend bankruptcy duration or require additional payments.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Client Surplus Income Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-lg">{client.name}</h3>
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Monthly Income:</span>
                          <p className="font-medium">${client.income}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Monthly Expenses:</span>
                          <p className="font-medium">${client.expenses}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Surplus Income:</span>
                          <p className="font-medium text-blue-600">${client.surplus}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Submission:</span>
                          <p className="font-medium">{client.lastSubmission}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <FileText className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule Review
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Export Data
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Predictive Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Interactive analytics dashboard</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Predictive trends, surplus income forecasting, and risk assessment charts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Monthly Income & Expense Forms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Automated Form Collection</h3>
                  <p className="text-gray-600 mb-6">
                    Streamlined monthly submission process with automated validation and document support.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Form
                    </Button>
                    <Button variant="outline">
                      Generate Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default IncomeExpensePage;

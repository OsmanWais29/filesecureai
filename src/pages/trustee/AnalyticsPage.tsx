
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react";

const TrusteeAnalyticsPage = () => {
  const caseData = [
    { month: 'Jan', completed: 12, active: 8, pending: 3 },
    { month: 'Feb', completed: 15, active: 10, pending: 2 },
    { month: 'Mar', completed: 18, active: 12, pending: 4 },
    { month: 'Apr', completed: 22, active: 15, pending: 1 },
    { month: 'May', completed: 25, active: 18, pending: 3 },
    { month: 'Jun', completed: 28, active: 20, pending: 2 }
  ];

  const riskData = [
    { name: 'Low Risk', value: 65, color: '#10B981' },
    { name: 'Medium Risk', value: 25, color: '#F59E0B' },
    { name: 'High Risk', value: 10, color: '#EF4444' }
  ];

  const complianceData = [
    { form: 'Form 47', compliance: 95, total: 45 },
    { form: 'Form 76', compliance: 88, total: 32 },
    { form: 'Form 31', compliance: 92, total: 28 },
    { form: 'Form 65', compliance: 85, total: 18 }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your practice performance and compliance metrics.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$127,340</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                8 new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-green-600">
                Above industry average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2 days</div>
              <p className="text-xs text-green-600">
                -0.8 days improvement
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Case Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Case Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={caseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10B981" name="Completed" />
                  <Bar dataKey="active" fill="#3B82F6" name="Active" />
                  <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Form Compliance Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceData.map((item) => (
                <div key={item.form} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{item.form}</h3>
                      <p className="text-sm text-gray-600">{item.total} forms processed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{item.compliance}%</div>
                      <p className="text-xs text-gray-600">Compliance Rate</p>
                    </div>
                    <Badge 
                      className={
                        item.compliance >= 90 
                          ? "bg-green-100 text-green-800" 
                          : item.compliance >= 80 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {item.compliance >= 90 ? "Excellent" : item.compliance >= 80 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Recent Compliance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-red-800">Form 47 - Missing Signature</h4>
                  <p className="text-sm text-red-600">Client: Sarah Johnson - Due in 2 days</p>
                </div>
                <Badge className="bg-red-100 text-red-800">High Priority</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-yellow-800">Form 76 - Incomplete Financial Data</h4>
                  <p className="text-sm text-yellow-600">Client: Michael Chen - Due in 5 days</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-blue-800">Upcoming BIA Regulation Update</h4>
                  <p className="text-sm text-blue-600">Review required by June 30, 2024</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Info</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrusteeAnalyticsPage;

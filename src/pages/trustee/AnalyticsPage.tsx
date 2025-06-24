
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3,
  AlertTriangle,
  TrendingUp,
  FileText,
  Users,
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";

const TrusteeAnalyticsPage = () => {
  const riskMetrics = [
    { title: "High Risk Cases", value: "8", change: "+2 from last month", color: "text-red-600" },
    { title: "Medium Risk Cases", value: "15", change: "-3 from last month", color: "text-yellow-600" },
    { title: "Low Risk Cases", value: "42", change: "+5 from last month", color: "text-green-600" },
    { title: "Compliance Score", value: "94%", change: "+2% improvement", color: "text-blue-600" }
  ];

  const performanceMetrics = [
    { title: "Cases Completed", value: "127", icon: CheckCircle },
    { title: "Average Processing Time", value: "3.2 days", icon: Clock },
    { title: "Revenue Generated", value: "$347K", icon: DollarSign },
    { title: "Client Satisfaction", value: "96%", icon: Users }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Assessment & Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive analysis of cases, compliance, and performance metrics.</p>
          </div>
        </div>

        {/* Risk Assessment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {riskMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <AlertTriangle className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {performanceMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Risk Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Risk trend chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Performance metrics chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Risk Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { client: "John Smith", risk: "High", issue: "Missing financial statements", time: "2 hours ago" },
                { client: "Sarah Johnson", risk: "Medium", issue: "Incomplete Form 47", time: "4 hours ago" },
                { client: "Mike Wilson", risk: "High", issue: "Overdue documentation", time: "1 day ago" }
              ].map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{alert.client}</p>
                    <p className="text-sm text-gray-600">{alert.issue}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      alert.risk === "High" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {alert.risk} Risk
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrusteeAnalyticsPage;

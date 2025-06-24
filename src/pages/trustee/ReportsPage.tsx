
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileBarChart,
  Download,
  Calendar,
  TrendingUp,
  Users,
  AlertTriangle,
  FileText,
  DollarSign
} from "lucide-react";

const TrusteeReportsPage = () => {
  const reportTypes = [
    {
      title: "Monthly Compliance Report",
      description: "Comprehensive compliance status and risk assessment",
      icon: AlertTriangle,
      lastGenerated: "June 2024",
      color: "bg-red-500"
    },
    {
      title: "Client Activity Summary",
      description: "Overview of all client interactions and case progress",
      icon: Users,
      lastGenerated: "June 2024", 
      color: "bg-blue-500"
    },
    {
      title: "Document Processing Report",
      description: "Analysis of document processing efficiency and accuracy",
      icon: FileText,
      lastGenerated: "June 2024",
      color: "bg-green-500"
    },
    {
      title: "Revenue & Performance",
      description: "Financial performance and revenue analysis",
      icon: DollarSign,
      lastGenerated: "June 2024",
      color: "bg-purple-500"
    }
  ];

  const recentReports = [
    { name: "June 2024 Compliance Report", date: "2024-06-20", size: "2.4 MB", status: "Ready" },
    { name: "Client Activity - Q2 2024", date: "2024-06-18", size: "1.8 MB", status: "Ready" },
    { name: "Document Analysis Summary", date: "2024-06-15", size: "3.2 MB", status: "Generating" },
    { name: "Risk Assessment Report", date: "2024-06-12", size: "2.1 MB", status: "Ready" }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Generate comprehensive reports for compliance, performance, and analysis.</p>
          </div>
          <Button className="gap-2">
            <FileBarChart className="h-4 w-4" />
            Generate Custom Report
          </Button>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${report.color} text-white`}>
                    <report.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Last: {report.lastGenerated}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                    <Button size="sm">
                      Generate Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileBarChart className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-gray-600">{report.date} • {report.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      report.status === "Ready" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {report.status}
                    </span>
                    {report.status === "Ready" && (
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Report Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-green-600">Reports generated this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-blue-600">Automated reports active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">284</div>
              <p className="text-xs text-gray-600">Total downloads this month</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default TrusteeReportsPage;

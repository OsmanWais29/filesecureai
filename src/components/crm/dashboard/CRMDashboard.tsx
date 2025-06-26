
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail,
  MapPin,
  DollarSign,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { ClientMetricsCard } from './components/ClientMetricsCard';
import { RecentActivitiesCard } from './components/RecentActivitiesCard';
import { UpcomingTasksCard } from './components/UpcomingTasksCard';
import { DocumentStatusCard } from './components/DocumentStatusCard';
import { ClientFinancialOverview } from './components/ClientFinancialOverview';
import { CommunicationHub } from './components/CommunicationHub';

// Mock client data - in real app this would come from props or context
const mockClientData = {
  id: "client-001",
  name: "John Smith",
  email: "john.smith@example.com",
  phone: "(555) 123-4567",
  address: "123 Main Street, Toronto, ON M5V 3A8",
  caseType: "Consumer Proposal",
  status: "Active",
  riskLevel: "Medium",
  assignedTrustee: "Jane Doe",
  lastContact: "2024-06-20",
  nextAppointment: "2024-06-28 10:00 AM",
  caseProgress: 65,
  totalDebt: 45000,
  monthlyIncome: 3200,
  monthlyExpenses: 2800,
  engagementScore: 85
};

export const CRMDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Client Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {mockClientData.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{mockClientData.name}</h1>
              <p className="text-gray-600">{mockClientData.caseType} • ID: {mockClientData.id}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className={getStatusColor(mockClientData.status)}>
                  {mockClientData.status}
                </Badge>
                <Badge className={getRiskColor(mockClientData.riskLevel)}>
                  {mockClientData.riskLevel} Risk
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="h-4 w-4" />
              Call
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ClientMetricsCard 
          title="Case Progress"
          value={`${mockClientData.caseProgress}%`}
          icon={TrendingUp}
          progress={mockClientData.caseProgress}
          color="blue"
        />
        <ClientMetricsCard 
          title="Engagement Score"
          value={`${mockClientData.engagementScore}%`}
          icon={CheckCircle2}
          progress={mockClientData.engagementScore}
          color="green"
        />
        <ClientMetricsCard 
          title="Monthly Surplus"
          value={`$${(mockClientData.monthlyIncome - mockClientData.monthlyExpenses).toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
        <ClientMetricsCard 
          title="Days Since Contact"
          value="6"
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{mockClientData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{mockClientData.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{mockClientData.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Trustee: {mockClientData.assignedTrustee}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Next: {mockClientData.nextAppointment}</span>
              </div>
            </CardContent>
          </Card>

          {/* Financial Overview */}
          <ClientFinancialOverview clientData={mockClientData} />

          {/* Communication Hub */}
          <CommunicationHub clientId={mockClientData.id} />
        </div>

        {/* Center Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Recent Activities */}
          <RecentActivitiesCard clientId={mockClientData.id} />

          {/* Document Status */}
          <DocumentStatusCard clientId={mockClientData.id} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upcoming Tasks */}
          <UpcomingTasksCard clientId={mockClientData.id} />

          {/* Case Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Case Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Initial Consultation Completed</p>
                    <p className="text-xs text-gray-500">June 15, 2024</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Form 47 Submitted</p>
                    <p className="text-xs text-gray-500">June 18, 2024</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Awaiting Financial Documents</p>
                    <p className="text-xs text-gray-500">In Progress</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

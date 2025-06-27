
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/client-portal/StatusBadge";
import { 
  FileText, 
  CheckSquare, 
  Calendar, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  User,
  Phone,
  Mail
} from "lucide-react";

interface DashboardStats {
  totalDocuments: number;
  pendingTasks: number;
  upcomingAppointments: number;
  recentActivity: string;
}

interface RecentActivity {
  id: string;
  type: 'document' | 'task' | 'appointment';
  title: string;
  date: string;
  status: string;
}

export const ClientDashboard = () => {
  const { user } = useAuthState();
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    pendingTasks: 0,
    upcomingAppointments: 0,
    recentActivity: ''
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    setTimeout(() => {
      setStats({
        totalDocuments: 8,
        pendingTasks: 3,
        upcomingAppointments: 2,
        recentActivity: 'Form 47 reviewed'
      });
      setRecentActivities([
        {
          id: "1",
          type: "document",
          title: "Income Statement uploaded",
          date: "2024-01-15",
          status: "completed"
        },
        {
          id: "2",
          type: "task",
          title: "Review consumer proposal",
          date: "2024-01-14",
          status: "pending"
        },
        {
          id: "3",
          type: "appointment",
          title: "Initial consultation scheduled",
          date: "2024-01-13",
          status: "scheduled"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'task': return CheckSquare;
      case 'appointment': return Calendar;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.user_metadata?.full_name || 'Client'}
              </h1>
              <p className="text-gray-600 mt-1">
                Here's an overview of your case progress and upcoming items.
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</div>
              <p className="text-xs text-gray-600">Documents in your case</p>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</div>
              <p className="text-xs text-gray-600">Items requiring attention</p>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</div>
              <p className="text-xs text-gray-600">Scheduled meetings</p>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Case Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <StatusBadge status="Active" size="sm" />
              <p className="text-xs text-gray-600 mt-1">Consumer proposal</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Recent Activity</CardTitle>
                <CardDescription className="text-gray-600">
                  Latest updates on your case
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 border">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={activity.status} size="sm" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Documents
                </Button>
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50" size="sm">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  View Tasks
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Your Trustee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sarah Johnson, LIT</p>
                    <p className="text-xs text-gray-600">Licensed Insolvency Trustee</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    (416) 555-0123
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    sarah.johnson@trustee.com
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;


import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Bell,
  TrendingUp,
  User,
  Phone,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DashboardMetrics {
  totalDocuments: number;
  pendingTasks: number;
  completedTasks: number;
  upcomingAppointments: number;
  unreadNotifications: number;
}

interface RecentActivity {
  id: string;
  type: 'document' | 'task' | 'appointment' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface TrusteeInfo {
  name: string;
  email: string;
  phone?: string;
}

export const ClientDashboard = () => {
  const { user } = useAuthState();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [trusteeInfo, setTrusteeInfo] = useState<TrusteeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch metrics in parallel
      const [documentsRes, tasksRes, appointmentsRes, notificationsRes, trusteeRes] = await Promise.all([
        supabase
          .from('documents')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_folder', false),
        supabase
          .from('client_tasks')
          .select('id, status')
          .eq('client_id', user.id),
        supabase
          .from('meetings')
          .select('id, start_time')
          .eq('client_id', user.id)
          .gte('start_time', new Date().toISOString()),
        supabase
          .from('user_notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('read', false),
        supabase
          .from('client_trustee_relationships')
          .select(`
            trustee_id,
            profiles!client_trustee_relationships_trustee_id_fkey (
              full_name,
              email,
              phone
            )
          `)
          .eq('client_id', user.id)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle()
      ]);

      // Process metrics
      const documents = documentsRes.data || [];
      const tasks = tasksRes.data || [];
      const appointments = appointmentsRes.data || [];
      const notifications = notificationsRes.data || [];

      const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;

      setMetrics({
        totalDocuments: documents.length,
        pendingTasks,
        completedTasks,
        upcomingAppointments: appointments.length,
        unreadNotifications: notifications.length
      });

      // Set trustee info
      if (trusteeRes.data?.profiles) {
        const profile = trusteeRes.data.profiles as any;
        setTrusteeInfo({
          name: profile.full_name || 'Your Trustee',
          email: profile.email || '',
          phone: profile.phone
        });
      }

      // Fetch recent activity
      await fetchRecentActivity();

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    if (!user) return;

    try {
      // Get recent documents
      const { data: recentDocs } = await supabase
        .from('documents')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .eq('is_folder', false)
        .order('created_at', { ascending: false })
        .limit(3);

      // Get recent tasks
      const { data: recentTasks } = await supabase
        .from('client_tasks')
        .select('id, title, status, created_at')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Combine and sort activities
      const activities: RecentActivity[] = [];

      (recentDocs || []).forEach(doc => {
        activities.push({
          id: doc.id,
          type: 'document',
          title: 'Document uploaded',
          description: doc.title,
          timestamp: doc.created_at
        });
      });

      (recentTasks || []).forEach(task => {
        activities.push({
          id: task.id,
          type: 'task',
          title: 'Task assigned',
          description: task.title,
          timestamp: task.created_at,
          status: task.status
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setRecentActivity(activities.slice(0, 5));
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'task': return <CheckCircle2 className="h-4 w-4" />;
      case 'appointment': return <Calendar className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return 'Unknown';
    }
  };

  const getTaskProgress = () => {
    if (!metrics) return 0;
    const total = metrics.pendingTasks + metrics.completedTasks;
    return total > 0 ? (metrics.completedTasks / total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader className="h-20 bg-muted rounded"></CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchDashboardData} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your case progress.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total documents uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.pendingTasks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tasks requiring action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.upcomingAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Upcoming meetings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.unreadNotifications || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unread messages
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Case Progress
            </CardTitle>
            <CardDescription>
              Your current progress through assigned tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Tasks Completed</span>
                <span>{metrics?.completedTasks || 0} of {(metrics?.completedTasks || 0) + (metrics?.pendingTasks || 0)}</span>
              </div>
              <Progress value={getTaskProgress()} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{metrics?.completedTasks || 0}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{metrics?.pendingTasks || 0}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates on your case
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1 text-muted-foreground">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    {activity.status && (
                      <Badge variant="outline" className="text-xs">
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trustee Contact Info */}
      {trusteeInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Trustee
            </CardTitle>
            <CardDescription>
              Contact information for your assigned trustee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="font-medium">{trusteeInfo.name}</div>
                <div className="text-sm text-muted-foreground">Licensed Insolvency Trustee</div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{trusteeInfo.email}</span>
              </div>
              {trusteeInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{trusteeInfo.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks you might need to do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/portal/documents')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              View Documents
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/portal/tasks')}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Check Tasks
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/portal/appointments')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              View Appointments
            </Button>
            <Button 
              variant="outline" 
              disabled
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Contact Trustee
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

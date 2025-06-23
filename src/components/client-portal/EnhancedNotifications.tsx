
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Calendar, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationItem {
  id: string;
  type: 'document' | 'appointment' | 'task' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  documentUpdates: boolean;
  appointmentReminders: boolean;
  paymentDue: boolean;
  taskAssignments: boolean;
}

export const EnhancedNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    sms: false,
    push: true,
    inApp: true,
    documentUpdates: true,
    appointmentReminders: true,
    paymentDue: true,
    taskAssignments: true
  });
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const mockNotifications: NotificationItem[] = [
      {
        id: '1',
        type: 'document',
        title: 'New Document Available',
        message: 'Your Form 47 has been processed and is ready for review',
        timestamp: '2025-01-10T10:30:00Z',
        priority: 'high',
        read: false,
        actionUrl: '/documents/form-47',
        actionLabel: 'View Document'
      },
      {
        id: '2',
        type: 'appointment',
        title: 'Upcoming Appointment',
        message: 'Reminder: Meeting with trustee tomorrow at 2:00 PM',
        timestamp: '2025-01-09T14:00:00Z',
        priority: 'medium',
        read: false,
        actionUrl: '/appointments',
        actionLabel: 'View Details'
      },
      {
        id: '3',
        type: 'payment',
        title: 'Payment Due Soon',
        message: 'Monthly payment of $450 is due in 3 days',
        timestamp: '2025-01-08T09:15:00Z',
        priority: 'high',
        read: true,
        actionUrl: '/payments',
        actionLabel: 'Make Payment'
      },
      {
        id: '4',
        type: 'task',
        title: 'Task Completed',
        message: 'Income statement submission has been marked as complete',
        timestamp: '2025-01-07T16:45:00Z',
        priority: 'low',
        read: true
      }
    ];

    setNotifications(mockNotifications);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    toast.success('Notification marked as read');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const updateSettings = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Notification settings updated');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'appointment': return <Calendar className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'payment': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'priority') return n.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        <Button onClick={markAllAsRead} variant="outline" size="sm">
          Mark All Read
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'unread', 'priority'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f as any)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 ${!notification.read ? 'bg-accent/20' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        {notification.actionUrl && (
                          <Button size="sm" variant="outline">
                            {notification.actionLabel}
                          </Button>
                        )}
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Delivery Methods */}
          <div className="space-y-4">
            <h4 className="font-medium">Delivery Methods</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Label htmlFor="email">Email</Label>
                </div>
                <Switch
                  id="email"
                  checked={settings.email}
                  onCheckedChange={(checked) => updateSettings('email', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <Label htmlFor="sms">SMS</Label>
                </div>
                <Switch
                  id="sms"
                  checked={settings.sms}
                  onCheckedChange={(checked) => updateSettings('sms', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="push">Push Notifications</Label>
                </div>
                <Switch
                  id="push"
                  checked={settings.push}
                  onCheckedChange={(checked) => updateSettings('push', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <Label htmlFor="inApp">In-App</Label>
                </div>
                <Switch
                  id="inApp"
                  checked={settings.inApp}
                  onCheckedChange={(checked) => updateSettings('inApp', checked)}
                />
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="font-medium">Notification Types</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="documentUpdates">Document Updates</Label>
                <Switch
                  id="documentUpdates"
                  checked={settings.documentUpdates}
                  onCheckedChange={(checked) => updateSettings('documentUpdates', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="appointmentReminders">Appointment Reminders</Label>
                <Switch
                  id="appointmentReminders"
                  checked={settings.appointmentReminders}
                  onCheckedChange={(checked) => updateSettings('appointmentReminders', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="paymentDue">Payment Due Notices</Label>
                <Switch
                  id="paymentDue"
                  checked={settings.paymentDue}
                  onCheckedChange={(checked) => updateSettings('paymentDue', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="taskAssignments">Task Assignments</Label>
                <Switch
                  id="taskAssignments"
                  checked={settings.taskAssignments}
                  onCheckedChange={(checked) => updateSettings('taskAssignments', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

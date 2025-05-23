
import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { toString } from '@/utils/typeSafetyUtils';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
  priority?: string;
  action_url?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  category: NotificationCategory;
}

type NotificationCategory = 'file' | 'security' | 'task' | 'subscription' | 'reminder';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const processedNotifications: Notification[] = (data || []).map((item: any) => ({
        id: toString(item.id),
        title: toString(item.title),
        message: toString(item.message),
        type: toString(item.type),
        created_at: toString(item.created_at),
        read: Boolean(item.read),
        priority: toString(item.priority),
        action_url: toString(item.action_url),
        icon: toString(item.icon),
        metadata: item.metadata || {},
        category: getCategoryFromType(toString(item.type))
      }));

      setNotifications(processedNotifications);
      setUnreadCount(processedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromType = (type: string): NotificationCategory => {
    if (type.includes('file') || type.includes('document')) return 'file';
    if (type.includes('security') || type.includes('breach')) return 'security';
    if (type.includes('task') || type.includes('assignment')) return 'task';
    if (type.includes('subscription') || type.includes('trial')) return 'subscription';
    if (type.includes('reminder') || type.includes('deadline')) return 'reminder';
    return 'file'; // default
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    const icons = {
      file: '📁',
      security: '🛡️',
      task: '✅',
      subscription: '💳',
      reminder: '⏰'
    };
    return icons[category] || '📬';
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:w-96 p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notifications
            </p>
          </div>
          
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                      !notification.read ? getPriorityColor(notification.priority) : 'border-l-gray-200'
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {notification.icon || getCategoryIcon(notification.category)}
                          </span>
                          <CardTitle className="text-sm font-medium">
                            {notification.title}
                          </CardTitle>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm mb-2">
                        {notification.message}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {new Date(notification.created_at).toLocaleDateString()} at{' '}
                          {new Date(notification.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        
                        {notification.priority && (
                          <Badge variant="outline" className="text-xs">
                            {notification.priority}
                          </Badge>
                        )}
                      </div>
                      
                      {notification.action_url && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 mt-2 h-auto text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(notification.action_url, '_blank');
                          }}
                        >
                          View Details →
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

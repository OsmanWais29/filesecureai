
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, FileText, Calendar, Phone, Mail, User } from 'lucide-react';

interface RecentActivitiesCardProps {
  clientId: string;
}

export const RecentActivitiesCard = ({ clientId }: RecentActivitiesCardProps) => {
  // Mock activities - in real app this would be fetched based on clientId
  const activities = [
    {
      id: '1',
      type: 'document',
      title: 'Form 47 Uploaded',
      description: 'Consumer proposal form submitted',
      timestamp: '2 hours ago',
      icon: FileText,
      status: 'completed'
    },
    {
      id: '2',
      type: 'meeting',
      title: 'Follow-up Call',
      description: 'Discussed financial documentation',
      timestamp: '1 day ago',
      icon: Phone,
      status: 'completed'
    },
    {
      id: '3',
      type: 'email',
      title: 'Email Sent',
      description: 'Requested additional bank statements',
      timestamp: '2 days ago',
      icon: Mail,
      status: 'completed'
    },
    {
      id: '4',
      type: 'appointment',
      title: 'Appointment Scheduled',
      description: 'Document review meeting',
      timestamp: '3 days ago',
      icon: Calendar,
      status: 'scheduled'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-1 bg-white rounded border">
                  <IconComponent className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <Badge className={getStatusColor(activity.status)} variant="secondary">
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

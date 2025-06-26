
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, FileText, Calendar, MessageSquare } from "lucide-react";

interface ActivityItem {
  id: number;
  type: 'email' | 'form' | 'call' | 'meeting' | 'message';
  title: string;
  description: string;
  date: string;
  time: string;
}

const activityData: ActivityItem[] = [
  {
    id: 1,
    type: 'email',
    title: 'Email opened',
    description: 'Monthly Newsletter',
    date: '6/26/2025',
    time: '12:58:06 PM'
  },
  {
    id: 2,
    type: 'form',
    title: 'Form submitted',
    description: 'Contact Request',
    date: '6/24/2025',
    time: '2:58:06 PM'
  },
  {
    id: 3,
    type: 'call',
    title: 'Call completed',
    description: 'Initial consultation',
    date: '6/19/2025',
    time: '2:58:06 PM'
  },
  {
    id: 4,
    type: 'meeting',
    title: 'Meeting booked',
    description: 'Financial planning session',
    date: '6/12/2025',
    time: '2:58:06 PM'
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'email':
      return <Mail className="h-4 w-4 text-blue-600" />;
    case 'form':
      return <FileText className="h-4 w-4 text-green-600" />;
    case 'call':
      return <Phone className="h-4 w-4 text-orange-600" />;
    case 'meeting':
      return <Calendar className="h-4 w-4 text-purple-600" />;
    case 'message':
      return <MessageSquare className="h-4 w-4 text-indigo-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
};

const getActivityBadgeColor = (type: string) => {
  switch (type) {
    case 'email':
      return 'bg-blue-100 text-blue-800';
    case 'form':
      return 'bg-green-100 text-green-800';
    case 'call':
      return 'bg-orange-100 text-orange-800';
    case 'meeting':
      return 'bg-purple-100 text-purple-800';
    case 'message':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const ClientActivityTimeline = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-blue-600">
            Client Activity Timeline
          </CardTitle>
          <p className="text-gray-600 mt-2">
            View all interactions, communications, and events related to John Doe.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityData.map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(activity.type)}
                        <h3 className="font-semibold text-blue-600">
                          {activity.title}: {activity.description}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500">
                        {activity.date}, {activity.time}
                      </p>
                    </div>
                    
                    <Badge className={getActivityBadgeColor(activity.type)}>
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

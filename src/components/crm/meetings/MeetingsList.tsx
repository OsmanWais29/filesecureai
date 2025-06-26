
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Video, Phone, MapPin, Edit, Trash2, CheckCircle } from "lucide-react";
import { MeetingData } from "@/types/client";

interface MeetingsListProps {
  meetings: MeetingData[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (meeting: MeetingData) => void;
  onDelete: (meeting: MeetingData) => void;
  onStatusChange: (meetingId: string, status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled') => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getMeetingIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'phone':
      return <Phone className="h-4 w-4" />;
    case 'in_person':
      return <MapPin className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

export const MeetingsList: React.FC<MeetingsListProps> = ({
  meetings,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading meetings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Meetings</h2>
          <p className="text-gray-600 mt-1">Schedule and manage meetings with your clients</p>
        </div>
        <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings scheduled</h3>
            <p className="text-gray-500 text-center mb-4">
              Get started by scheduling your first meeting with a client.
            </p>
            <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
              Schedule Meeting
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {getMeetingIcon(meeting.meeting_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {meeting.client_name || 'Client'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(meeting.start_time).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(meeting.status)}>
                    {meeting.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {meeting.description && (
                  <p className="text-gray-600 mb-4">{meeting.description}</p>
                )}
                
                {meeting.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <MapPin className="h-4 w-4" />
                    {meeting.location}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(meeting)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    {meeting.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStatusChange(meeting.id, 'completed')}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Complete
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(meeting)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Duration: {meeting.duration || 60} minutes
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

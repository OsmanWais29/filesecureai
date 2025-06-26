
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Video, Phone, MapPin, ExternalLink, Share2, Copy } from "lucide-react";
import { MeetingData } from "@/types/client";
import { useToast } from "@/hooks/use-toast";

interface MeetingsListProps {
  meetings: MeetingData[];
  isLoading: boolean;
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
      return <Video className="h-4 w-4" />;
  }
};

// Mock data for demonstration
const mockMeetings: MeetingData[] = [
  {
    id: '1',
    title: 'Initial Consultation - John Smith',
    description: 'Discuss bankruptcy options and financial assessment',
    start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    client_id: 'client-001',
    client_name: 'John Smith',
    status: 'scheduled',
    meeting_type: 'video',
    meeting_url: 'https://zoom.us/j/123456789',
    location: 'Virtual Meeting'
  },
  {
    id: '2',
    title: 'Follow-up Meeting - Sarah Johnson',
    description: 'Review submitted documents and next steps',
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    client_id: 'client-002',
    client_name: 'Sarah Johnson',
    status: 'scheduled',
    meeting_type: 'phone',
    meeting_url: 'tel:+1234567890',
    location: 'Phone Call'
  },
  {
    id: '3',
    title: 'Document Signing - Mike Davis',
    description: 'Sign bankruptcy papers and finalize process',
    start_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 2 days from now
    end_time: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    client_id: 'client-003',
    client_name: 'Mike Davis',
    status: 'scheduled',
    meeting_type: 'in_person',
    location: '123 Main St, Toronto, ON'
  }
];

export const MeetingsList: React.FC<MeetingsListProps> = ({
  meetings,
  isLoading
}) => {
  const { toast } = useToast();
  
  // Use mock data if no meetings are provided
  const displayMeetings = meetings.length > 0 ? meetings : mockMeetings;

  const handleJoinMeeting = (meeting: MeetingData) => {
    if (meeting.meeting_url) {
      window.open(meeting.meeting_url, '_blank');
      toast({
        title: "Joining Meeting",
        description: `Opening ${meeting.title} in a new tab`,
      });
    } else {
      toast({
        title: "No Meeting Link",
        description: "This meeting doesn't have a join link available",
        variant: "destructive"
      });
    }
  };

  const handleShareMeeting = async (meeting: MeetingData) => {
    const meetingDetails = `
Meeting: ${meeting.title}
Date: ${new Date(meeting.start_time).toLocaleString()}
${meeting.meeting_url ? `Join: ${meeting.meeting_url}` : ''}
${meeting.description ? `Description: ${meeting.description}` : ''}
    `.trim();

    try {
      await navigator.clipboard.writeText(meetingDetails);
      toast({
        title: "Meeting Details Copied",
        description: "Meeting information copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to Copy",
        description: "Could not copy meeting details",
        variant: "destructive"
      });
    }
  };

  const handleSendToClient = (meeting: MeetingData) => {
    const subject = encodeURIComponent(`Meeting Invitation: ${meeting.title}`);
    const body = encodeURIComponent(`
Dear ${meeting.client_name || 'Client'},

You are invited to join our meeting:

Title: ${meeting.title}
Date: ${new Date(meeting.start_time).toLocaleString()}
${meeting.meeting_url ? `Join Link: ${meeting.meeting_url}` : ''}
${meeting.description ? `Description: ${meeting.description}` : ''}

Please join the meeting at the scheduled time.

Best regards,
Your Trustee
    `);

    window.open(`mailto:?subject=${subject}&body=${body}`);
    toast({
      title: "Email Client Opened",
      description: "Meeting invitation ready to send to client",
    });
  };

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
          <p className="text-gray-600 mt-1">Join meetings and share links with your clients</p>
        </div>
      </div>

      <div className="grid gap-4">
        {displayMeetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {getMeetingIcon(meeting.meeting_type || 'video')}
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
                    onClick={() => handleJoinMeeting(meeting)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Join Meeting
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareMeeting(meeting)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Details
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendToClient(meeting)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Send to Client
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
    </div>
  );
};

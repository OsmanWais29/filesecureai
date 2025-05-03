
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface UpcomingMeetingsProps {
  clientName?: string;
}

export const UpcomingMeetings = ({ clientName }: UpcomingMeetingsProps) => {
  // Mock upcoming meetings - filtered for specific client if clientName is provided
  const allMeetings = [
    { 
      id: "1", 
      title: "Initial Consultation", 
      client: "John Doe",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
      time: "10:00 AM",
      duration: 45,
      type: "video",
      participants: 2
    },
    { 
      id: "2", 
      title: "Financial Review", 
      client: "Jane Smith",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
      time: "2:30 PM",
      duration: 60,
      type: "video",
      participants: 3
    },
    { 
      id: "3", 
      title: "Document Review", 
      client: "John Doe",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4), // 4 days from now
      time: "11:15 AM",
      duration: 30,
      type: "video",
      participants: 2
    },
    { 
      id: "4", 
      title: "Follow-up Meeting", 
      client: "Robert Johnson",
      date: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
      time: "4:00 PM",
      duration: 45,
      type: "video",
      participants: 4
    },
    { 
      id: "5", 
      title: "Plan Review", 
      client: "John Doe",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6), // 6 days from now
      time: "1:00 PM",
      duration: 60,
      type: "video",
      participants: 3
    }
  ];
  
  // Filter meetings based on clientName if provided
  const meetings = clientName 
    ? allMeetings.filter(m => m.client === clientName) 
    : allMeetings;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {clientName ? `${clientName}'s Upcoming Meetings` : "Upcoming Meetings"}
        </h2>
        <p className="text-muted-foreground">
          {clientName 
            ? `Scheduled meetings with ${clientName}` 
            : "All scheduled meetings with clients"}
        </p>
      </div>

      <div className="space-y-4">
        {meetings.length > 0 ? (
          meetings.map(meeting => (
            <Card key={meeting.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="bg-muted p-4 flex flex-col items-center justify-center md:w-1/4">
                  <div className="text-2xl font-bold">{meeting.date.getDate()}</div>
                  <div className="text-sm">{meeting.date.toLocaleString('default', { month: 'short' })}</div>
                  <div className="text-muted-foreground text-xs mt-2">
                    {formatDistanceToNow(meeting.date, { addSuffix: true })}
                  </div>
                </div>
                
                <CardContent className="flex-1 p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{meeting.title}</h3>
                      {!clientName && <p className="text-muted-foreground">{meeting.client}</p>}
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{meeting.time} ({meeting.duration} min)</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <span>Video Call</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{meeting.participants} participants</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3 md:mt-0">
                      <Button variant="outline" size="sm">Reschedule</Button>
                      <Button size="sm">Join Meeting</Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-medium text-lg">No upcoming meetings</h3>
                <p className="text-muted-foreground mb-4">
                  {clientName 
                    ? `You don't have any scheduled meetings with ${clientName}` 
                    : "You don't have any scheduled meetings"}
                </p>
                <Button>Schedule a Meeting</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
